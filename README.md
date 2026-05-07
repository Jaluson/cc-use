# cc-use

<div align="center">

Claude Code Provider Runtime Management CLI

在多个 API 提供商配置之间快速切换 / Switch between multiple API provider configurations seamlessly

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
- **一键切换** — 渲染 `settings.json` 并自动注入环境变量
- **启动集成** — 切换配置后直接启动 Claude Code
- **安全回滚** — 自动备份原有配置，`rollback` 命令可恢复原始状态
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

### 安装

```bash
cd cc-use && npm install && npm link
```

需要 Node.js >= 20.0.0。

### 使用方法

```bash
# 快捷方式：切换配置并启动 Claude
cc-use <profile>

# 仅渲染 settings.json，不启动
cc-use use <profile>
cc-use use <profile> --dry-run    # 预览，不写入文件

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
cc-use rm <profile...>

# 列出内置预设
cc-use preset-list

# 校验配置（可选在线检查和模型发现）
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# 导出配置（分享用，自动脱敏）
cc-use export <profile>
cc-use export <profile> -o <file>

# 回滚：恢复项目原始配置
cc-use rollback
cc-use clean    # rollback 的别名
```

### 工作原理

1. 每个 profile 存储在 `~/.config/cc-use/profiles/` 下，记录了预设 ID 和环境变量
2. `use` / `run` 时读取 profile 和对应 preset，渲染 `.claude/settings.json`
3. 自动清理上次注入的环境变量，避免冲突
4. 首次使用时会备份原配置到 `.original`，支持完整回滚
5. 元数据保存在 `.claude/cc-use.json`，用于追踪和回滚

### 开发

```bash
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
- **One-Command Switch** — Render `settings.json` and auto-inject environment variables
- **Launch Integration** — Switch config and launch Claude Code in one step
- **Safe Rollback** — Automatic backup of original config; `rollback` restores pre-cc-use state
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

### Installation

```bash
cd cc-use && npm install && npm link
```

Requires Node.js >= 20.0.0.

### Usage

```bash
# Shortcut: switch profile and launch Claude
cc-use <profile>

# Render settings.json only, don't launch
cc-use use <profile>
cc-use use <profile> --dry-run    # Preview without writing

# Render and launch Claude (pass-through args supported)
cc-use run <profile> [claude-args...]
cc-use run <profile> -- [claude-args...]

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

# Validate profile (optional online/discovery checks)
cc-use validate <profile>
cc-use validate <profile> --online
cc-use validate <profile> --discovery

# Export profile for sharing (secrets are masked)
cc-use export <profile>
cc-use export <profile> -o <file>

# Rollback: restore project to pre-cc-use state
cc-use rollback
cc-use clean    # alias for rollback
```

### How It Works

1. Each profile is stored in `~/.config/cc-use/profiles/`, recording the preset ID and environment variables
2. On `use` / `run`, reads the profile and corresponding preset, then renders `.claude/settings.json`
3. Automatically cleans up previously injected environment variables to avoid conflicts
4. On first use, backs up the original config to `.original`, enabling full rollback
5. Metadata is saved in `.claude/cc-use.json` for tracking and rollback purposes

### Development

```bash
npm install
npm run dev       # watch mode build
npm run build     # production build
npm test          # interactive tests (watch mode)
npm run test:run  # run tests once and exit
```

---

## License

MIT License © [Jaluson](https://github.com/Jaluson)
