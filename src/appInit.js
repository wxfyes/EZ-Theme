window.__VUE_OPTIONS_API__ = true;
window.__VUE_PROD_DEVTOOLS__ = false;
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import { MotionPlugin } from '@vueuse/motion';
import { useToast } from './composables/useToast';
import initPageTitle from './utils/exposeConfig';
import { handleUnauthorizedDomain } from './utils/domainChecker';

if (!handleUnauthorizedDomain()) {
  throw new Error('Unauthorized domain');
}

const initApp = async () => {
  try {
    initPageTitle();

    // 并行加载样式和应用初始化
    const [app, styles] = await Promise.all([
      createApp(App),
      import('./assets/styles/index.scss')
    ]);
    const toast = useToast();
    app.provide('$toast', toast);

    // 在应用挂载前确保语言包加载完成
    try {
      const { setLanguage } = await import('./i18n');
      const currentLang = localStorage.getItem('language') || 'zh-CN';
      await setLanguage(currentLang);
      console.log('应用启动时语言包加载完成:', currentLang);
    } catch (error) {
      console.warn('应用启动时语言包加载失败:', error);
    }

    app.use(router)
       .use(store)
       .use(i18n)
       .use(MotionPlugin);

    app.mount('#app');

    // 初始化用户信息
    await store.dispatch('initUserInfo');
    
    // 立即进行API可用性检测，确保API备选地址正常工作
    try {
      if (window.EZ_CONFIG && 
          window.EZ_CONFIG.API_CONFIG && 
          window.EZ_CONFIG.API_CONFIG.urlMode === 'static' &&
          Array.isArray(window.EZ_CONFIG.API_CONFIG.staticBaseUrl) &&
          window.EZ_CONFIG.API_CONFIG.staticBaseUrl.length > 1) {
        
        const { silentCheckApiAvailability } = await import('./utils/apiAvailabilityChecker');
        const availableUrl = await silentCheckApiAvailability();
        
        if (availableUrl) {
          // 设置全局可用URL
          window.EZ_CONFIG._AVAILABLE_API_URL = availableUrl;
        }
      }
    } catch (error) {
      console.error('❌ 应用启动时API可用性检测失败:', error);
    }
    
    // 如果用户已登录，重新加载语言包以确保加载完整版本
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token !== '') {
      try {
        // 延迟重新加载语言包，确保加载登录后的完整版本
        setTimeout(async () => {
          try {
            const { setLanguage } = await import('./i18n');
            const currentLang = localStorage.getItem('language') || 'zh-CN';
            await setLanguage(currentLang);
            console.log('登录后重新加载语言包完成');
          } catch (error) {
            console.warn('重新加载语言包失败:', error);
          }
        }, 200);
      } catch (error) {
        console.warn('语言包模块导入失败:', error);
      }
    }
    
    // 应用挂载完成后立即隐藏加载状态
    if (window.hideAppLoading) {
      window.hideAppLoading();
    } else {
      // 如果没有 hideAppLoading 函数，直接隐藏加载元素
      const loadingElement = document.getElementById('app-loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('应用初始化失败:', error);
    
    // 如果初始化失败，尝试使用最基本的配置
    try {
      const app = createApp(App);
      const toast = useToast();
      app.provide('$toast', toast);
      app.use(router).use(store).use(i18n).use(MotionPlugin);
      app.mount('#app');
      
      // 初始化用户信息
      await store.dispatch('initUserInfo');
      
      // 应用挂载完成后立即隐藏加载状态
      if (window.hideAppLoading) {
        window.hideAppLoading();
      } else {
        // 如果没有 hideAppLoading 函数，直接隐藏加载元素
        const loadingElement = document.getElementById('app-loading');
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
      }
    } catch (fallbackError) {
      console.error('应用初始化完全失败:', fallbackError);
    }
  }
};

initApp();

window.router = router;
