// 性能测试脚本
// 在浏览器控制台中运行此脚本来测试性能

console.log('开始性能测试...');

// 测试页面加载时间
const navigationEntry = performance.getEntriesByType('navigation')[0];
if (navigationEntry) {
    console.log('=== 页面加载性能 ===');
    console.log('DNS 查询时间:', navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart, 'ms');
    console.log('TCP 连接时间:', navigationEntry.connectEnd - navigationEntry.connectStart, 'ms');
    console.log('请求响应时间:', navigationEntry.responseEnd - navigationEntry.requestStart, 'ms');
    console.log('DOM 解析时间:', navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart, 'ms');
    console.log('页面完全加载时间:', navigationEntry.loadEventEnd - navigationEntry.loadEventStart, 'ms');
    console.log('总加载时间:', navigationEntry.loadEventEnd - navigationEntry.fetchStart, 'ms');
}

// 测试资源加载时间
const resourceEntries = performance.getEntriesByType('resource');
console.log('\n=== 资源加载性能 ===');
console.log('总资源数量:', resourceEntries.length);

const jsResources = resourceEntries.filter(entry => entry.name.includes('.js'));
const cssResources = resourceEntries.filter(entry => entry.name.includes('.css'));
const imageResources = resourceEntries.filter(entry => entry.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/));

console.log('JavaScript 文件数量:', jsResources.length);
console.log('CSS 文件数量:', cssResources.length);
console.log('图片文件数量:', imageResources.length);

// 计算平均加载时间
const avgLoadTime = resourceEntries.reduce((sum, entry) => sum + entry.duration, 0) / resourceEntries.length;
console.log('平均资源加载时间:', avgLoadTime.toFixed(2), 'ms');

// 测试内存使用情况
if (performance.memory) {
    console.log('\n=== 内存使用情况 ===');
    console.log('已用堆大小:', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('总堆大小:', (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('堆大小限制:', (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2), 'MB');
}

// 测试 Core Web Vitals
console.log('\n=== Core Web Vitals ===');

// LCP (Largest Contentful Paint)
new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP (最大内容绘制):', lastEntry.startTime.toFixed(2), 'ms');
}).observe({ entryTypes: ['largest-contentful-paint'] });

// FID (First Input Delay)
new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
        console.log('FID (首次输入延迟):', entry.processingStart - entry.startTime, 'ms');
    });
}).observe({ entryTypes: ['first-input'] });

// CLS (Cumulative Layout Shift)
new PerformanceObserver((list) => {
    let cls = 0;
    list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
            cls += entry.value;
        }
    });
    console.log('CLS (累积布局偏移):', cls.toFixed(4));
}).observe({ entryTypes: ['layout-shift'] });

// 测试应用初始化时间
console.log('\n=== 应用性能 ===');
const appStartTime = performance.now();

// 模拟应用初始化完成
setTimeout(() => {
    const appInitTime = performance.now() - appStartTime;
    console.log('应用初始化时间:', appInitTime.toFixed(2), 'ms');
}, 1000);

console.log('性能测试完成！请查看控制台输出。');
