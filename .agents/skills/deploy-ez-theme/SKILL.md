---
name: deploy-ez-theme
description: >-
  当用户要求打包 EZ-Theme 主题、发布新版本、同步/部署到 v2board、或清理无用冗余静态资产时使用此技能。
  执行独立插件化纯净构建 (Clean Build)、生成 Blade 模板与 config.json、治理根目录垃圾并自动推送到 v2board 仓库。
---

# EZ-Theme 独立主题插件化打包与自动部署到 v2board Runbook

本技能定义了从 **EZ-Theme 源码** 到 **v2board 生产部署** 的全自动标准流水线。
核心目标：**产物 100% 收拢至 `public/theme/ez/`，支持 v2board 后台自由开关与客户端配置，彻底从 public 根目录解耦**。

---

## 触发条件
当用户表达以下意图时，直接执行本流程：
- “帮我打包 EZ 主题 / 发布新版本”
- “部署 EZ 到 v2board / 同步前端产物”
- “更新 EZ 主题”

---

## 标准执行流水线 (4 步全自动化)

### 步骤 1：执行插件化纯净构建与镜像同步 (Clean Mirror Deploy)

在 `e:\GitHub\EZ-Theme` 目录执行自动化部署脚本：

```powershell
npm run deploy:clean
```

> **该脚本自动执行以下操作**：
> 1. 注入环境变量 `VUE_APP_PUBLIC_PATH=/theme/ez/`，执行生产打包；
> 2. 清空并同步最新产物至 `v2board/public/theme/ez/`；
> 3. 同步 `config.json` 支持后台管理主题与配置客户端下载链接；
> 4. 生成 `dashboard.blade.php` 深度联动 v2board 视图引擎；
> 5. 治理并清空 `v2board/public/` 根目录下的历史遗留文件（`index.html`、`landingpage.html`、`config.js`、`world.json` 等）。

---

### 步骤 2：产物完整性与纯净度校验

由 Agent 执行自动化校验：
1. 检查 `e:\GitHub\v2board\public\theme\ez/dashboard.blade.php` 是否正常生成；
2. 检查 `e:\GitHub\v2board\public\theme\ez/config.json` 是否包含客户端链接等配置项；
3. 检查 `e:\GitHub\v2board\public/` 根目录是否已彻底清除 EZ 污染文件。

---

### 步骤 3：在 v2board 仓库中提交并推送到 GitHub

进入 `e:\GitHub\v2board` 仓库目录：
```powershell
git status
git add -A
git commit -m "perf(theme): 部署 EZ-Theme 独立插件化纯净构建，支持后台主题控制与解耦"
git push origin master
```

---

### 步骤 4：向用户汇报结果并提示服务端更新

向用户汇报最新产物状态与 Commit 哈希，并提醒在宝塔/服务器终端执行 `git pull`。
