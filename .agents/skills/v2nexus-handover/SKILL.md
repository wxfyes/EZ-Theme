---
name: v2nexus-handover
description: >-
  接手、维护、迭代开发、测试或部署 V2Nexus-Theme 前端主题及联动 v2board 时必读使用此技能。
  包含项目整体架构、仓库目录映射、全量已交付功能清单、开发与纯净打包规范、避雷陷阱与下一步规划。
---

# V2Nexus-Theme 项目全量交接与接手开发指南 (Agent Handover Playbook)

> **给接手 Agent 的核心提醒**：
> 这是一个高度产品化的现代 v2board 前端主题项目（基于 Vue 3 + Vite 6 + Tailwind CSS + Pinia）。
> 用户严格恪守 **KISS（简洁至上）原则**，拒绝过度工程化，注重细节打磨与极致用户体验。
> **强制规范**：所有思考过程、方案计划与用户交互，必须严格使用**中文**。

---

## 0. 双主题与双后台协同迭代核心铁律 (Strict Parity Rule)

> ⚠️ **所有接手 AI 助手（Antigravity / Gemini）必须时刻牢记的核心铁律**：
>
> 1. **双商业前端主题必须 100% 功能对齐（Feature Parity）**：
>    - 本系统并行维护两大官方商业级前端主题：`EZ-Theme`（经典稳健、多端成熟）与 `V2Nexus-Theme`（现代Bento轻奢、极速响应）。
>    - **以后凡是向系统添加任何新业务功能、活动、指令或交互优化（如每日签到打卡、充值返现福利、Telegram 机器人绑定、提前开启新周期、套餐差价折抵、公告弹窗等），必须在 EZ-Theme 与 V2Nexus-Theme 两个主题中一同实现、同步修改与构建，严禁只改一个漏掉另一个！**
> 2. **双管理后台前端源码双轨维护规范**：
>    - **Vue 3 Element-Plus 版**：位于 `e:\GitHub\v2board\admin-panel`，构建输出至 `public/assets/admin-new/`，由 `admin.blade.php` 承载；
>    - **React 19 Ant-Design 版**：位于 `e:\GitHub\v2board\v2board-admin-main`，构建输出至 `public/assets/admin-react/`，由 `admin_react.blade.php` 承载；
>    - 任何后台新增管理入口（如本次的【每日签到记录】），必须在**两套管理端源码**中同步增加页面、路由与侧边栏菜单，并分别执行 `npm run build` 同步编译产物与更新 Blade 版本戳，确保站长自由切换后台时功能完全一致。

---

## 1. 核心架构与多仓库拓扑映射

本项目跨越本地三个主要仓库，协同工作流如下：

| 仓库名称 | 本地路径 | 角色与职责 |
| :--- | :--- | :--- |
| **V2Nexus-Theme** | `e:\GitHub\V2Nexus-Theme` | **前端核心源码**：Vue 3 + Vite 6 + TailwindCSS 单页应用，所有 UI 与业务代码在此开发 |
| **v2board** | `e:\GitHub\v2board` | **目标后端与部署产物仓库**：集成了 Laravel 后端，主题产物输出至 `public/theme/v2nexus/`，绑定 GitHub 远端 `origin master` |
| **EZ-Theme** | `e:\GitHub\EZ-Theme` | **经典参考主题**：用户此前使用的经典主题，所有交互与功能设计需对其保持平替或超越 |

