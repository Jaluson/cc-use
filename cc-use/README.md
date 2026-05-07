# cc-use

[English](#english) | [中文](#中文)

---

## English

Claude Code Provider Runtime Management CLI — Quickly switch between multiple API provider configurations.

### Features

- **Profile Management** — Create, edit, delete, and list multiple provider profiles
- **Built-in Presets** — Support for Anthropic, Kimi, OpenRouter, and other common providers
- **One-click Switch** — Render `.claude/settings.json` and automatically inject environment variables
- **Launch Integration** — Switch profile and directly launch Claude Code
- **Safe Cleanup** — Auto backup original config, `clean` command to restore

### Installation

```bash
cd cc-use && npm install && npm link
```

Requires Node.js >= 20.0.0.

### Usage

```bash
# Shortcut: Switch profile and launch Claude
cc-use <profile>

# Render settings.json only, don't launch
cc-use use <profile>

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

# List built-in presets
cc-use preset-list

# Validate profile (optional online check and model discovery)
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# Clean: Restore project original config
cc-use clean
```

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

### 功能

- **配置文件管理** — 创建、编辑、删除、列出多个 provider 配置（profile）
- **内置预设** — 支持 Anthropic、Kimi、OpenRouter 等常见提供商
- **一键切换** — 渲染 `.claude/settings.json` 并自动注入环境变量
- **启动集成** — 切换配置后直接启动 Claude Code
- **安全清理** — 自动备份原有配置，`clean` 命令可恢复

### 安装

```bash
cd cc-use && npm install && npm link
```

需要 Node.js >= 20.0.0。

### 使用

```bash
# 快捷方式：切换配置并启动 Claude
cc-use <profile>

# 仅渲染 settings.json，不启动
cc-use use <profile>

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

# 列出内置预设
cc-use preset-list

# 校验配置（可选在线检查和模型发现）
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# 清理：恢复项目原始配置
cc-use clean
```

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
