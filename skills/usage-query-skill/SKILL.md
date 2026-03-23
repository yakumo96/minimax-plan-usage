---
name: usage-query-skill
description: Run the usage query script to retrieve account usage information for MiniMax Coding Plan. Only use when invoked by usage-query-agent.
allowed-tools: Bash, Read
---

# MiniMax Usage Query Skill

Execute the usage query script and return the result.

## Critical constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### Run the query

Use Node.js to execute the bundled script:

```bash
node skills/usage-query-skill/scripts/query-usage.mjs
```

### Return the result

After execution, return the result to the caller:
- **Success**: display the usage information in Chinese
- **Failure**: show the error details and likely cause