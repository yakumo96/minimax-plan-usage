# MiniMax Plan Usage

Query MiniMax Coding Plan usage statistics via CLI.

## Installation

### Claude Code Plugin (Recommended)

```bash
/plugin yakumo96/minimax-plan-usage
```

### npm Package (CLI only)

```bash
npm install -g @yakumoryo/minimax-plan-usage
```

## Quick Start

```bash
# Configure API Key (required first time)
npx @yakumoryo/minimax-plan-usage setup <your-token>

# Query usage
npx @yakumoryo/minimax-plan-usage query
```

## Optional Setup

```bash
# Configure API URL (for non-default endpoints)
npx @yakumoryo/minimax-plan-usage setup-url https://api.minimaxi.com/anthropic

# Configure Model (for custom model names)
npx @yakumoryo/minimax-plan-usage setup-model MiniMax-M2.7
```

## Requirements

- Node.js >= 18

The CLI reads settings from `~/.claude/settings.json` and uses the same authentication that Claude Code uses.

## How it works

The CLI reads settings from `~/.claude/settings.json` and uses the same `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` that Claude Code uses.
