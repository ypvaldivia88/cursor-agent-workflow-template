---
name: session-start
description: Start-of-day — memory bootstrap, priorities, open PRs, daily report draft, day plan
---

# Session start

## 1. Memory bootstrap (mandatory)

```bash
node .cursor/tools/cli/memory.mjs bootstrap
```

## 2. Daily report

Create or update today's file under `.cursor/reports/` per `project.config.json` → `dailyReport.filePattern`.

## 3. Work queue

- Open issues assigned to you (per `PROJECT.md`)
- Open PRs for your SCM (`gh pr list` or equivalent)
- Note blockers waiting on external feedback only (no planned hours)

## 4. Day plan

Follow `proj-daily-day-plan.mdc` — present plan; wait for user approval before ticket work.

Optional digests: configure `sessionStart.optionalDigests` in `project.config.json` and add matching tools under `.cursor/tools/`.
