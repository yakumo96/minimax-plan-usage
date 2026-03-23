# MiniMax Plan Usage

Query MiniMax Coding Plan usage statistics via CLI.

## Installation

```bash
npm install -g @yakumoryo/minimax-plan-usage
```

## Usage

```bash
# Configure API Key (required first time)
minimax-plan-usage setup <your-token>

# Configure API URL (optional, for non-default endpoints)
minimax-plan-usage setup-url https://api.minimaxi.com/anthropic

# Query usage
minimax-plan-usage query
```

Or with npx:

```bash
npx @yakumoryo/minimax-plan-usage setup <your-token>
npx @yakumoryo/minimax-plan-usage setup-url https://api.minimaxi.com/anthropic
npx @yakumoryo/minimax-plan-usage query
```

## Requirements

- Node.js >= 18
- `ANTHROPIC_AUTH_TOKEN` environment variable set
- `ANTHROPIC_BASE_URL` environment variable set

These are typically already configured in your Claude Code settings.

## How it works

The CLI reads settings from `~/.claude/settings.json` and uses the same `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` that Claude Code uses.
