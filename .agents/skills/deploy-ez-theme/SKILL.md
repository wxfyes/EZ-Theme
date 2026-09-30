---
name: deploy-ez-theme
description: >-
  当用户要求打包 EZ-Theme 主题、发布新版本、同步/部署到 v2board、或清理无用冗余静态资产时使用此技能。
  执行纯净构建 (Clean Build)、镜像清理废弃 chunk、校验体积并自动提交推送到 v2board 仓库。
---

# EZ-Theme 纯净打包与自动部署到 v2board Runbook

本技能定义了从 **EZ-Theme 源码** 到 **v2board 生产部署** 的全自动标准流水线。
核心目标：**杜绝任何历史垃圾资产混入、保证零冗余、确保客户端平滑自愈、零心智负担**。

---

## 触发条件
当用户表达以下意图时，直接执行本流程：
- “帮我打包主题 / 发布新版本”
- “部署到 v2board / 同步前端产物”
- “清理无用资产并打包”
- “更新主题”

---

## 标准执行流水线 (4 步全自动化)

### 步骤 1：执行纯净构建与镜像同步 (Clean Mirror Deploy)

在 `e:\GitHub\EZ-Theme` 目录执行预置的自动化部署脚本：

```powershell
npm run deploy:clean
```

> **该脚本自动执行以下操作**：
> 1. 调用 `vue-cli-service build`：编译前自动清空 `dist/`，生成极致压缩的纯净产物；
> 2. 清空目标 `v2board/public/theme/ez/static` 和 `v2board/public/static` 中的旧 js/css 孤儿 chunk；
> 3. 精准将本次构建生成的 1:1 文件拷贝至对应目录。

---

### 步骤 2：产物完整性与纯净度校验

由 Agent 执行自动化校验：
1. 检查 `e:\GitHub\v2board\public\theme\ez\index.html` 是否包含以下防缓存与自愈标记：
   - Meta 标签 `no-cache, no-store, must-revalidate`
   - 时间戳占位符
2. 对比 `EZ-Theme/dist/static/js` 与 `v2board/public/static/js` 的文件总数，确保两者完全一致，无任何孤儿废弃文件遗留。

---

### 步骤 3：在 v2board 仓库中提交并推送到 GitHub

进入 `e:\GitHub\v2board` 仓库目录：
1. 查看变更状态：
   ```powershell
   git status
   ```
   *预期：废弃旧 chunk 被标记为 `deleted`，新 chunk 被标记为 `untracked` 或 `modified`。*
2. 暂存所有变更并提交：
   ```powershell
   git add -A
   git commit -m "perf(theme): 部署 EZ-Theme 最新生产构建，彻底清除历史冗余 chunk 并保持极致轻量"
   git push origin master
   ```

---

### 步骤 4：向用户汇报结果并提示服务端更新

向用户输出清晰、简洁的交付汇报：
1. **构建与优化概况**：说明最新首屏 js 体积与清理的废弃 chunk 数量；
2. **GitHub 推送状态**：给出最新 Commit 哈希；
3. **服务器更新指引**：明确提醒用户只需在服务器终端执行：
   ```bash
   cd /www/wwwroot/tianquege.top && git pull
   ```
