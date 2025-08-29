

import { createI18n } from 'vue-i18n';

// 创建最基本的 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      common: {
        appName: 'EZ THEME',
        login: '登录',
        register: '注册',
        logout: '退出登录',
        email: '邮箱',
        password: '密码'
      }
    },
    'en-US': {
      common: {
        appName: 'EZ THEME',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password'
      }
    }
  },
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
});

// 语言包缓存
const languageCache = new Map();

// 加载指定语言包
const loadLanguageMessages = async (lang) => {
  try {
    // 检查缓存
    if (languageCache.has(lang)) {
      const cachedMessages = languageCache.get(lang);
      i18n.global.setLocaleMessage(lang, cachedMessages);
      console.log(`使用缓存的${lang}语言包`);
      return true;
    }

    // 先确保配置已加载
    const { SITE_CONFIG } = await import('@/utils/baseConfig');
    
    const langModule = await import(`./locales/${lang}.js`);
    if (langModule && langModule.default) {
      // 缓存语言包
      languageCache.set(lang, langModule.default);
      
      // 限制缓存大小
      if (languageCache.size > 8) {
        const firstKey = languageCache.keys().next().value;
        languageCache.delete(firstKey);
      }
      
      i18n.global.setLocaleMessage(lang, langModule.default);
      console.log(`${lang}语言包加载成功`);
      return true;
    }
  } catch (error) {
    console.warn(`加载${lang}语言包失败:`, error);
    return false;
  }
  return false;
};

// 加载中文语言包
const loadChineseMessages = async () => {
  return await loadLanguageMessages('zh-CN');
};

// 立即加载中文语言包
loadChineseMessages();

export const setLanguage = async (lang) => {
  try {
    if (!i18n || !i18n.global) {
      return { success: false, error: 'i18n instance not available' };
    }
    
    // 先加载对应语言包
    const loadSuccess = await loadLanguageMessages(lang);
    if (!loadSuccess) {
      console.warn(`语言包加载失败: ${lang}`);
      return { success: false, error: 'Language pack loading failed' };
    }
    
    i18n.global.locale.value = lang;
    
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.warn('保存语言失败:', error);
    }
    
    return { success: true };
  } catch (error) {
    console.error('设置语言失败:', error);
    return { success: false, error };
  }
};

export const updatePageTitle = () => {
  try {
    if (document && document.title !== undefined) {
      document.title = 'EZ THEME';
    }
  } catch (error) {
    console.warn('更新页面标题失败:', error);
  }
};

export const reloadMessages = async () => {
  // 重新加载当前语言包
  const currentLang = i18n.global.locale.value;
  await loadLanguageMessages(currentLang);
  return { success: true };
};

export default i18n;
