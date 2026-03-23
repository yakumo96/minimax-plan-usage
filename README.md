# MiniMax Plan Usage

Query MiniMax Coding Plan usage statistics.

## Installation

In Claude Code, run:
```
/plugin yakumoryo/minimax-plan-usage
```

## Usage

After installation, run:
```
/minimax-plan-usage:usage-query
```

## How it works

The plugin uses the same `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` that Claude Code uses. Based on the base URL, it determines the correct MiniMax API endpoint:

- If `ANTHROPIC_BASE_URL` contains `minimax.io` → uses `https://minimax.io`
- Otherwise → uses `https://api.minimaxi.com` (default)

## Requirements

- Node.js installed
- `ANTHROPIC_AUTH_TOKEN` environment variable set
- `ANTHROPIC_BASE_URL` environment variable set

These are typically already configured in your Claude Code settings.
