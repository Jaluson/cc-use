# cc-use

<div align="center">

Claude Code Provider Runtime Management CLI

在多个 API 提供商配置之间快速切换 / Switch between multiple API provider configurations seamlessly

[![npm version](https://img.shields.io/npm/v/@jaluson/cc-use.svg)](https://www.npmjs.com/package/@jaluson/cc-use)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

**[中文](#中文文档)** | **[English](#english-documentation)**

---

<a id="中文文档"></a>

## 中文文档

### 简介

**cc-use** 是一款 Claude Code 提供商运行时管理 CLI 工具。它可以让你在多个 AI 提供商（如 Anthropic、Kimi、OpenRouter、智谱等）之间快速切换配置，自动渲染 `.claude/settings.json` 并注入环境变量，省去手动修改配置的麻烦。

### 功能

- **配置管理** — 创建、编辑、删除、列出多个 provider 配置（profile）
- **内置预设** — 支持 Anthropic、Kimi、OpenRouter、DeepSeek、通义千问、阿里百炼、智谱、MiniMax、xiaomimimo、Moonshot 等 12 种预设
- **一键切换** — 渲染 `settings.json` 并自动注入环境变量
- **启动集成** — 切换配置后直接启动 Claude Code
- **默认配置** — 通过 `config` 命令设定默认 profile 和默认 Claude Code 参数，命令行参数优先级更高
- **安全回滚** — 自动备份原有配置，`rollback` 命令可恢复原始状态
- **从 CC Switch 导入** — 一键迁移 CC Switch 扩展中的所有 provider 配置
- **模型发现** — 支持从提供商 API 获取可用模型列表
- **配置导出** — 导出分享版配置（自动脱敏 API Key）
- **配置校验** — 本地校验 + 在线连通性测试 + 模型发现检查

### 内置预设

| 预设 | 说明 | 特性 |
|------|------|------|
| `anthropic` | Anthropic 官方 | 官方 API 支持 |
| `kimi` | Kimi Coding Plan (CN) | 模型发现、推理模型 |
| `moonshot` | Moonshot Kimi (CN) | 模型发现、推理模型 |
| `openrouter` | OpenRouter | 模型发现、多模型聚合 |
| `zhipu` | 智谱 GLM (CN) | 模型发现、OpenAI 兼容 |
| `deepseek` | DeepSeek (CN) | 模型发现、推理模型 |
| `minimax` | MiniMax (CN) | 模型发现、OpenAI 兼容 |
| `xiaomimimo` | Xiaomi MiMo (CN) | 模型发现、推理模型 |
| `xiaomimimo-token-cn` | Xiaomi MiMo Token Plan (CN) | 模型发现、Token 计费 |
| `qwen` | Qwen (CN) | 模型发现、推理模型 |
| `aliyun-bailian` | Aliyun Bailian Token Plan (CN) | 模型发现、Token 计费 |
| `custom` | 自定义提供商 | 基础配置模板 |

### 快速开始

详细步骤请参阅 [QUICK_START.md](./QUICK_START.md)。

```bash
# 安装
npm install -g @jaluson/cc-use

# 创建第一个配置
cc-use add

# 激活并启动
cc-use <profile>

# 设定默认 profile（可选）
cc-use config set profile <name>

# 设定默认 Claude 参数（可选）
cc-use config set claudeArgs --model opus
```

### 使用方法

#### 基本操作

```bash
# 快捷方式：切换配置并启动 Claude
cc-use <profile>

# 仅渲染 settings.json，不启动
cc-use use <profile>
cc-use use <profile> --dry-run    # 预览，不写入文件

# 渲染并启动 Claude（可透传参数）
cc-use run <profile> [claude-args...]
cc-use run <profile> -- --model sonnet --verbose

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
cc-use rm <profile...>

# 列出内置预设
cc-use preset-list

# 校验配置
cc-use validate <profile>
cc-use validate <profile> --online       # 包含连通性检查
cc-use validate <profile> --discovery    # 包含模型发现

# 导出配置（分享用，自动脱敏）
cc-use export <profile>
cc-use export <profile> -o <file>

# 回滚：恢复项目原始配置
cc-use rollback
cc-use clean    # rollback 的别名
```

#### 默认配置管理

```bash
cc-use config                             # 列出所有配置
cc-use config set profile <name>          # 设定默认 profile
cc-use config set claudeArgs --model opus # 设定默认 Claude 参数
cc-use config get <key>                   # 获取配置值
cc-use config delete <key>                # 删除配置值
```

| Key | 说明 | 示例 |
|-----|------|------|
| `profile` | `use` / `run` 的默认 profile | `cc-use config set profile my-kimi` |
| `claudeArgs` | 默认传递给 Claude Code 的参数 | `cc-use config set claudeArgs --model opus` |

当默认参数与命令行参数冲突时，命令行参数优先：

```bash
# 默认: --model opus  命令行: --model sonnet
cc-use config set claudeArgs --model opus
cc-use run --model sonnet   # 实际使用 --model sonnet
```

#### 从 CC Switch 迁移

```bash
cc-use import-cc --dry-run    # 预览
cc-use import-cc               # 导入所有配置
```

### 工作原理

1. 每个 profile 存储在 `~/.config/cc-use/profiles/` 下，记录了预设 ID 和环境变量
2. `use` / `run` 时读取 profile 和对应 preset，渲染 `.claude/settings.json`
3. 自动清理上次注入的环境变量，避免冲突
4. 首次使用时会备份原配置到 `.original`，支持完整回滚
5. 元数据保存在 `.claude/cc-use.json`，用于追踪和回滚

### 开发

```bash
cd cc-use
npm install
npm run dev       # watch 模式构建
npm run build     # 生产构建
npm test          # 交互式测试（watch 模式）
npm run test:run  # 运行测试一次并退出
```

---

<a id="english-documentation"></a>

## English Documentation

### Introduction

**cc-use** is a Claude Code provider runtime management CLI. It allows you to quickly switch between multiple AI providers (such as Anthropic, Kimi, OpenRouter, Zhipu, etc.), automatically rendering `.claude/settings.json` and injecting environment variables without manual configuration edits.

### Features

- **Profile Management** — Create, edit, delete, and list multiple provider configurations
- **Built-in Presets** — 12 presets including Anthropic, Kimi, OpenRouter, DeepSeek, Qwen, Aliyun Bailian, Zhipu, MiniMax, xiaomimimo, Moonshot, and more
- **One-Command Switch** — Render `settings.json` and auto-inject environment variables
- **Launch Integration** — Switch config and launch Claude Code in one step
- **Default Config** — Set default profile and default Claude Code args via `config` command; CLI args take precedence on conflicts
- **Safe Rollback** — Automatic backup of original config; `rollback` restores pre-cc-use state
- **Import from CC Switch** — One-command migration from CC Switch browser extension
- **Model Discovery** — Fetch available model lists from provider APIs
- **Profile Export** — Export shareable profiles with secrets masked
- **Config Validation** — Local validation + online connectivity test + model discovery check

### Built-in Presets

| Preset | Description | Features |
|--------|-------------|----------|
| `anthropic` | Anthropic Official | Official API support |
| `kimi` | Kimi Coding Plan (CN) | Model discovery, reasoning models |
| `moonshot` | Moonshot Kimi (CN) | Model discovery, reasoning models |
| `openrouter` | OpenRouter | Model discovery, multi-model aggregation |
| `zhipu` | Zhipu GLM (CN) | Model discovery, OpenAI-compatible |
| `deepseek` | DeepSeek (CN) | Model discovery, reasoning models |
| `minimax` | MiniMax (CN) | Model discovery, OpenAI-compatible |
| `xiaomimimo` | Xiaomi MiMo (CN) | Model discovery, reasoning models |
| `xiaomimimo-token-cn` | Xiaomi MiMo Token Plan (CN) | Model discovery, token billing |
| `qwen` | Qwen (CN) | Model discovery, reasoning models |
| `aliyun-bailian` | Aliyun Bailian Token Plan (CN) | Model discovery, token billing |
| `custom` | Custom Provider | Base configuration template |

### Quick Start

See [QUICK_START.md](./QUICK_START.md) for a step-by-step guide.

```bash
# Install
npm install -g @jaluson/cc-use

# Create your first profile
cc-use add

# Activate and launch
cc-use <profile>

# Set default profile (optional)
cc-use config set profile <name>

# Set default Claude args (optional)
cc-use config set claudeArgs --model opus
```

### Usage

#### Basic Operations

```bash
# Shortcut: switch profile and launch Claude
cc-use <profile>

# Render settings.json only, don't launch
cc-use use <profile>
cc-use use <profile> --dry-run    # Preview without writing

# Render and launch Claude (pass-through args supported)
cc-use run <profile> [claude-args...]
cc-use run <profile> -- --model sonnet --verbose

# Interactive profile creation
cc-use add
cc-use add --preset <preset-id> --profile <name>

# List / show / edit profiles
cc-use list
cc-use show <profile>
cc-use edit <profile>

# Show currently active profile
cc-use current

# Remove profiles
cc-use remove <profile...>
cc-use rm <profile...>

# List built-in presets
cc-use preset-list

# Validate profile
cc-use validate <profile>
cc-use validate <profile> --online       # Include connectivity check
cc-use validate <profile> --discovery    # Include model discovery

# Export profile for sharing (secrets are masked)
cc-use export <profile>
cc-use export <profile> -o <file>

# Rollback: restore project to pre-cc-use state
cc-use rollback
cc-use clean    # alias for rollback
```

#### Default Configuration

```bash
cc-use config                             # List all config values
cc-use config set profile <name>          # Set default profile
cc-use config set claudeArgs --model opus # Set default Claude args
cc-use config get <key>                   # Get a config value
cc-use config delete <key>                # Delete a config value
```

| Key | Description | Example |
|-----|-------------|---------|
| `profile` | Default profile for `use` / `run` | `cc-use config set profile my-kimi` |
| `claudeArgs` | Default args passed to Claude Code | `cc-use config set claudeArgs --model opus` |

When both default and CLI args are provided, CLI args take precedence on conflicts:

```bash
# Default: --model opus  CLI: --model sonnet
cc-use config set claudeArgs --model opus
cc-use run --model sonnet   # Uses --model sonnet
```

#### Migrating from CC Switch

```bash
cc-use import-cc --dry-run    # Preview
cc-use import-cc               # Import all configurations
```

### How It Works

1. Each profile is stored in `~/.config/cc-use/profiles/`, recording the preset ID and environment variables
2. On `use` / `run`, reads the profile and corresponding preset, then renders `.claude/settings.json`
3. Automatically cleans up previously injected environment variables to avoid conflicts
4. On first use, backs up the original config to `.original`, enabling full rollback
5. Metadata is saved in `.claude/cc-use.json` for tracking and rollback purposes

### Development

```bash
cd cc-use
npm install
npm run dev       # watch mode build
npm run build     # production build
npm test          # interactive tests (watch mode)
npm run test:run  # run tests once and exit
```

### Version History

See [VERSION.md](./VERSION.md) for the full changelog.

---

## License

MIT License © [Jaluson](https://github.com/Jaluson)
