# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.5] - 2025-05-11

### Added

- `config` command for managing default configuration (`set`, `get`, `delete`, `list`)
- Support default profile — `cc-use config set profile <name>` for auto-selecting profile in `use` / `run`
- Support default Claude Code args — `cc-use config set claudeArgs --model opus` with smart merge on conflicts (CLI args take precedence)
- `cc-use config` with no subcommand shows a friendly list of all configurable keys

### Fixed

- Removed unused `enquirer` dependency
- Extract shared `stripAnsi` utility from duplicated implementations in `ui/box.ts` and `ui/table.ts`
- Refactored `drawBox` / `drawDoubleBox` into unified `renderBox` with `BoxChars` parameter
- Fixed operator precedence bug in `ui/header.ts` — `description?.length || 0 + 4` was evaluating `0 + 4` first
- Fixed SQL injection in `cc-switch-reader.ts` — replaced string concatenation with parameterized queries
- Changed error messages in `cc-switch-reader.ts` from Chinese to English
- Fixed timer leak in `validate.ts` — added `clearTimeout` after fetch
- Fixed version assertion in integration tests — now reads dynamically from `package.json`

## [0.1.4] - 2025-05-08

### Added

- Import from CC Switch — one-command migration from CC Switch browser extension
- Redesigned CLI UI — industrial-precision visual style with bordered tables, panels, and consistent iconography

## [0.1.3] - 2025-05-07

### Changed

- Translated all CLI messages to English
- Bumped version to 0.1.3

## [0.1.2] - 2025-05-06

### Added

- Interactive multi-select removal — `cc-use remove` without arguments launches multi-select mode
- Profile fuzzy matching suggestions on not-found errors

## [0.1.1] - 2025-05-05

### Added

- Model discovery — auto-fetch available models from provider API endpoints
- Configuration validation with `--online` and `--discovery` flags
- Export profiles with secrets masked for safe sharing

## [0.1.0] - 2025-05-04

### Added

- Initial release
- Profile management — create, edit, delete, list provider profiles
- Built-in presets — Anthropic, Kimi, OpenRouter, DeepSeek, Qwen, Aliyun Bailian, Zhipu, MiniMax, xiaomimimo, Moonshot
- `use` command — render `.claude/settings.json` for a profile
- `run` command — render and launch Claude Code
- `rollback` command — restore original configuration
- Atomic file writes with backup/restore pattern
- Git safety check — warn if `.claude/` is not in `.gitignore`
