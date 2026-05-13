



let _router = null;





const getRouterInstance = async () => {

  if (_router) return _router;

  const mod = await import('@/router');

  _router = mod.default || mod.router || mod;

  return _router;

};





function shouldCheckApiAvailability() {

  if (typeof window === 'undefined' || !window.__SYS_CFG__) return false;

  

  if (window.__SYS_CFG__.API_MIDDLEWARE_ENABLED === true) return false;

  

  const apiConfig = window.__SYS_CFG__.API_CONFIG;

  if (!apiConfig || apiConfig.urlMode !== 'static') return false;

  

  const staticBaseUrls = apiConfig.staticBaseUrl;

  return Array.isArray(staticBaseUrls) && staticBaseUrls.length > 1;

}





function getAvailableApiUrl() {
  if (!shouldCheckApiAvailability()) {
    if (window.__SYS_CFG__?.API_CONFIG?.staticBaseUrl) {
      const urls = window.__SYS_CFG__.API_CONFIG.staticBaseUrl;
      return Array.isArray(urls) ? urls[0] : urls;
    }
    return '';
  }
  
  const availableUrl = sessionStorage.getItem('__sys_api_url__');
  if (availableUrl) {
    return availableUrl;
  }
  
  return window.__SYS_CFG__.API_CONFIG.staticBaseUrl[0];
}

// 静默检测API可用性
async function silentCheckApiAvailability() {
  if (!shouldCheckApiAvailability()) {
    return null;
  }
  
  try {
    // 检查缓存
    if (window.__SYS_CFG__?.API_CHECK_CACHE_ENABLED === true) {
      const cachedData = sessionStorage.getItem('__sys_api_cache__');
      if (cachedData) {
        const { url, timestamp } = JSON.parse(cachedData);
        const cacheDuration = window.__SYS_CFG__.API_CHECK_CACHE_DURATION || 300000;
        
        if (Date.now() - timestamp < cacheDuration) {
          sessionStorage.setItem('__sys_api_url__', url);
          return url;
        }
      }
    }
    
    const storedUrl = sessionStorage.getItem('__sys_api_url__');
    if (storedUrl) {
      return storedUrl;
    }
    
    const apiConfig = window.__SYS_CFG__.API_CONFIG;
    const staticBaseUrls = apiConfig.staticBaseUrl;
    
    // 开始静默检测API可用性
    const checkPromises = staticBaseUrls.map(async (url, index) => {
      try {
        const isAvailable = await enhancedTestApiEndpoint(url);
        return { url, isAvailable, index };
      } catch (error) {
        return { url, isAvailable: false, index };
      }
    });
    
    const results = await Promise.all(checkPromises);
    const availableResult = results.find(result => result.isAvailable);
    
    if (availableResult) {
      sessionStorage.setItem('__sys_api_url__', availableResult.url);
      
      if (window.__SYS_CFG__?.API_CHECK_CACHE_ENABLED === true) {
        const cacheData = {
          url: availableResult.url,
          timestamp: Date.now()
        };
        sessionStorage.setItem('__sys_api_cache__', JSON.stringify(cacheData));
      }
      
      if (window.__SYS_CFG__) {
        window.__SYS_CFG__._AVAILABLE_API_URL = availableResult.url;
      }
      
      return availableResult.url;
    } else {
      const defaultUrl = staticBaseUrls[0];
      sessionStorage.setItem('__sys_api_url__', defaultUrl);
      
      if (window.__SYS_CFG__?.API_CHECK_CACHE_ENABLED === true) {
        const cacheData = {
          url: defaultUrl,
          timestamp: Date.now()
        };
        sessionStorage.setItem('__sys_api_cache__', JSON.stringify(cacheData));
      }
      
      return defaultUrl;
    }
  } catch (error) {
    console.error('静默API可用性检测失败:', error);
    return null;
  }
}

// 测试API端点的函数
async function testApiEndpoint(baseUrl) {
  try {
    // 使用不需要认证的端点来测试API可用性
    const testUrl = `${baseUrl}/guest/comm/config`;
    const controller = new AbortController();
    const timeout = window.__SYS_CFG__?.API_CHECK_TIMEOUT || 3000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // 首先尝试解析域名
    try {
      const url = new URL(testUrl);
    } catch (parseError) {
      return false;
    }
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    // 对于API可用性检测，我们只关心网络连接是否正常
    // 即使返回401或403，也说明API服务器是可达的
    if (response.status >= 200 && response.status < 500) {
      return true;
    } else {
      return false;
    }
    
  } catch (error) {
    // 对于网络错误，我们认为API不可用
    return false;
  }
}

// 增强的API可用性检测函数
async function enhancedTestApiEndpoint(baseUrl) {
  try {
    // 方法1: 使用fetch检测
    const fetchResult = await testApiEndpoint(baseUrl);
    if (fetchResult) {
      return true;
    }
    
    // 方法2: 使用XMLHttpRequest作为备选检测方法
    const xhrResult = await testApiEndpointWithXHR(baseUrl);
    if (xhrResult) {
      return true;
    }
    
    return false;
    
  } catch (error) {
    return false;
  }
}

// 使用XMLHttpRequest检测API端点
async function testApiEndpointWithXHR(baseUrl) {
  return new Promise((resolve) => {
    try {
      const testUrl = `${baseUrl}/guest/comm/config`;
      const xhr = new XMLHttpRequest();
      const timeout = window.__SYS_CFG__?.API_CHECK_TIMEOUT || 3000;
      
      xhr.timeout = timeout;
      xhr.open('GET', testUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 500) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      xhr.onerror = function() {
        resolve(false);
      };
      
      xhr.ontimeout = function() {
        resolve(false);
      };
      
      xhr.send();
      
    } catch (error) {
      resolve(false);
    }
  });
}

async function initApiAvailabilityChecker(redirect = true) {
  if (!shouldCheckApiAvailability()) {
    return null;
  }
  
  try {
    const storedUrl = sessionStorage.getItem('__sys_api_url__');
    if (storedUrl) {
      return storedUrl;
    }
    
    // 如果启用静默检测，则不跳转到检测页面
    if (window.__SYS_CFG__?.SILENT_API_CHECK === true) {
      return await silentCheckApiAvailability();
    }
    
    if (redirect) {
      const router = await getRouterInstance();
      if (router.currentRoute.value.name !== 'ApiValidation') {
        const { path: currentPath, query: currentQuery } = router.currentRoute.value;

        const apiValidationQuery = {
          redirect: currentPath !== '/api-validation' ? currentPath : '/',
          ...currentQuery
        };

        router.push({
          path: '/api-validation',
          query: apiValidationQuery
        });
        return null;
      }
    }
  } catch (error) {
    console.error('API可用性检测初始化失败:', error);
  }
  
  return null;
}

export { 
  getAvailableApiUrl, 
  initApiAvailabilityChecker,
  shouldCheckApiAvailability,
  silentCheckApiAvailability
}; 
