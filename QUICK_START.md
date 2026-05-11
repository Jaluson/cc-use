# Quick Start Guide

[English](#english) | [中文](#中文)

---

## English

### 1. Install

```bash
npm install -g @jaluson/cc-use
```

Verify installation:

```bash
cc-use --version
```

### 2. Create Your First Profile

Run the interactive wizard:

```bash
cc-use add
```

You will be prompted to:

1. **Select a provider preset** — Choose from built-in presets like Kimi, OpenRouter, Anthropic, DeepSeek, etc.
2. **Name your profile** — e.g. `my-kimi`, `work-openrouter`
3. **Fill in credentials** — Enter API keys, base URLs, etc. (secret fields are masked)
4. **Configure models** — Auto-discovered from the provider API, or enter manually

Or create with flags:

```bash
cc-use add --preset kimi --profile my-kimi
```

### 3. Activate a Profile

```bash
# Switch to a profile (writes .claude/settings.json)
cc-use use my-kimi

# Or switch + launch Claude in one command
cc-use my-kimi
```

### 4. Set Default Profile (Optional)

If you mostly use one profile, set it as default:

```bash
cc-use config set profile my-kimi
```

Now `cc-use run` or `cc-use use` without arguments will use `my-kimi`.

### 5. Set Default Claude Args (Optional)

Auto-pass arguments to Claude Code every time:

```bash
cc-use config set claudeArgs --model opus
```

CLI args override defaults when conflicting:

```bash
cc-use run --model sonnet   # Uses sonnet, not opus
```

### Common Commands

```bash
cc-use list                    # List all profiles
cc-use show my-kimi            # View profile details
cc-use edit my-kimi            # Edit a profile
cc-use current                 # Show active profile
cc-use remove my-kimi          # Delete a profile
cc-use rollback                # Restore original .claude/settings.json
cc-use preset-list             # List available provider presets
cc-use config list             # Show all default config values
```

### Migrating from CC Switch

```bash
cc-use import-cc --dry-run    # Preview
cc-use import-cc               # Import all
```

---

## 中文

### 1. 安装

```bash
npm install -g @jaluson/cc-use
```

验证安装：

```bash
cc-use --version
```

### 2. 创建第一个配置

运行交互式向导：

```bash
cc-use add
```

向导将引导你：

1. **选择 provider 预设** — 从 Kimi、OpenRouter、Anthropic、DeepSeek 等内置预设中选择
2. **命名 profile** — 例如 `my-kimi`、`work-openrouter`
3. **填写凭据** — 输入 API Key、Base URL 等（密钥字段自动遮蔽）
4. **配置模型** — 自动从 provider API 获取可用模型，或手动输入

也可以用命令行参数直接创建：

```bash
cc-use add --preset kimi --profile my-kimi
```

### 3. 激活配置

```bash
# 仅切换（写入 .claude/settings.json）
cc-use use my-kimi

# 或者切换并直接启动 Claude
cc-use my-kimi
```

### 4. 设定默认 Profile（可选）

如果你主要使用一个 profile，可以设为默认：

```bash
cc-use config set profile my-kimi
```

之后 `cc-use run` 或 `cc-use use` 不带参数时自动使用 `my-kimi`。

### 5. 设定默认 Claude 参数（可选）

每次启动 Claude Code 自动传入参数：

```bash
cc-use config set claudeArgs --model opus
```

命令行参数优先级更高：

```bash
cc-use run --model sonnet   # 实际使用 sonnet，不是 opus
```

### 常用命令

```bash
cc-use list                    # 列出所有配置
cc-use show my-kimi            # 查看配置详情
cc-use edit my-kimi            # 编辑配置
cc-use current                 # 查看当前激活的配置
cc-use remove my-kimi          # 删除配置
cc-use rollback                # 恢复原始 .claude/settings.json
cc-use preset-list             # 列出可用的 provider 预设
cc-use config list             # 查看所有默认配置
```

### 从 CC Switch 迁移

```bash
cc-use import-cc --dry-run    # 预览
cc-use import-cc               # 导入所有
```
