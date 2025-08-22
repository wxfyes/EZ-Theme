# 语言包问题调试指南

## 当前问题

登录后界面显示为翻译键名（如 `dashboard.welcome`、`menu.dashboard`）而不是中文文本。

## 调试步骤

### 1. 打开浏览器开发者工具

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 清除之前的日志（点击垃圾桶图标）

### 2. 清除缓存并重新登录

1. 按 `Ctrl+Shift+R` 强制刷新页面
2. 或者在开发者工具的 `Application` 标签中清除 `Local Storage` 和 `Session Storage`
3. 重新登录

### 3. 检查控制台输出

登录后应该看到以下日志信息：

```
初始化默认 i18n 实例: {isLoggedIn: true/false, initialLang: "zh-CN", token: true/false}
默认 i18n 实例加载的语言包: ["zh-CN", "en-US", ...]
默认 i18n 实例创建完成，当前语言: zh-CN
登录后重新加载语言包完成
```

### 4. 检查关键信息

**重要检查点：**

1. **`isLoggedIn` 状态**：
   - 应该在登录后显示 `true`
   - 如果显示 `false`，说明登录状态检测有问题

2. **`initialLang` 语言**：
   - 应该显示 `zh-CN`
   - 如果显示其他值，检查 `localStorage.getItem('language')`

3. **加载的语言包**：
   - 登录前：可能只有部分语言包
   - 登录后：应该包含所有语言包

4. **当前语言设置**：
   - 应该显示 `zh-CN`

### 5. 手动测试语言切换

在控制台中执行以下命令：

```javascript
// 检查当前语言
console.log('当前语言:', localStorage.getItem('language'));

// 检查 i18n 实例
console.log('i18n 语言:', window.router?.app?.config?.globalProperties?.$i18n?.locale);

// 手动重新加载语言包
(async () => {
  try {
    const { setLanguage } = await import('./i18n');
    await setLanguage('zh-CN');
    console.log('手动重新加载完成');
  } catch (error) {
    console.error('手动重新加载失败:', error);
  }
})();
```

### 6. 检查语言包文件

确认以下文件存在且可访问：

- `src/i18n/locales/index.js`
- `src/i18n/locales/zh-CN.js`
- `src/i18n/locales/auth/index.js`
- `src/i18n/locales/auth/zh-CN.js`

### 7. 检查网络请求

在 `Network` 标签中检查：

1. 是否有语言包相关的网络请求
2. 请求是否成功（状态码 200）
3. 是否有加载失败的资源

## 常见问题和解决方案

### 问题1：`isLoggedIn` 显示 `false`

**原因**：token 检测逻辑有问题

**解决方案**：
```javascript
// 在控制台检查
console.log('token:', localStorage.getItem('token'));
console.log('sessionToken:', sessionStorage.getItem('token'));
```

### 问题2：语言包加载失败

**原因**：文件路径或导入错误

**症状**：控制台显示 `加载完整语言包索引文件失败` 或类似错误

**解决方案**：检查文件是否存在，路径是否正确

### 问题3：语言设置不生效

**原因**：i18n 实例没有正确更新

**解决方案**：
```javascript
// 强制刷新页面
location.reload();
```

### 问题4：部分翻译缺失

**原因**：语言包不完整或加载了错误的语言包版本

**解决方案**：检查是否加载了完整的语言包（`./locales/index.js`）而不是认证版本（`./locales/auth/index.js`）

## 修复验证

修复成功的标志：

1. ✅ 控制台显示正确的调试信息
2. ✅ `isLoggedIn` 在登录后显示 `true`
3. ✅ 界面显示中文而不是翻译键名
4. ✅ 没有语言包加载错误

## 应急解决方案

如果问题仍然存在，可以尝试：

1. **清除所有浏览器数据**：
   - 清除 Local Storage
   - 清除 Session Storage  
   - 清除 Cookies
   - 硬刷新页面

2. **手动重新加载语言包**：
   在控制台执行：
   ```javascript
   localStorage.setItem('language', 'zh-CN');
   location.reload();
   ```

3. **检查配置文件**：
   确认 `src/config/index.js` 中的 `defaultLanguage` 设置为 `'zh-CN'`

4. **重新构建项目**：
   ```bash
   npm run build
   ```

这个调试指南应该能帮助你定位和解决语言包问题。
