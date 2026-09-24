const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const configPath = path.resolve(__dirname, 'src/config/index.js');
const distPath = 'E:\\GitHub\\v2board\\public\\config.js';

try {
  let content = fs.readFileSync(configPath, 'utf-8');
  content = content.replace(/export\s+default\s+config\s*;?/g, '');
  content = content.replace(/window\.EZ_CONFIG/g, 'window.__SYS_CFG__');

  let finalContent = content;
  
  const obfuscationMatch = content.match(/enableObfuscation:\s*true/);
  const obfuscationOptionsMatch = content.match(/obfuscationOptions:\s*({[\s\S]*?})/);
  
  if (obfuscationMatch && obfuscationOptionsMatch) {
    const obfuscationOptionsStr = obfuscationOptionsMatch[1];
    const obfuscationOptions = eval(`(${obfuscationOptionsStr})`);
    
    console.log('[Obfuscator] 正在混淆 config.js...');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(content, obfuscationOptions);
    finalContent = obfuscationResult.getObfuscatedCode();
    console.log('[Obfuscator] 混淆成功!');
  } else {
    console.log('[Obfuscator] 未开启混淆，直接输出');
  }

  fs.writeFileSync(distPath, finalContent, 'utf-8');
  console.log(`[Success] 成功写入混淆后的文件到: ${distPath}`);
} catch (err) {
  console.error('[Error] 处理失败:', err);
}
