/**
 * 安全的存储工具类，防止在某些浏览器无痕模式下崩溃
 */
export const safeStorage = {
  get: (key, defaultValue = null) => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      console.warn('Storage access denied');
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};