### 产物部署路径与架构特色
- **部署目录**：`e:\GitHub\v2board\public\theme\v2nexus\`
- **模板入口**：`dashboard.blade.php`（由构建脚本根据 `dist/index.html` 自动生成，动态注入防缓存头与后端上下文）
- **完全解耦**：所有 JS/CSS 静态资源均自包含在 `public/theme/v2nexus/static/` 目录下，**严禁**向 `v2board/public/static/` 写入遗留孤儿文件，实现 100% 独立干净部署。

---

## 2. 已交付的核心功能与技术实现清单

截至目前，已全面完成并测试通过的核心功能如下：

### 2.1 基础外观与主题体验
1. **默认亮白模式 (Light Mode)**：初始状态为现代化清新亮白风格，顶部与各个页面支持一键平滑切换深色暗黑模式（Dark Mode）；
2. **移动端 & 平板端极致适配**：
   - 底部常驻快捷操作栏（`src/components/BottomTabBar.vue`）；
   - 响应式侧边抽屉导航与遮罩，触控体验丝滑；
3. **Logo 自适应**：
   - 登录页（`Login.vue`）、注册页（`Register.vue`）、侧边栏（`MainLayout.vue`）与移动端抽屉中，Logo 均采用弹性最大高宽容器（`max-h-14 max-w-[200px]` 及 `max-h-8 max-w-[140px]`），彻底解除固定正方形限制，横向长条 Logo 与方形徽标皆完美居中舒展。

### 2.2 登录与注册体系 (`Login.vue` & `Register.vue`)
1. **快捷登录/注册分割线**：采用对称 Flex 三段式布局，文字绝对水平居中，避免挤压或异常折行；
2. **仿 EZ 邮箱前缀与后缀下拉选择**：支持前缀直接输入 + `@` + 常见邮箱后缀下拉选择（优先读取后台白名单后缀，支持粘贴完整邮箱智能拆解）；
3. **密码二次确认 (确认密码)**：
   - 注册页面新增 `confirm_password` 输入框；
   - 提交前进行前端双重校验（长度至少 8 位、两次密码必须一致），不一致时直观弹出提示横幅；
4. **人机验证双模自适应与排障**：
   - 自动检测并渲染 **Cloudflare Turnstile** 或 **Google reCAPTCHA**；
   - 接入 `error-callback` 与加载异常捕获，在本地测试遇到域名限制时提供排障提示。

### 2.3 导航系统与侧边栏 (`MainLayout.vue`)
1. **结构化分类导航**：对齐现代 SaaS 设计，侧边栏划分为清晰的功能分组（如“我的服务”、“财务中心”、“服务中心”、“推广返利”）；
2. **字体排版优化**：导航项字体加大加粗（`text-sm font-semibold`），高亮当前路由；
3. **工单支持**：名称统一为“工单支持”；
4. **入口健全**：侧边栏中常驻“我的钱包”入口，顶部状态栏亦有渐变余额直达按钮。

### 2.4 财务中心与钱包系统 (`Wallet.vue`)
1. **余额充值与明细**：支持快捷面额选择或自定义金额充值，实时展示流水记录；
2. **自动续费开关**：支持设置账户自动续费，带即时动画与操作状态反馈；
3. **双模支付支持**：
   - 支持弹码扫码支付模态框（`PaymentQRModal.vue`，支持直接轮询订单与支付结果自愈）；
   - 支持外部支付网关直接跳转，按接口返回自适应处理。

### 2.5 仪表盘与卡片流 (`Dashboard.vue`)
1. **卡片顺序优化**：
   - 快捷操作卡片置于最上方显眼位置；
   - 流量使用卡片紧跟其后；
   - “当前套餐”卡片移至使用流量卡片之后，符合日常用户操作习惯；
2. **订阅导入与安全防护**：
   - 支持主流客户端（Shadowrocket、Clash、Surge、Quantumult X 等）一键导入；
   - 支持根据主题后台配置开启/关闭复制订阅链接（为防止爬取/封端做准备）。

### 2.6 推广返利 (`Invite.vue`)
1. **自适应邀请链接**：依据后端接口与域名规则自适应生成邀请链接；
2. **邀请人员展示**：支持展示被邀请人账号（脱敏）与注册时间明细。

### 2.7 每日签到专属福利体系 (`DailyCheckinModal.vue` & 后台控制)
1. **差额动态福利礼包**：根据用户套餐基准动态赠送流量（1024G送24G，200G送4.69G等），支持后台 `checkin_rate_percent` 动态微调；
2. **专属权限控制**：仅对周期性订阅会员开放，对一次性不重置流量套餐自动隐藏签到入口；
3. **后台全量联动**：主题配置支持总开关 `checkin_enable`，关闭时完全隐藏入口并停用接口。

### 2.8 提前开启新周期体系 (`Dashboard.vue` & `UserController.php`)
1. **按需智能浮现**：有流量时不展示，仅当流量耗尽（剩余 < 500MB 或比例 $\ge 99\%$）、剩余有效期 $> 30$ 天且为周期订阅时，在流量卡片右下角显眼浮现；
2. **工业级自然月自适应算法**：自动识别大月 31 天、小月 30 天、二月 28/29 天，精准扣减整月，且到期日日期锚点绝对不漂移；
3. **彻底防月末溢出**：采用目标月 `date('t')` 限额校验，防止如 3月31日 回退溢出至 3月的经典 Bug；
4. **数据库悲观排他锁与防白嫖**：
   - 使用 `User::lockForUpdate()` 悲观行锁，彻底杜绝并发刷流量和连击重入；
   - 严格要求扣除后的新到期时间必须大于当前时间 1 小时以上，绝不倒贴变过期；
   - 流量彻底清零并重置回套餐标称容量。

---

## 3. 标准开发与自动化部署流水线

每次进行代码开发或样式修改后，必须严格遵循以下 4 步部署闭环：

### 步骤 1：本地编译验证
在 `e:\GitHub\V2Nexus-Theme` 目录下执行：
```powershell
npm run build
```
确保无 Vue 模板或语法编译报错。

### 步骤 2：执行纯净镜像构建与同步 (Clean Deploy)
在 `e:\GitHub\V2Nexus-Theme` 目录下执行预置的自动化脚本：
```powershell
npm run deploy:clean
```
> **该脚本自动执行**：
> 1. 执行 Vite 纯净打包；
> 2. 清理 `e:\GitHub\v2board\public\theme\v2nexus` 目录下的旧 chunk；
> 3. 复制最新 JS/CSS 资源；
> 4. 自动生成最新的 `dashboard.blade.php` 与 `config.json`。

### 步骤 3：在 v2board 仓库中提交并推送到 GitHub
切换工作目录至 `e:\GitHub\v2board`：
```powershell
git status
git add -A
git commit -m "feat/fix(theme): 简要说明本次更新内容"
git push origin master
```

### 步骤 4：向用户汇报并提供更新指令
提示用户已完成推送，并提醒站长在服务器端执行：
```bash
git pull
```

---

## 4. 避坑指南与第一性原理技术细节

1. **Cloudflare Turnstile 验证码红感叹号“无法连接到网站 故障排除”**：
   - **原因**：Cloudflare Turnstile 强制校验 Hostname。本地开发（`localhost` / `127.0.0.1`）由于未添加到 Cloudflare 的域名白名单，服务端会拒绝连接；
   - **对策**：部署到正式域名即可自然恢复；本地测试时可在后台“系统配置 -> 注册配置”临时关闭人机验证。
2. **静态资源路径必须为相对路径**：
   - `vite.config.js` 的 `base` 必须保持为 `'./'` 或 `'/theme/v2nexus/'`，杜绝写死绝对根路径 `/static/`，避免污染 v2board public 根目录。
3. **Pinia 状态库导入完整性**：
   - 新增页面或组件时，必须确保从 `@/stores/user` 显式导入 `useUserStore`，从 `@/stores/theme` 导入 `useThemeStore`，禁止出现未定义直接访问属性的低级 Bug。
4. **移动端底部 TabBar 避让**：
   - 移动端页面底部增加了 `BottomTabBar`，内容容器必须确保拥有适当的底部内边距（如 `pb-20 md:pb-6`），防止底部操作按钮被固定栏遮挡。

---

## 5. 待跟进事项与未来规划建议

1. **EZ-Theme 插件化改造（✅ 已交付完成）**：
   - 已将 `e:\GitHub\EZ-Theme` 按照标准插件化架构改造完成；
   - 产物 100% 收拢至 `public/theme/ez/`，补齐了 `config.json` 与 `dashboard.blade.php`；
   - 彻底清理了 `v2board/public/` 根目录下历史残留的静态文件（`index.html`、`landingpage.html`、`config.js`、`world.json` 等）；
   - 在 v2board 后台【系统配置 -> 主题配置】中已可自由切换 `ez` 与 `v2nexus`，并支持后台修改客户端下载链接即时生效！
2. **暗黑模式多主题色板微调**：进一步优化暗黑模式在高对比度屏幕上的柔和度；
3. **多语言国际化 (i18n)**：如有海外用户需求，可预留 Vue-i18n 多语言适配接口；
4. **节点延迟测速 Ping 组件**：优化节点列表卡片，加入更直观的延迟小圆点与节点测速展示。
