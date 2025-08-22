

import { createI18n } from 'vue-i18n';

// 创建最基本的 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      common: {
        appName: 'EZ THEME'
      }
    },
    'en-US': {
      common: {
        appName: 'EZ THEME'
      }
    }
  },
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
});

// 语言包缓存
const languageCache = new Map();

// 加载中文语言包
const loadChineseMessages = async () => {
  try {
    // 检查缓存
    if (languageCache.has('zh-CN')) {
      const cachedMessages = languageCache.get('zh-CN');
      i18n.global.setLocaleMessage('zh-CN', cachedMessages);
      console.log('使用缓存的中文语言包');
      return true;
    }

    // 先确保配置已加载
    const { SITE_CONFIG } = await import('@/utils/baseConfig');
    
    const zhCNModule = await import('./locales/zh-CN.js');
    if (zhCNModule && zhCNModule.default) {
      // 缓存语言包
      languageCache.set('zh-CN', zhCNModule.default);
      
      // 限制缓存大小
      if (languageCache.size > 5) {
        const firstKey = languageCache.keys().next().value;
        languageCache.delete(firstKey);
      }
      
      i18n.global.setLocaleMessage('zh-CN', zhCNModule.default);
      console.log('中文语言包加载成功');
      return true;
    }
  } catch (error) {
    console.warn('加载中文语言包失败:', error);
    
    // 如果动态导入失败，尝试手动添加基本的中文翻译
    try {
      const basicChineseMessages = {
        common: {
          appName: 'EZ THEME',
          login: '登录',
          register: '注册',
          logout: '退出登录',
          email: '邮箱',
          password: '密码',
          forgotPassword: '忘记密码？',
          rememberMe: '记住我',
          submit: '提交',
          cancel: '取消',
          save: '保存',
          delete: '删除',
          edit: '编辑',
          add: '添加',
          search: '搜索',
          filter: '筛选',
          refresh: '刷新',
          back: '返回',
          loading: '加载中...',
          success: '成功',
          error: '错误',
          warning: '警告',
          info: '信息',
          toggleTheme: '切换主题',
          language: '语言',
          noData: '暂无数据',
          confirm: '确认',
          dashboard: '仪表盘',
          profile: '个人资料',
          settings: '设置',
          help: '帮助',
          about: '关于',
          verificationCode: '验证码',
          sendCode: '发送验证码',
          verify: '验证',
          enterEmail: '请输入邮箱地址',
          enterVerificationCode: '请输入验证码',
          enterPassword: '请输入密码',
          copied: '已复制到剪贴板',
          userCenter: '用户中心',
          myWallet: '我的钱包',
          changePassword: '修改密码',
          logoutText: '退出登录',
          retry: '重试',
          copyFailed: '复制失败',
          page: '页',
          networkError: '网络错误',
          on: '开启',
          off: '关闭',
          copy: '复制',
          viewDetails: '查看详情',
          close: '关闭',
          error_occurred: '发生错误，请稍后重试',
          apiChecking: '正在检测API可用性...',
          checking: '正在检测',
          completed: '已完成'
        },
        auth: {
          loginTitle: '欢迎回来',
          loginSubtitle: '请登录您的账户',
          registerTitle: '创建账户',
          registerSubtitle: '注册一个新账户',
          emailPlaceholder: '请输入您的邮箱地址',
          passwordPlaceholder: '请输入您的密码',
          confirmPasswordPlaceholder: '请再次输入密码',
          emailVerificationSent: '验证码已发送至您的邮箱',
          emailVerificationFailed: '验证码发送失败',
          verificationCodePlaceholder: '请输入验证码',
          inviteCodePlaceholder: '请输入邀请码（可选）',
          forgotPasswordTitle: '找回密码',
          forgotPasswordSubtitle: '我们将发送验证码到您的邮箱',
          registerSuccess: '注册成功',
          registerFailed: '注册失败',
          loginSuccess: '登录成功',
          loginFailed: '登录失败',
          logoutSuccess: '登出成功',
          forgotPasswordSuccess: '重置密码邮件已发送',
          forgotPasswordFailed: '重置密码请求失败',
          alreadyLoggedIn: '您已经登录，即将跳转至仪表板',
          emailRequired: '请输入邮箱地址',
          passwordRequired: '请输入密码',
          passwordMinLength: '密码至少需要6位',
          passwordMismatch: '两次输入的密码不一致',
          verificationCodeRequired: '请输入验证码',
          verificationCodeInvalid: '验证码无效',
          inviteCodeInvalid: '邀请码无效',
          noAccount: '还没有账户？',
          createAccount: '创建账户',
          hasAccount: '已有账户？',
          loginAccount: '登录账户',
          backToLogin: '返回登录',
          resendCode: '重新发送验证码',
          resendCodeCountdown: '{time}秒后重新发送',
          agreeTerms: '我已阅读并同意',
          termsOfService: '服务条款',
          privacyPolicy: '隐私政策',
          and: '和',
          emailFormatInvalid: '邮箱格式不正确',
          passwordTooWeak: '密码强度太弱',
          passwordTooStrong: '密码强度太强',
          passwordContainsUsername: '密码不能包含用户名',
          passwordContainsEmail: '密码不能包含邮箱地址',
          passwordContainsCommonWords: '密码不能包含常见词汇',
          passwordContainsSequentialChars: '密码不能包含连续字符',
          passwordContainsRepeatedChars: '密码不能包含重复字符',
          passwordContainsSpecialChars: '密码必须包含特殊字符',
          passwordContainsNumbers: '密码必须包含数字',
          passwordContainsUppercase: '密码必须包含大写字母',
          passwordContainsLowercase: '密码必须包含小写字母',
          passwordLength: '密码长度必须在{min}到{max}位之间',
          passwordHistory: '密码不能与最近{count}次使用的密码相同',
          passwordExpired: '密码已过期，请修改密码',
          passwordLocked: '密码已被锁定，请联系管理员',
          passwordResetRequired: '需要重置密码',
          passwordResetExpired: '密码重置链接已过期',
          passwordResetInvalid: '密码重置链接无效',
          passwordResetSuccess: '密码重置成功',
          passwordResetFailed: '密码重置失败',
          passwordChangeSuccess: '密码修改成功',
          passwordChangeFailed: '密码修改失败',
          passwordChangeRequired: '需要修改密码',
          passwordChangeExpired: '密码修改链接已过期',
          passwordChangeInvalid: '密码修改链接无效',
          passwordChangeLocked: '密码修改已被锁定',
          passwordChangeHistory: '密码不能与最近{count}次使用的密码相同',
          passwordChangeWeak: '新密码强度太弱',
          passwordChangeStrong: '新密码强度太强',
          passwordChangeSame: '新密码不能与旧密码相同',
          passwordChangeUsername: '新密码不能包含用户名',
          passwordChangeEmail: '新密码不能包含邮箱地址',
          passwordChangeCommon: '新密码不能包含常见词汇',
          passwordChangeSequential: '新密码不能包含连续字符',
          passwordChangeRepeated: '新密码不能包含重复字符',
          passwordChangeSpecial: '新密码必须包含特殊字符',
          passwordChangeNumbers: '新密码必须包含数字',
          passwordChangeUppercase: '新密码必须包含大写字母',
          passwordChangeLowercase: '新密码必须包含小写字母',
          passwordChangeLength: '新密码长度必须在{min}到{max}位之间',
          passwordChangeHistory: '新密码不能与最近{count}次使用的密码相同',
          passwordChangeExpired: '新密码已过期',
          passwordChangeLocked: '新密码已被锁定',
          passwordChangeReset: '需要重置新密码',
          passwordChangeResetExpired: '新密码重置链接已过期',
          passwordChangeResetInvalid: '新密码重置链接无效',
          passwordChangeResetSuccess: '新密码重置成功',
          passwordChangeResetFailed: '新密码重置失败',
          passwordChangeChangeSuccess: '新密码修改成功',
          passwordChangeChangeFailed: '新密码修改失败',
          passwordChangeChangeRequired: '需要修改新密码',
          passwordChangeChangeExpired: '新密码修改链接已过期',
          passwordChangeChangeInvalid: '新密码修改链接无效',
          passwordChangeChangeLocked: '新密码修改已被锁定',
          passwordChangeChangeHistory: '新密码不能与最近{count}次使用的密码相同',
          passwordChangeChangeWeak: '新密码强度太弱',
          passwordChangeChangeStrong: '新密码强度太强',
          passwordChangeChangeSame: '新密码不能与旧密码相同',
          passwordChangeChangeUsername: '新密码不能包含用户名',
          passwordChangeChangeEmail: '新密码不能包含邮箱地址',
          passwordChangeChangeCommon: '新密码不能包含常见词汇',
          passwordChangeChangeSequential: '新密码不能包含连续字符',
          passwordChangeChangeRepeated: '新密码不能包含重复字符',
          passwordChangeChangeSpecial: '新密码必须包含特殊字符',
          passwordChangeChangeNumbers: '新密码必须包含数字',
          passwordChangeChangeUppercase: '新密码必须包含大写字母',
          passwordChangeChangeLowercase: '新密码必须包含小写字母',
          passwordChangeChangeLength: '新密码长度必须在{min}到{max}位之间',
          passwordChangeChangeHistory: '新密码不能与最近{count}次使用的密码相同',
          passwordChangeChangeExpired: '新密码已过期',
          passwordChangeChangeLocked: '新密码已被锁定',
          passwordChangeChangeReset: '需要重置新密码',
          passwordChangeChangeResetExpired: '新密码重置链接已过期',
          passwordChangeChangeResetInvalid: '新密码重置链接无效',
          passwordChangeChangeResetSuccess: '新密码重置成功',
          passwordChangeChangeResetFailed: '新密码重置失败'
        }
      };
      
      i18n.global.setLocaleMessage('zh-CN', basicChineseMessages);
      console.log('使用基本中文语言包');
      return true;
    } catch (fallbackError) {
      console.error('加载基本中文语言包也失败:', fallbackError);
    }
  }
  return false;
};

// 立即加载中文语言包
loadChineseMessages();

export const setLanguage = async (lang) => {
  try {
    if (!i18n || !i18n.global) {
      return { success: false, error: 'i18n instance not available' };
    }
    
    i18n.global.locale.value = lang;
    
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.warn('保存语言失败:', error);
    }
    
    // 如果切换到中文，确保语言包已加载
    if (lang === 'zh-CN') {
      await loadChineseMessages();
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
  await loadChineseMessages();
  return { success: true };
};

export default i18n;
