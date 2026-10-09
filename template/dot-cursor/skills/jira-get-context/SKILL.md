---
name: jira-get-context
description: Load Jira issue and download attachments to temp before implementation
---

# Jira get context

1. Atlassian MCP `getJiraIssue` with fields needed for implementation
2. If attachments exist, download to `.cursor/temp/<issue-key-lower>/` (add `jira-attachments.mjs` from a full workflow repo, or download manually once)
3. Restate acceptance in plain language before coding (`proj-no-invention.mdc`)
