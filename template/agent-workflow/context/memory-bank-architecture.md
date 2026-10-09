# Memory bank

| Layer | Role |
|-------|------|
| `rules/` + `context/` | Stable conventions |
| `memory/episodic/events.jsonl` | Ticket decisions with provenance |
| `memory/playbooks/` | Compacted patterns (optional) |
| MCP `memory` graph | Optional cross-ticket graph |

## Retrieval order

1. Rules
2. Live issue (tracker MCP/API) + `.agent-workflow/temp/<key>/`
3. `memory.mjs bootstrap` / `context --issue`
4. Context docs
5. MCP graph if enabled

## CLI

```bash
node .agent-workflow/tools/cli/memory.mjs bootstrap
node .agent-workflow/tools/cli/memory.mjs log --issue PROJ-1 --symptom "..." --decision "..." \
  --confidence verified --source code --sources "path/to/file"
node .agent-workflow/tools/cli/memory.mjs compact --dry-run
```

Never log passwords, tokens, or PII.
