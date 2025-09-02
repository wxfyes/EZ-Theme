import disableDevtool from "disable-devtool";

const isProd = process.env.NODE_ENV === "production";
const enableConfigJS = process.env.VUE_APP_CONFIGJS == "true";
const enableAntiDebugging = process.env.VUE_APP_DEBUGGING == "true";

(async () => {
  try {
    if (!isProd || !enableConfigJS) {
      const res = await import('./config/index.js');
      if (typeof window !== 'undefined') {
        window.EZ_CONFIG = res.config || res.default || res;
      }
    }
    
    // 反调试逻辑 - 使用更温和的配置
    if (isProd && enableAntiDebugging) {
      disableDevtool({
        ignore: ['console.log'], // 允许console.log
        disableMenu: true, // 禁用右键菜单
        clearLog: false, // 不清除日志
        disableSelect: false, // 允许选择文本
        disableCopy: false, // 允许复制
        disableCut: false, // 允许剪切
        disablePaste: false, // 允许粘贴
        blockDevTools: false, // 不强制阻止开发者工具
        ondevtoolopen: () => {
          console.warn('检测到开发者工具');
        }
      })
    }
    
    // ⚠️ 确保在 config 加载后再初始化应用
    await import('./appInit.js');
  } catch (error) {
    console.error(error);
  }
})();