# MiniMax Plan Usage

Query MiniMax Coding Plan usage statistics via CLI.

## Installation

```bash
npm install -g @yakumoryo/minimax-plan-usage
```

## Usage

```bash
minimax-plan-usage
```

Or with npx:

```bash
npx @yakumoryo/minimax-plan-usage
```

## Requirements

- Node.js >= 18
- `ANTHROPIC_AUTH_TOKEN` environment variable set
- `ANTHROPIC_BASE_URL` environment variable set

These are typically already configured in your Claude Code settings.

## How it works

The CLI uses the same `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` that Claude Code uses. Based on the base URL, it determines the correct MiniMax API endpoint:

- If `ANTHROPIC_BASE_URL` contains `minimax.io` → uses `https://minimax.io`
- Otherwise → uses `https://api.minimaxi.com` (default)
