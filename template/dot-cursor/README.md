# Local Cursor context (gitignored in target repos)

Copied by `cursor-agent-workflow-template/scripts/Apply-CursorWorkflow.ps1`.

| Path | Role |
|------|------|
| `project.config.json` | Issue prefixes, base branch, daily report naming, PR reviewers |
| `rules/` | Cursor rules (`.mdc`) |
| `context/` | Stable reference — start at `ROUTING.md` |
| `skills/` | Workflow skills for agents |
| `tools/cli/` | `memory.mjs`, `temp-cleanup.mjs` |
| `secrets/` | Tokens and env files — never commit |
| `temp/<issue>/` | Attachments and QA screenshots |
| `reports/` | Daily markdown logs |
| `memory/` | Episodic JSONL + optional playbooks |

Back up `secrets/` and `reports/` with the rest of your machine backup.
