const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// 路径定义
const THEME_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(THEME_DIR, 'dist');
const V2BOARD_DIR = path.resolve(THEME_DIR, '../v2board');

const TARGET_THEME_EZ = path.join(V2BOARD_DIR, 'public/theme/ez');
const V2BOARD_PUBLIC = path.join(V2BOARD_DIR, 'public');

async function main() {
  const isClean = process.argv.includes('--clean');
  const basePath = '/theme/ez/';

  console.log(`🚀 [1/4] 开始构建 EZ-Theme 独立插件化生产产物 (Base: ${basePath})...`);
  
  // 注入环境变量确保静态资源绝对引用 /theme/ez/，脱离 public 根目录
  execSync('npm run build', {
    cwd: THEME_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      VUE_APP_PUBLIC_PATH: basePath,
    },
  });

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist 目录未生成，构建失败！');
    process.exit(1);
  }

  if (!fs.existsSync(V2BOARD_DIR)) {
    console.error(`❌ 未找到 v2board 项目目录: ${V2BOARD_DIR}`);
    process.exit(1);
  }

  console.log(`📦 [2/4] 同步产物至 v2board 主题目录 (${TARGET_THEME_EZ})...`);
  fs.ensureDirSync(TARGET_THEME_EZ);

  if (isClean) {
    console.log('🧹 正在清空 public/theme/ez 历史废弃文件...');
    fs.emptyDirSync(TARGET_THEME_EZ);
  }

  // 1:1 复制 dist 到 public/theme/ez
  fs.copySync(DIST_DIR, TARGET_THEME_EZ, { overwrite: true });

  console.log('⚙️ [3/4] 生成 v2board 主题配置文件与 Blade 模板...');

  // 1. 同步 config.json 供后台主题管理扫描并可视化配置
  const sourceConfigJson = path.join(THEME_DIR, 'config.json');
  if (fs.existsSync(sourceConfigJson)) {
    fs.copySync(sourceConfigJson, path.join(TARGET_THEME_EZ, 'config.json'), { overwrite: true });
    console.log('   -> 已同步 config.json (支持后台自由开启/关闭与客户端下载链接设置)');
  }

  // 2. 将 index.html 转换为 v2board 标准 dashboard.blade.php
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

    // 注入 window.settings 与 Blade 数据插槽
    const bladeSettings = `
    <script>
      window.settings = {
        title: '{{$title}}',
        theme: '{{$theme}}',
        version: '{{$version}}',
        description: '{{$description}}',
        logo: '{{$logo}}',
        theme_config: {!! json_encode($theme_config ?? []) !!}
      };
    </script>`;

    if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', `<head>${bladeSettings}`);
    } else {
      htmlContent = bladeSettings + htmlContent;
    }

    // 动态注入网站标题
    const dynamicTitleBlade = `<title>{{!empty($theme_config['site_name']) ? $theme_config['site_name'] : (!empty($title) ? $title : '控制台')}}</title>`;
    htmlContent = htmlContent.replace(/<title>.*?<\/title>/g, dynamicTitleBlade);

    // 动态注入网站 Logo / Favicon
    const dynamicFaviconBlade = `<link rel="icon" href="{{!empty($theme_config['site_logo']) ? $theme_config['site_logo'] : (!empty($logo) ? $logo : '/theme/ez/favicon.ico')}}" />`;
    htmlContent = htmlContent.replace(/<link rel="icon"[^>]*>/g, dynamicFaviconBlade);

    // 注入自定义页脚 HTML / 客服脚本
    const customHtmlSnippet = `\n    {!! $theme_config['custom_html'] ?? '' !!}\n  </body>`;
    htmlContent = htmlContent.replace('</body>', customHtmlSnippet);

    // 替换 config.js 为绝对主题路径
    htmlContent = htmlContent.replace(/src="(?:\.\/)?config\.js"/g, 'src="/theme/ez/config.js"');

    const bladeTarget = path.join(TARGET_THEME_EZ, 'dashboard.blade.php');
    fs.writeFileSync(bladeTarget, htmlContent, 'utf-8');
    console.log('   -> 已生成 dashboard.blade.php (深度联动 v2board 视图引擎)');
  }

  // 4. 清理 public 根目录历史遗留的污染文件 (回归纯净 Laravel 架构)
  console.log('🧹 [4/4] 治理与清理 public 根目录历史残留文件...');
  const filesToCleanInPublic = ['index.html', 'landingpage.html', 'world.json', 'config.js'];
  filesToCleanInPublic.forEach(file => {
    const targetFile = path.join(V2BOARD_PUBLIC, file);
    if (fs.existsSync(targetFile)) {
      try {
        fs.removeSync(targetFile);
        console.log(`   -> 已彻底移除 public/${file}`);
      } catch (e) {
        console.warn(`   -> 移除 public/${file} 失败:`, e.message);
      }
    }
  });

  console.log('✅ 部署完成！EZ-Theme 已成功插件化并 100% 收拢至 public/theme/ez/。');
  console.log('💡 现在可以在 v2board 后台【系统配置 -> 主题配置】中自由开启/关闭 EZ-Theme 并修改客户端下载链接！');
}

main().catch(err => {
  console.error('❌ 执行出错:', err);
  process.exit(1);
});
