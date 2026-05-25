# cc-use

[English](#english) | [中文](#中文)

---

## English

[![npm version](https://img.shields.io/npm/v/@jaluson/cc-use.svg)](https://www.npmjs.com/package/@jaluson/cc-use)

Claude Code Provider Runtime Management CLI �?Quickly switch between multiple API provider configurations.

### Features

- **Profile Management** �?Create, edit, delete, and list multiple provider profiles
- **Built-in Presets** �?Support for Anthropic, Kimi, OpenRouter, DeepSeek, Qwen, Aliyun Bailian, Zhipu, MiniMax, xiaomimimo, Moonshot and more
- **One-click Switch** �?Render `.claude/settings.json` and automatically inject environment variables
- **Launch Integration** �?Switch profile and directly launch Claude Code
- **Default Config** �?Set default profile and default Claude Code args via `config` command
- **Safe Cleanup** �?Auto backup original config, `rollback` command to restore
- **Import from CC Switch** �?One-command migration from CC Switch extension configurations
- **Model Discovery** �?Auto-fetch available models from remote API endpoints
- **Configuration Validation** �?Local schema checks plus optional online connectivity verification
- **Export & Share** �?Export profiles with secrets masked for safe sharing

### Installation

```bash
npm install -g @jaluson/cc-use
```

Requires Node.js >= 20.0.0.

### Quick Start

See [QUICK_START.md](../QUICK_START.md) for a step-by-step guide.

### Usage

```bash
# Shortcut: Switch profile and launch Claude
cc-use <profile>

# Render settings.json only, don't launch
cc-use use <profile>
cc-use use <profile> --dry-run    # Preview without writing

# Render and launch Claude (can passthrough args)
cc-use run <profile> [claude-args...]
cc-use run <profile> -- --model sonnet --verbose

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

# Validate profile
cc-use validate <profile>
cc-use validate <profile> --online       # Include connectivity check
cc-use validate <profile> --discovery    # Include model discovery

# Export profile (secrets are masked)
cc-use export <profile>
cc-use export <profile> -o <file>

# Import from CC Switch
cc-use import-from-cc-switch
cc-use import-cc             # Alias
cc-use import-cc --dry-run   # Preview without writing

# Default configuration
cc-use config                             # List all config values
cc-use config set profile <name>          # Set default profile
cc-use config set claudeArgs --model opus # Set default Claude args
cc-use config get <key>                   # Get a config value
cc-use config delete <key>                # Delete a config value

# Rollback: Restore project original config
cc-use rollback
cc-use clean                 # Alias
```

### Default Configuration

`cc-use config` manages default values used when no explicit argument is given:

| Key | Description | Example |
|-----|-------------|---------|
| `profile` | Default profile for `use` / `run` | `cc-use config set profile my-kimi` |
| `claudeArgs` | Default args passed to Claude Code | `cc-use config set claudeArgs --model opus` |

When both default and CLI args are provided, CLI args take precedence on conflicts. For example:

```bash
# Default: --model opus  CLI: --model sonnet
cc-use config set claudeArgs --model opus
cc-use run --model sonnet   # Uses --model sonnet
```

Config is stored at `~/.config/cc-use/config.json`.

### How It Works

1. Each profile is stored in `~/.config/cc-use/profiles/`, recording the preset ID and environment variables
2. When `use` / `run` executes, it reads the profile and corresponding preset, then renders `.claude/settings.json`
3. Automatically cleans up previously injected environment variables to avoid conflicts
4. Metadata is saved in `.claude/cc-use.json` for tracking and rollback

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

[![npm version](https://img.shields.io/npm/v/@jaluson/cc-use.svg)](https://www.npmjs.com/package/@jaluson/cc-use)

Claude Code Provider Runtime Management CLI �?在多�?API 提供商配置之间快速切换�?

### 功能

- **配置文件管理** �?创建、编辑、删除、列出多�?provider 配置（profile�?
- **内置预设** �?支持 Anthropic、Kimi、OpenRouter、DeepSeek、通义千问、阿里百炼、智谱、MiniMax、xiaomimimo、Moonshot �?
- **一键切�?* �?渲染 `.claude/settings.json` 并自动注入环境变�?
- **启动集成** �?切换配置后直接启�?Claude Code
- **默认配置** �?通过 `config` 命令设定默认 profile 和默�?Claude Code 参数
- **安全清理** �?自动备份原有配置，`rollback` 命令可恢�?
- **�?CC Switch 导入** �?�?CC Switch 扩展配置一键迁�?
- **模型发现** �?从远�?API 自动获取可用模型列表
- **配置校验** �?本地 schema 检�?+ 可选在线连通性验�?
- **导出分享** �?导出 profile 时自动脱敏，安全分享

### 安装

```bash
npm install -g @jaluson/cc-use
```

需�?Node.js >= 20.0.0�?

### 快速开�?

请参�?[QUICK_START.md](../QUICK_START.md) 获取详细步骤�?

### 使用

```bash
# 快捷方式：切换配置并启动 Claude
cc-use <profile>

# 仅渲�?settings.json，不启动
cc-use use <profile>
cc-use use <profile> --dry-run    # 预览不写�?

# 渲染并启�?Claude（可透传参数�?
cc-use run <profile> [claude-args...]
cc-use run <profile> -- --model sonnet --verbose

# 交互式创建配�?
cc-use add
cc-use add --preset <preset-id> --profile <name>

# 列出所有配�?/ 查看详情 / 编辑
cc-use list
cc-use show <profile>
cc-use edit <profile>

# 查看当前激活的配置
cc-use current

# 删除配置
cc-use remove <profile...>
cc-use remove              # 交互式多选模�?

# 列出内置预设
cc-use preset-list

# 校验配置
cc-use validate <profile>
cc-use validate <profile> --online       # 包含连通性检�?
cc-use validate <profile> --discovery    # 包含模型发现

# 导出配置（自动脱敏）
cc-use export <profile>
cc-use export <profile> -o <file>

# �?CC Switch 导入
cc-use import-from-cc-switch
cc-use import-cc             # 别名
cc-use import-cc --dry-run   # 预览不写�?

# 默认配置管理
cc-use config                             # 列出所有配�?
cc-use config set profile <name>          # 设定默认 profile
cc-use config set claudeArgs --model opus # 设定默认 Claude 参数
cc-use config get <key>                   # 获取配置�?
cc-use config delete <key>                # 删除配置�?

# 回滚：恢复项目原始配�?
cc-use rollback
cc-use clean                 # 别名
```

### 默认配置

`cc-use config` 管理未显式指定参数时使用的默认值：

| Key | 说明 | 示例 |
|-----|------|------|
| `profile` | `use` / `run` 的默�?profile | `cc-use config set profile my-kimi` |
| `claudeArgs` | 默认传递给 Claude Code 的参�?| `cc-use config set claudeArgs --model opus` |

当默认参数与命令行参数冲突时，命令行参数优先。例如：

```bash
# 默认: --model opus  命令�? --model sonnet
cc-use config set claudeArgs --model opus
cc-use run --model sonnet   # 实际使用 --model sonnet
```

配置文件存储�?`~/.config/cc-use/config.json`�?

### �?CC Switch 迁移

如果你一直在使用 **CC Switch** 浏览器扩展管�?Claude Code provider，可以一键迁移所有配置：

```bash
# 预览将要导入的内�?
cc-use import-cc --dry-run

# 导入所�?provider
cc-use import-cc
```

导入过程会：
1. 读取 CC Switch 中的所�?provider 配置
2. 将每�?provider 映射到对应的内置预设
3. 选择批量导入或逐个确认
4. 处理名称冲突（覆�?/ 重命�?/ 跳过�?
5. 将所�?profile 保存�?`~/.config/cc-use/profiles/`

### 工作原理

1. 每个 profile 存储�?`~/.config/cc-use/profiles/` 下，记录了预�?ID 和环境变�?
2. `use` / `run` 时读�?profile 和对�?preset，渲�?`.claude/settings.json`
3. 自动清理上次注入的环境变量，避免冲突
4. 元数据保存在 `.claude/cc-use.json`，用于追踪和回滚

### 开�?

```bash
npm install
npm run dev      # watch 模式构建
npm run build    # 构建
npm test         # 运行测试
```

### 许可�?

MIT
