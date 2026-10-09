# Cursor agent workflow template

Reusable **`.cursor/`** layout for AI-assisted development: rules, skills, episodic memory, temp evidence, and daily reports. Apply to any repository and tune `project.config.json` for your issue keys, SCM, and optional MCP integrations.

## Quick start

```powershell
cd path\to\cursor-agent-workflow-template
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\path\to\YourRepo"
```

Edit **`YourRepo/.cursor/project.config.json`** (issue prefixes, GitHub handle, reviewers, report file name).

Add to the target **`.gitignore`** (the apply script appends this when missing):

```gitignore
.cursor/
```

Rules and skills are copied into the project; secrets, reports, and temp evidence stay local and out of git.

## What you get

| Area | Purpose |
|------|---------|
| `rules/` | Agent behavior: routing, git, issue comments, PR gates, memory, minimal diffs |
| `skills/` | Session start, sprint pickup, memory bank, issue context, PR prepare/create |
| `context/` | `ROUTING.md`, `PROJECT.md` stub, QA evidence, comment tone |
| `tools/` | `memory.mjs` (episodic log + bootstrap), `temp-cleanup.mjs` |
| `memory/` | JSONL events, optional playbooks, MCP graph store |
| `temp/` | Issue attachments + QA screenshots (session WIP) |
| `reports/` | Daily work log markdown |
| `secrets/` | Local credentials (gitignored) |

## Customize per project

1. `project.config.example.json` → `.cursor/project.config.json` (apply script on first install).
2. Fill **`.cursor/context/PROJECT.md`** — stack, run locally, CI, **how your issue tracker is accessed** (MCP id, API, or manual).
3. Optional: **`.cursor/mcp.json`** from `mcp.json.example` — wire whatever MCP servers you use (SCM, issue tracker, chat).
4. Optional: add project-specific CLIs under `.cursor/tools/` (`proj-tools-layout.mdc`).

## Verify memory CLI

```bash
node .cursor/tools/cli/memory.mjs bootstrap
node .cursor/tools/cli/memory.mjs log --issue PROJ-1 --symptom "test" --decision "template ok" --confidence fact --source other --sources "readme"
```

## Issue tracker and SCM

This template is **vendor-neutral**. It does not assume any particular issue tracker, SCM, or chat product. Document your choices in `PROJECT.md` and `project.config.json` → `issueTracker` / `integrations`.
