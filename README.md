# Cursor agent workflow template

Reusable **`.cursor/`** layout distilled from a production team workflow (rules, skills, memory bank, temp evidence, daily reports). Apply it to any repo and customize `project.config.json`.

## Quick start

```powershell
cd D:\Devops\Repos\cursor-agent-workflow-template
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\Devops\Repos\MyApp"
```

Then edit **`MyApp/.cursor/project.config.json`** (issue prefixes, GitHub handle, reviewers, report file name).

Add to the repo **`.gitignore`** (if not already):

```gitignore
.cursor/
```

The whole `.cursor` folder stays local — rules and skills are copied in; secrets and reports never go to git.

## What you get

| Area | Purpose |
|------|---------|
| `rules/` | Agent behavior: routing, git, Jira comments, PR gates, memory, minimal diffs |
| `skills/` | Session start, sprint pickup, memory bank, Jira context, PR prepare/create |
| `context/` | `ROUTING.md`, project stub, QA evidence, Jira tone |
| `tools/` | `memory.mjs` (episodic log + bootstrap), `temp-cleanup.mjs` |
| `memory/` | JSONL events, optional playbooks, MCP graph store |
| `temp/` | Ticket attachments + QA screenshots (session WIP) |
| `reports/` | Daily work log markdown |
| `secrets/` | Local credentials (gitignored) |

## Customize per project

1. Copy `project.config.example.json` → `.cursor/project.config.json` (the apply script does this on first install).
2. Fill in `.cursor/context/PROJECT.md` — stack, folders, how to run locally, where CI lives.
3. Optional: `.cursor/mcp.json` from `mcp.json.example` (Atlassian, GitHub, Slack).
4. Optional: copy extra tooling from a mature repo (e.g. `webconfig.mjs`, watchers) into `.cursor/tools/` following `proj-tools-layout.mdc`.

## Verify memory CLI

```bash
node .cursor/tools/cli/memory.mjs bootstrap
node .cursor/tools/cli/memory.mjs log --issue PROJ-1 --symptom "test" --decision "template ok" --confidence fact --source other --sources "readme"
```

## Relation to Incent

This template is **generic**. The Incent repo keeps its full `.cursor/` (FI-specific QA, VPN, TimeLU, day-watch). Use this package to bootstrap new projects; port only the tools you need from Incent over time.
