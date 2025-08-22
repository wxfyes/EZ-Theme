# 网站加载速度优化指南

## 当前性能分析

### 已实现的优化
1. ✅ 生产环境代码分割 (splitChunks)
2. ✅ 代码压缩和混淆
3. ✅ 移除 console 和 debugger
4. ✅ 禁用 source map
5. ✅ 异步加载语言包
6. ✅ 跳过 API 检测

### 可优化的方面

## 1. 代码分割优化

### 当前问题
- 语言包在应用初始化时同步加载
- 部分组件可能不必要地预加载

### 优化方案
```javascript
// 在 vue.config.js 中添加更细粒度的代码分割
splitChunks: {
  chunks: "all",
  cacheGroups: {
    vendors: { 
      name: "chunk-vendors", 
      test: /[\\/]node_modules[\\/]/, 
      priority: -10, 
      chunks: "initial" 
    },
    // 添加语言包单独分割
    i18n: {
      name: "chunk-i18n",
      test: /[\\/]src[\\/]i18n[\\/]/,
      priority: -5,
      chunks: "async"
    },
    // 添加图表库单独分割
    charts: {
      name: "chunk-charts",
      test: /[\\/]node_modules[\\/](chart\.js|echarts)[\\/]/,
      priority: -5,
      chunks: "async"
    },
    // 添加加密库单独分割
    crypto: {
      name: "chunk-crypto",
      test: /[\\/]node_modules[\\/](crypto-js|jsencrypt)[\\/]/,
      priority: -5,
      chunks: "async"
    },
    common: { 
      name: "chunk-common", 
      minChunks: 2, 
      priority: -20, 
      chunks: "initial", 
      reuseExistingChunk: true 
    },
  },
}
```

## 2. 预加载优化

### 当前问题
- 样式文件在应用初始化时同步加载
- 部分依赖可能阻塞渲染

### 优化方案
```javascript
// 在 public/index.html 中添加关键资源预加载
<link rel="preload" href="./static/js/chunk-vendors.js" as="script">
<link rel="preload" href="./static/css/chunk-vendors.css" as="style">

// 在 appInit.js 中优化样式加载
const initApp = async () => {
  try {
    initPageTitle();

    // 并行加载样式和应用初始化
    const [app, styles] = await Promise.all([
      createApp(App),
      import('./assets/styles/index.scss')
    ]);

    // ... 其余代码
  } catch (error) {
    // 错误处理
  }
};
```

## 3. 组件懒加载优化

### 当前问题
- 部分组件可能不必要地预加载
- 路由组件可以更细粒度地懒加载

### 优化方案
```javascript
// 在 router/index.js 中优化组件加载
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue');
const Shop = () => import(/* webpackChunkName: "shop" */ '@/views/shop/Shop.vue');
const Profile = () => import(/* webpackChunkName: "profile" */ '@/views/profile/UserProfile.vue');

// 添加预加载提示
const preloadRoute = (routeName) => {
  const route = router.resolve({ name: routeName });
  if (route && route.matched.length > 0) {
    route.matched.forEach(record => {
      if (record.components && record.components.default) {
        record.components.default();
      }
    });
  }
};

// 在用户悬停时预加载
router.beforeEach((to, from, next) => {
  // 预加载下一个可能访问的页面
  if (to.name === 'Dashboard') {
    preloadRoute('Shop');
  } else if (to.name === 'Shop') {
    preloadRoute('Profile');
  }
  next();
});
```

## 4. 资源优化

### 当前问题
- 图片资源可能未优化
- 字体加载可能阻塞渲染

### 优化方案
```html
<!-- 在 public/index.html 中优化字体加载 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">

<!-- 添加图片懒加载 -->
<script>
  // 图片懒加载
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
</script>
```

## 5. 缓存优化

### 当前问题
- 语言包缓存策略可以优化
- API 响应缓存可以改进

### 优化方案
```javascript
// 在 src/utils/pageCache.js 中优化缓存策略
const cacheConfig = {
  maxAge: 5 * 60 * 1000, // 5分钟
  maxSize: 50, // 最多缓存50个页面
  strategy: 'lru' // 最近最少使用策略
};

// 在 API 请求中添加缓存
const apiCache = new Map();
const cacheKey = (url, params) => `${url}?${JSON.stringify(params)}`;

const cachedRequest = async (url, params = {}) => {
  const key = cacheKey(url, params);
  const cached = apiCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 30000) { // 30秒缓存
    return cached.data;
  }
  
  const response = await axios.get(url, { params });
  apiCache.set(key, {
    data: response.data,
    timestamp: Date.now()
  });
  
  return response.data;
};
```

## 6. 构建优化

### 当前问题
- 部分依赖可能重复打包
- 代码分割可以更精细

### 优化方案
```javascript
// 在 vue.config.js 中添加更精细的优化
configureWebpack: (config) => {
  // 添加模块解析优化
  config.resolve.modules = ['node_modules'];
  config.resolve.extensions = ['.js', '.vue', '.json'];
  
  // 添加外部依赖优化
  if (isProd) {
    config.externals = {
      // 如果某些库通过 CDN 加载，可以设置为外部依赖
      // 'vue': 'Vue',
      // 'vue-router': 'VueRouter'
    };
  }
  
  // 添加资源优化
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 4 * 1024 // 4KB 以下的图片内联
      }
    }
  });
}
```

## 7. 运行时优化

### 当前问题
- 语言包重新加载可能不必要
- 部分计算可能重复执行

### 优化方案
```javascript
// 在 src/i18n/index.js 中优化语言包加载
const languageCache = new Map();

const loadLanguageWithCache = async (lang) => {
  if (languageCache.has(lang)) {
    return languageCache.get(lang);
  }
  
  const messages = await loadLanguageMessages(lang);
  languageCache.set(lang, messages);
  
  // 限制缓存大小
  if (languageCache.size > 5) {
    const firstKey = languageCache.keys().next().value;
    languageCache.delete(firstKey);
  }
  
  return messages;
};

// 在组件中使用 computed 缓存计算结果
const expensiveComputation = computed(() => {
  // 缓存计算结果
  const cacheKey = JSON.stringify(dependencies);
  if (computationCache.has(cacheKey)) {
    return computationCache.get(cacheKey);
  }
  
  const result = performExpensiveCalculation(dependencies);
  computationCache.set(cacheKey, result);
  return result;
});
```

## 8. 监控和分析

### 添加性能监控
```javascript
// 在 main.js 中添加性能监控
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('页面加载时间:', entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });

// 添加错误监控
window.addEventListener('error', (event) => {
  console.error('JavaScript 错误:', event.error);
  // 可以发送到错误监控服务
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  // 可以发送到错误监控服务
});
```

## 实施建议

### 优先级排序
1. **高优先级**: 代码分割优化、预加载优化
2. **中优先级**: 组件懒加载、资源优化
3. **低优先级**: 缓存优化、监控分析

### 测试方法
1. 使用 Chrome DevTools 的 Performance 面板
2. 使用 Lighthouse 进行性能审计
3. 使用 WebPageTest 进行真实网络测试
4. 监控 Core Web Vitals 指标

### 预期效果
- 首屏加载时间减少 20-30%
- 交互响应时间减少 15-25%
- 总体包大小减少 10-20%
- 缓存命中率提升 30-50%

## 注意事项

1. **保持功能完整性**: 所有优化都不应破坏现有功能
2. **渐进式优化**: 逐步实施，每次测试一个优化点
3. **兼容性考虑**: 确保优化后的代码在不同浏览器中正常工作
4. **监控回滚**: 如果优化导致问题，能够快速回滚到之前版本
