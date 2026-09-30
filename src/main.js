import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n, { setLanguage } from './i18n';
import { useToast } from './composables/useToast';
import initPageTitle from './utils/exposeConfig';
import './assets/styles/index.scss';

// 本地开发环境兜底：若未加载外部 config.js，自动载入源码配置，确保本地开发与生产远程表现 100% 一致
if (process.env.NODE_ENV !== 'production' && (!window.__SYS_CFG__ || Object.keys(window.__SYS_CFG__).length === 0)) {
  try {
    const localConfig = require('@/config/index.js').default;
    window.__SYS_CFG__ = localConfig;
  } catch (e) {
    console.warn('开发环境载入本地配置失败:', e);
  }
}

// 初始化页面标题与基础配置
initPageTitle();

const app = createApp(App);

// 提供全局 Toast 服务
const toast = useToast();
app.provide('$toast', toast);

// 挂载核心插件
app.use(i18n);
app.use(store);
app.use(router);

// 挂载应用到 DOM
app.mount('#app');

// 挂载完成后立即隐藏静态骨架加载动画
if (typeof window.hideAppLoading === 'function') {
  window.hideAppLoading();
} else {
  const loadingElement = document.getElementById('app-loading');
  if (loadingElement) loadingElement.style.display = 'none';
}

// 后台初始化用户信息
store.dispatch('initUserInfo');

// 确保初始语言匹配用户设定
const savedLang = localStorage.getItem('language') || 'zh-CN';
if (savedLang !== 'zh-CN') {
  setLanguage(savedLang).catch(err => console.warn('语言包初始化延迟:', err));
}

window.router = router;