# Local agent workflow (gitignored in target repos)

Installed by `agent-workflow-template/scripts/Apply-AgentWorkflow.ps1`.

| Path | Role |
|------|------|
| `project.config.json` | Issue prefixes, base branch, daily report naming, PR reviewers |
| `rules/` | Agent rules (`.mdc`) |
| `context/` | Stable reference — start at `ROUTING.md` |
| `skills/` | Workflow skills |
| `tools/cli/` | `memory.mjs`, `temp-cleanup.mjs` |
| `secrets/` | Tokens and env files — never commit |
| `temp/<issue>/` | Attachments and QA screenshots |
| `reports/` | Daily markdown logs |
| `memory/` | Episodic JSONL + optional playbooks |

Repo root **`AGENTS.md`** points assistants here (Claude Code, Codex, etc.).

**Cursor users:** mirror into `.cursor/` with `scripts/adapters/Sync-CursorRules.ps1` or `Apply-AgentWorkflow.ps1 -SyncCursor`.

Copy `mcp.json.example` to `mcp.json` when your IDE supports MCP.
