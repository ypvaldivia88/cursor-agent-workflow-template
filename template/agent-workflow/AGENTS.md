# Agent workflow (this repository)

This project uses a **tool-agnostic** agent kit under **`.agent-workflow/`** (gitignored).

## Start here

1. Run once per chat/session: `node .agent-workflow/tools/cli/memory.mjs bootstrap`
2. Read routing: `.agent-workflow/context/ROUTING.md`
3. Follow rules in `.agent-workflow/rules/` and skills in `.agent-workflow/skills/`
4. Project-specific facts: `.agent-workflow/context/PROJECT.md` and `.agent-workflow/project.config.json`

## By tool

| Tool | How it loads this kit |
|------|------------------------|
| **Claude Code**, **OpenAI Codex**, **Gemini CLI**, **Aider**, etc. | This `AGENTS.md` at repo root + paths above |
| **Cursor** | Run `Sync-CursorRules.ps1` so `.cursor/rules` and `.cursor/skills` mirror `.agent-workflow/` (or use `Apply-AgentWorkflow.ps1 -SyncCursor`) |
| **GitHub Copilot** | Point workspace instructions at `.agent-workflow/context/PROJECT.md` and key rules; no standard skills folder |
| **Windsurf / Cline / Continue** | Same as Cursor where the product supports `.cursor/rules`; otherwise cite `AGENTS.md` and `ROUTING.md` in your system prompt |

Secrets live only in `.agent-workflow/secrets/` — never commit them.
