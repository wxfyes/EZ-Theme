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

// 移除域名硬拦截以提升兼容性

const initApp = async () => {
  try {
    initPageTitle();

    // 创建应用
    const app = createApp(App);
    
    // 异步加载样式，不阻塞主逻辑
    import('./assets/styles/index.scss').catch(err => console.warn('样式加载延迟:', err));
    const toast = useToast();
    app.provide('$toast', toast);

    // 异步加载语言包，不阻塞主应用挂载
    import('./i18n').then(async ({ setLanguage }) => {
      let currentLang = 'zh-CN';
      try {
        currentLang = localStorage.getItem('language') || 'zh-CN';
      } catch (e) {
        console.warn('无法访问 localStorage');
      }
      await setLanguage(currentLang);
    }).catch(err => console.warn('语言包预加载失败:', err));

    app.use(router)
       .use(store)
       .use(i18n)
       .use(MotionPlugin);

    app.mount('#app');

    // 挂载完成后立即隐藏加载动画，实现秒开感官
    if (window.hideAppLoading) {
      window.hideAppLoading();
    } else {
      const loadingElement = document.getElementById('app-loading');
      if (loadingElement) loadingElement.style.display = 'none';
    }

    // 后台初始化用户信息，不阻塞首屏显示
    store.dispatch('initUserInfo');
    
    // API 检测已禁用，直连后端加速
    
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
    
    // 已在上方提前调用
  } catch (error) {
    console.error('应用初始化失败:', error);
    
    // 如果初始化失败，尝试使用最基本的配置
    try {
      const app = createApp(App);
      const toast = useToast();
      app.provide('$toast', toast);
      app.use(router).use(store).use(i18n).use(MotionPlugin);
      app.mount('#app');
      
      // 【关键修复】挂载完成后立即隐藏加载动画，不等待后续 API
      if (window.hideAppLoading) {
        window.hideAppLoading();
      } else {
        const loadingElement = document.getElementById('app-loading');
        if (loadingElement) loadingElement.style.display = 'none';
      }

      // 后台初始化用户信息，不阻塞首屏显示
      store.dispatch('initUserInfo');
    } catch (fallbackError) {
      console.error('应用初始化完全失败:', fallbackError);
    }
  }
};

initApp();

window.router = router;
