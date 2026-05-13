/**
 * 核心启动入口
 * 修复因漏掉 i18n 挂载导致的全局崩溃（白屏）
 */
import './appInit.js';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n'; // 补回多语言

const app = createApp(App);

// 必须按顺序挂载所有插件
app.use(i18n); 
app.use(store);
app.use(router);

app.mount('#app');

console.log('App successfully mounted with i18n');