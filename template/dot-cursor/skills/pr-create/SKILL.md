---
name: pr-create
description: Open PR to default base branch with metadata
---

# PR create

1. Complete `pr-prepare` first
2. `gh pr create` — title = issue key + summary
3. `proj-pr-create-assignees.mdc` — assignee + reviewers from `project.config.json`
4. `gh pr checks <n>` when CI exists
5. Draft Jira comment in chat; do not post without confirmation
