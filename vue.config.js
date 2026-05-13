const { defineConfig } = require("@vue/cli-service");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const JavaScriptObfuscator = require("javascript-obfuscator");

const isProd = process.env.NODE_ENV === "production";
const enableConfigJS = process.env.VUE_APP_CONFIGJS == "true";

let extraScriptFileName = '';
const generateRandomFileName = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let name = "";
  for (let i = 0; i < length; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const randowNumber = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${randowNumber}.${name}.js`;
};

if (isProd && enableConfigJS) {
  extraScriptFileName = 'config.js';
}

module.exports = defineConfig({
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  productionSourceMap: false,
  
  configureWebpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, syncWebAssembly: true };
    config.resolve = { ...config.resolve, alias: { "@": path.resolve(__dirname, "src") } };
    
    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      })
    );
    
    if (isProd && enableConfigJS) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap("GenerateExtraConfigPlugin", () => {
            const configPath = path.resolve(__dirname, "src/config/index.js");
            const distPath = path.resolve(compiler.options.output.path, extraScriptFileName);
            
            try {
              let content = fs.readFileSync(configPath, "utf-8");
              content = content.replace(/export\s+default\s+config\s*;?/g, "");
              // 确保全局变量名正确
              content = content.replace(/window\.EZ_CONFIG/g, "window.__SYS_CFG__");
              
              // 检查配置文件中的混淆开关
              let finalContent = content;
              let isObfuscated = false;
              
              try {
                // 更加鲁棒的正则匹配
                const obfuscationMatch = content.match(/enableObfuscation:\s*true/);
                const obfuscationOptionsMatch = content.match(/obfuscationOptions:\s*({[\s\S]*?})/);
                
                if (obfuscationMatch && obfuscationOptionsMatch) {
                  // 启用混淆
                  const obfuscationOptionsStr = obfuscationOptionsMatch[1];
                  // 使用更加安全的方式解析选项，或者直接使用 eval
                  const obfuscationOptions = eval(`(${obfuscationOptionsStr})`);
                  
                  console.log(`[Obfuscator] 正在对 ${extraScriptFileName} 进行深度混淆...`);
                  const obfuscationResult = JavaScriptObfuscator.obfuscate(content, obfuscationOptions);
                  finalContent = obfuscationResult.getObfuscatedCode();
                  isObfuscated = true;
                  console.log(`[Obfuscator] 混淆成功: ${extraScriptFileName}`);
                } else {
                  console.log(`[Obfuscator] 未检测到混淆开启标记或选项，跳过混淆: ${extraScriptFileName}`);
                }
              } catch (err) {
                console.warn("[Obfuscator] 混淆过程出错，降级使用原代码:", err.message);
                finalContent = content;
              }
              
              // 写入 dist
              fs.writeFileSync(distPath, finalContent, "utf-8");
              
              // 同步更新 landingpage.html 中的引用
              const landingPath = path.resolve(compiler.options.output.path, "landingpage.html");
              if (fs.existsSync(landingPath)) {
                let landingContent = fs.readFileSync(landingPath, "utf-8");
                landingContent = landingContent.replace(/src="config\.js\?t=[^"]*"/g, `src="${extraScriptFileName}"`);
                fs.writeFileSync(landingPath, landingContent, "utf-8");
              }
            } catch (err) {
              console.warn("生成独立 JS 文件失败:", err);
            }
          });
        },
      });
    }
    
    if (isProd) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendors: { 
              name: "chunk-vendors", 
              test: /[\\/]node_modules[\\/]/, 
              priority: -10, 
              chunks: "initial" 
            },
            common: { 
              name: "chunk-common", 
              minChunks: 2, 
              priority: -20, 
              chunks: "initial", 
              reuseExistingChunk: true 
            },
          },
        },
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: { 
              compress: { drop_console: true, drop_debugger: true }, 
              mangle: true, 
              format: { comments: false, ascii_only: true } 
            },
            extractComments: false,
          }),
        ],
      };
    }
  },
  
  chainWebpack: (config) => {
    if (isProd) {
      const pluginName = "html-index";
      config.plugin(pluginName).tap((args) => {
        args[0].templateParameters = {
          ...args[0].templateParameters,
          injectCustomScript: `
            ${enableConfigJS ? `<script src="${extraScriptFileName}"></script>` : ""}
          `,
        };
        return args;
      });
    }
  },
  
  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass"),
        sassOptions: { 
          outputStyle: "expanded", 
          fiber: false, 
          indentedSyntax: false, 
          includePaths: ["node_modules"] 
        },
        additionalData: `@use "@/assets/styles/base/variables.scss" as *;`,
      },
    },
  },
  
  pages: {
    index: { 
      entry: "src/main.js", 
      template: "public/index.html", 
      filename: "index.html" 
    },
  },
  
  devServer: { 
    client: { overlay: false },
    proxy: {
      '/api': {
        target: 'https://154.219.104.214:2561',
        changeOrigin: true,
        secure: false, // 忽略自签名证书
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
});
