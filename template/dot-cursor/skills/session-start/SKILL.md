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

- Jira: assignee = current user, open statuses
- `gh pr list --author <developerGitHub>`
- Note blockers waiting on external feedback only (no planned hours)

## 4. Day plan

Follow `proj-daily-day-plan.mdc` — present plan; wait for user approval before ticket work.

Optional integrations (enable in `project.config.json` → `sessionStart`): mail, Slack, calendar, day-watch — add tools from a mature `.cursor` when needed.
