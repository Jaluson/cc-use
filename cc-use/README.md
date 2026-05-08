# cc-use

[English](#english) | [中文](#中文)

---

## English

Claude Code Provider Runtime Management CLI — Quickly switch between multiple API provider configurations.

### What's New in v0.1.4

- **Import from CC Switch** — Seamlessly migrate all your provider configurations from the CC Switch extension
- **Redesigned CLI UI** — Industrial-precision visual style with bordered tables, panels, and consistent iconography

### Features

- **Profile Management** — Create, edit, delete, and list multiple provider profiles
- **Built-in Presets** — Support for Anthropic, Kimi, OpenRouter, DeepSeek, and other common providers
- **One-click Switch** — Render `.claude/settings.json` and automatically inject environment variables
- **Launch Integration** — Switch profile and directly launch Claude Code
- **Safe Cleanup** — Auto backup original config, `rollback` command to restore
- **Import from CC Switch** — One-command migration from CC Switch extension configurations
- **Model Discovery** — Auto-fetch available models from remote API endpoints
- **Configuration Validation** — Local schema checks plus optional online connectivity verification
- **Export & Share** — Export profiles with secrets masked for safe sharing

### Installation

```bash
npm install -g @jaluson/cc-use
```

Requires Node.js >= 20.0.0.

### Usage

```bash
# Shortcut: Switch profile and launch Claude
cc-use <profile>

# Render settings.json only, don't launch
cc-use use <profile>
cc-use use <profile> --dry-run    # Preview without writing

# Render and launch Claude (can passthrough args)
cc-use run <profile> [claude-args...]
cc-use run <profile> -- [claude-args...]

# Interactively create a profile
cc-use add
cc-use add --preset <preset-id> --profile <name>

# List all profiles / show details / edit
cc-use list
cc-use show <profile>
cc-use edit <profile>

# Show current active profile
cc-use current

# Remove profiles
cc-use remove <profile...>
cc-use remove              # Interactive multi-select mode

# List built-in presets
cc-use preset-list

# Validate profile (optional online check and model discovery)
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# Export profile (secrets are masked)
cc-use export <profile>
cc-use export <profile> -o <file>

# Import from CC Switch
cc-use import-from-cc-switch
cc-use import-cc             # Alias
cc-use import-cc --dry-run   # Preview without writing

# Rollback: Restore project original config
cc-use rollback
cc-use clean                 # Alias
```

### Migrating from CC Switch

If you have been using the **CC Switch** browser extension to manage Claude Code providers, you can migrate all configurations in one command:

```bash
# Preview what will be imported
cc-use import-cc --dry-run

# Import all providers
cc-use import-cc
```

The import process will:
1. Read all provider configurations from CC Switch
2. Map each provider to the appropriate built-in preset
3. Let you choose between bulk import or per-provider confirmation
4. Handle name conflicts with overwrite / rename / skip options
5. Save all profiles to `~/.config/cc-use/profiles/`

### How It Works

1. Each profile is stored in `~/.config/cc-use/profiles/`, recording the preset ID and environment variables
2. When `use` / `run` executes, it reads the profile and corresponding preset, then renders `.claude/settings.json`
3. Automatically cleans up previously injected environment variables to avoid conflicts
4. Metadata is saved in `.claude/cc-use.json` for tracking and rollback

### Development

```bash
npm install
npm run dev      # watch mode build
npm run build    # build
npm test         # run tests
```

### License

MIT

---

## 中文

Claude Code Provider Runtime Management CLI — 在多个 API 提供商配置之间快速切换。

### v0.1.4 新特性

- **从 CC Switch 导入配置** — 一键迁移 CC Switch 扩展中的所有 provider 配置
- **全新 CLI 界面** — 工业精密工具风格，带边框表格、面板和统一图标系统

### 功能

- **配置文件管理** — 创建、编辑、删除、列出多个 provider 配置（profile）
- **内置预设** — 支持 Anthropic、Kimi、OpenRouter、DeepSeek 等常见提供商
- **一键切换** — 渲染 `.claude/settings.json` 并自动注入环境变量
- **启动集成** — 切换配置后直接启动 Claude Code
- **安全清理** — 自动备份原有配置，`rollback` 命令可恢复
- **从 CC Switch 导入** — 从 CC Switch 扩展配置一键迁移
- **模型发现** — 从远程 API 自动获取可用模型列表
- **配置校验** — 本地 schema 检查 + 可选在线连通性验证
- **导出分享** — 导出 profile 时自动脱敏，安全分享

### 安装

```bash
npm install -g @jaluson/cc-use
```

需要 Node.js >= 20.0.0。

### 使用

```bash
# 快捷方式：切换配置并启动 Claude
cc-use <profile>

# 仅渲染 settings.json，不启动
cc-use use <profile>
cc-use use <profile> --dry-run    # 预览不写入

# 渲染并启动 Claude（可透传参数）
cc-use run <profile> [claude-args...]
cc-use run <profile> -- [claude-args...]

# 交互式创建配置
cc-use add
cc-use add --preset <preset-id> --profile <name>

# 列出所有配置 / 查看详情 / 编辑
cc-use list
cc-use show <profile>
cc-use edit <profile>

# 查看当前激活的配置
cc-use current

# 删除配置
cc-use remove <profile...>
cc-use remove              # 交互式多选模式

# 列出内置预设
cc-use preset-list

# 校验配置（可选在线检查和模型发现）
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# 导出配置（自动脱敏）
cc-use export <profile>
cc-use export <profile> -o <file>

# 从 CC Switch 导入
cc-use import-from-cc-switch
cc-use import-cc             # 别名
cc-use import-cc --dry-run   # 预览不写入

# 回滚：恢复项目原始配置
cc-use rollback
cc-use clean                 # 别名
```

### 从 CC Switch 迁移

如果你一直在使用 **CC Switch** 浏览器扩展管理 Claude Code provider，可以一键迁移所有配置：

```bash
# 预览将要导入的内容
cc-use import-cc --dry-run

# 导入所有 provider
cc-use import-cc
```

导入过程会：
1. 读取 CC Switch 中的所有 provider 配置
2. 将每个 provider 映射到对应的内置预设
3. 选择批量导入或逐个确认
4. 处理名称冲突（覆盖 / 重命名 / 跳过）
5. 将所有 profile 保存到 `~/.config/cc-use/profiles/`

### 工作原理

1. 每个 profile 存储在 `~/.config/cc-use/profiles/` 下，记录了预设 ID 和环境变量
2. `use` / `run` 时读取 profile 和对应 preset，渲染 `.claude/settings.json`
3. 自动清理上次注入的环境变量，避免冲突
4. 元数据保存在 `.claude/cc-use.json`，用于追踪和回滚

### 开发

```bash
npm install
npm run dev      # watch 模式构建
npm run build    # 构建
npm test         # 运行测试
```

### 许可证

MIT
