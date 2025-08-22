# API可用性检测优化指南

## 概述

本文档说明如何隐藏API可用性检测的前端显示，并优化网站加载速度。

## 功能特性

### 1. 静默API检测
- **功能**: API可用性检测在后台进行，不会显示检测页面
- **配置**: 在 `src/config/index.js` 中设置 `SILENT_API_CHECK: true`
- **优势**: 提升用户体验，避免检测页面的干扰

### 2. 并行检测
- **功能**: 同时检测多个API端点，提高检测速度
- **实现**: 使用 `Promise.all()` 并行执行检测任务
- **优势**: 大幅减少检测时间

### 3. 智能缓存
- **功能**: 检测结果会缓存一段时间，避免重复检测
- **配置**: 
  - `API_CHECK_CACHE_ENABLED: true` - 启用缓存
  - `API_CHECK_CACHE_DURATION: 300000` - 缓存时间（5分钟）
- **优势**: 减少不必要的API检测，提升加载速度

### 4. 可配置超时
- **功能**: 可自定义API检测超时时间
- **配置**: `API_CHECK_TIMEOUT: 3000` - 超时时间（毫秒）
- **优势**: 避免长时间等待不可用的API

## 配置说明

在 `src/config/index.js` 中添加以下配置：

```javascript
// API配置
API_CONFIG: {
    // ... 其他配置 ...
    
    // 是否启用静默API可用性检测
    // 设置为true时，API检测将在后台进行，不会显示检测页面
    SILENT_API_CHECK: true,

    // API检测超时时间（毫秒）
    API_CHECK_TIMEOUT: 3000,

    // 是否启用API检测缓存
    // 设置为true时，检测结果会缓存一段时间，避免重复检测
    API_CHECK_CACHE_ENABLED: true,

    // API检测缓存时间（毫秒）
    API_CHECK_CACHE_DURATION: 300000, // 5分钟
}
```

## 工作原理

### 1. 检测流程
1. 检查是否有缓存的API URL
2. 如果有缓存且未过期，直接使用缓存
3. 如果没有缓存，并行检测所有API端点
4. 找到第一个可用的API端点
5. 将结果缓存到 sessionStorage

### 2. 静默模式
- 当 `SILENT_API_CHECK` 为 `true` 时，不会跳转到检测页面
- API检测在路由守卫中静默进行
- 检测完成后直接继续导航到目标页面

### 3. 缓存机制
- 缓存数据存储在 `sessionStorage` 中
- 包含API URL和时间戳
- 根据配置的缓存时间判断是否过期

## 性能优化

### 1. 减少检测次数
- 使用缓存避免重复检测
- 只在必要时进行检测

### 2. 提高检测速度
- 并行检测多个API端点
- 可配置的超时时间
- 快速失败机制

### 3. 优化用户体验
- 隐藏检测页面
- 减少页面跳转
- 更快的页面加载

## 故障排除

### 1. 检测失败
- 检查API端点配置是否正确
- 确认网络连接正常
- 查看浏览器控制台错误信息

### 2. 缓存问题
- 清除浏览器缓存和 sessionStorage
- 检查缓存配置是否正确

### 3. 超时问题
- 调整 `API_CHECK_TIMEOUT` 配置
- 检查API服务器响应时间

## 注意事项

1. **缓存清理**: 当API配置更改时，建议清除缓存
2. **超时设置**: 根据实际网络环境调整超时时间
3. **错误处理**: 系统会自动使用默认API端点作为备选方案
4. **兼容性**: 支持现代浏览器的 Fetch API 和 AbortController

## 示例配置

```javascript
// 推荐的优化配置
API_CONFIG: {
    urlMode: 'static',
    staticBaseUrl: [
        '/api/v1',
        '/api/v1',
        '/api/v1'
    ],
    SILENT_API_CHECK: true,
    API_CHECK_TIMEOUT: 3000,
    API_CHECK_CACHE_ENABLED: true,
    API_CHECK_CACHE_DURATION: 300000
}
```

这个配置将提供最佳的加载速度和用户体验。
