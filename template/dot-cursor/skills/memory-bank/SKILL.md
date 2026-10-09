---
name: memory-bank
description: Episodic memory — bootstrap, log, compact
---

# Memory bank

See `.cursor/context/memory-bank-architecture.md` and `proj-memory-bank.mdc`.

```bash
node .cursor/tools/cli/memory.mjs bootstrap [--issue PROJ-123]
node .cursor/tools/cli/memory.mjs log ...
node .cursor/tools/cli/memory.mjs query --issue PROJ-123
node .cursor/tools/cli/memory.mjs compact --dry-run
```

Log after verified QA, merge, or confirmed root cause — one event per milestone.
