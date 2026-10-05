# V2Nexus-Theme & EZ-Theme 项目核心开发准则与行为铁律

> **致接手的 AI 助手（Antigravity / Gemini）**：
> 你正在参与一个高要求的现代化商业前端项目（V2Nexus-Theme 与 v2board 主题联动）。
> 无论你是哪个账号、第几次进入此会话，必须严格执行以下准则，保持最高标准的严谨与细致：

---

## 一、核心哲学与工作流准则

1. **简洁至上 (KISS 原则)**：
   - 崇尚代码与架构的极致简洁，杜绝过度工程化、冗余嵌套与无意义的防御性代码。
   - 静态资源必须零垃圾、零孤儿 chunk，部署时严格隔离。
2. **深度分析与事实为本**：
   - 立足第一性原理剖析问题，遇到疑问或 Bug 先查根因（如网络、协议、接口规范），以客观技术事实为准则，有疑问坦率指出。
3. **结构化流程**：
   - 严格遵循“明确需求 -> 构思方案 -> 提请审核 -> 分解任务 -> 逐步实现 -> 验证交付”的作业顺序。
4. **输出规范**：
   - **所有回复、内部思考过程（Thinking）及任务清单，均须严格使用中文**。
   - 格式指令：`Implementation Plan, Task List and Thought in Chinese`。

---

## 二、双商业主题与双管理后台协同迭代铁律 (Strict Parity Rule)

1. **双商业前端主题协同开发（Feature Parity）**：
   - 本项目并行维护两大官方商业前端主题：`EZ-Theme`（经典稳健）与 `V2Nexus-Theme`（现代轻奢）。
   - **凡是添加任何新业务功能、新活动、新命令或交互优化（如每日签到、充值返现福利、Telegram 机器人绑定交互、提前开启新周期、套餐差价折抵等），必须在 EZ-Theme 与 V2Nexus-Theme 两个主题中一同实现、同步修改与构建，严禁只改一个漏掉另一个！**
2. **双管理后台前端源码协同维护**：
   - 后台管理端存在两套源码：
     - **Vue 3 Element-Plus 版**：`e:\GitHub\v2board\admin-panel`（产物输出至 `public/assets/admin-new/`，对应 `admin.blade.php`）
     - **React 19 Ant-Design 版**：`e:\GitHub\v2board\v2board-admin-main`（产物输出至 `public/assets/admin-react/`，对应 `admin_react.blade.php`）
   - 新增管理后台功能（如【每日签到记录】），必须在**两套管理端源码**中同步增加页面、路由与侧边栏菜单，分别执行构建并同步至各自的 public 资产目录，保持双后台 100% 同步！

---

## 三、工作技能与上下文继承 (必读)

1. **项目全量交接技能**：
   - 在开始任何需求开发或代码修改前，**必须首先调用并阅读技能**：`v2nexus-handover`。
   - 技能路径：`.agents/skills/v2nexus-handover/SKILL.md` 或全局 `~/.gemini/config/skills/v2nexus-handover/SKILL.md`。
   - 该技能记录了：本地三个仓库拓扑、全部已交付功能、暗黑/亮白模式规范、Logo 与人机验证细节、避坑指南等。
2. **生产部署技能**：
   - 打包、发布新版本或同步至 v2board 时，参考并执行技能：`deploy-v2nexus`（或 `deploy-ez-theme`）。

---

## 三、开发与交付闭环要求

每次代码变更必须完成以下 4 步完整闭环，严禁虎头蛇尾：
1. **本地语法与构建校验**：在 `e:\GitHub\V2Nexus-Theme` 运行 `npm run build`，确认 0 错误；
2. **纯净镜像构建与同步**：在 `e:\GitHub\V2Nexus-Theme` 运行 `npm run deploy:clean`，自动同步最新产物并清理废弃 chunk；
3. **版本库推送**：在 `e:\GitHub\v2board` 运行 `git add -A && git commit -m "..." && git push origin master`，推送到 GitHub 远端；
4. **向用户清晰汇报**：汇报修改要点、Commit 哈希，并提醒在宝塔/服务器终端执行 `git pull`。
