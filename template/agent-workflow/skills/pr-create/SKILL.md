---
name: pr-create
description: Open PR to default base branch with metadata
---

# PR create

1. Complete `pr-prepare` first
2. Open PR via your SCM (`gh pr create` or equivalent) — title = issue key + summary
3. `proj-pr-create-assignees.mdc` — assignee + reviewers from `project.config.json`
4. Wait for CI checks when available
5. Draft issue-tracker comment in chat; do not post without confirmation
