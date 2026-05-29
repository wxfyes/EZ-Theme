const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const srcPath = path.resolve(__dirname, 'src/config/index.js');
const outputPath = path.resolve(__dirname, 'config.js');

try {
  let content = fs.readFileSync(srcPath, 'utf-8');
  
  // 移除 export default 语法以兼容普通 script 标签加载
  content = content.replace(/export\s+default\s+config\s*;?/g, "");
  content = content.replace(/window\.EZ_CONFIG/g, "window.__SYS_CFG__");
  
  // 确保全局变量赋值正确
  if (!content.includes('window.__SYS_CFG__')) {
    content += '\nwindow.__SYS_CFG__ = config;\n';
  }

  console.log('正在对 src/config/index.js 进行混淆加密...');
  
  // 调用混淆插件进行深度加密
  const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    splitStrings: true,
    splitStringsChunkLength: 10
  });

  const finalCode = obfuscationResult.getObfuscatedCode();
  
  fs.writeFileSync(outputPath, finalCode, 'utf-8');
  console.log('\n======================================');
  console.log('🎉 加密成功！');
  console.log('生成的文件已保存至: ' + outputPath);
  console.log('======================================\n');
  console.log('您可以直接使用此 config.js 覆盖服务器（如宝塔/网站根目录）下的 config.js 即可。');
} catch (error) {
  console.error('加密失败:', error);
}
