import disableDevtool from "disable-devtool";

const isProd = process.env.NODE_ENV === "production";
const enableConfigJS = process.env.VUE_APP_CONFIGJS == "true";
const enableAntiDebugging = process.env.VUE_APP_DEBUGGING == "true";

(async () => {
  if (!isProd || !enableConfigJS) {
    await import('./config/index.js');
  }
  
  // 确保配置完全加载
  if (typeof window !== 'undefined' && !window.EZ_CONFIG) {
    console.error('EZ_CONFIG not loaded properly');
    return;
  }
  
  // 调试：检查配置是否正确加载
  console.log('EZ_CONFIG loaded:', window.EZ_CONFIG);
  console.log('TRAFFICLOG_CONFIG:', window.EZ_CONFIG?.TRAFFICLOG_CONFIG);
  
  // 打包后开启反调试逻辑
  if(isProd && enableAntiDebugging) {
    disableDevtool()
  }
  
  // 确保配置加载完成后再初始化应用
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await import('./appInit.js');
})();
