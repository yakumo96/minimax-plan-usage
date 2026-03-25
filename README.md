# MiniMax Plan Usage

Query MiniMax Coding Plan usage statistics via CLI.

## Installation

```bash
npm install -g @yakumoryo/minimax-plan-usage
```

## Setup

```bash
# 1. Configure API Key (required)
npx @yakumoryo/minimax-plan-usage setup <your-token>

# 2. Configure API URL (optional, for non-default endpoints)
npx @yakumoryo/minimax-plan-usage setup-url https://api.minimaxi.com/anthropic

# 3. Configure Model (optional, for custom model names)
npx @yakumoryo/minimax-plan-usage setup-model MiniMax-M2.7
```

## Query Usage

```bash
npx @yakumoryo/minimax-plan-usage query
```

## Requirements

- Node.js >= 18

The CLI reads settings from `~/.claude/settings.json` and uses the same authentication that Claude Code uses.

## How it works

The CLI reads settings from `~/.claude/settings.json` and uses the same `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` that Claude Code uses.
