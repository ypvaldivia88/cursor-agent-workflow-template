---
name: issue-get-context
description: Load issue from tracker and stage attachments under .cursor/temp before implementation
---

# Issue get context

1. Load the issue using the path documented in `.cursor/context/PROJECT.md` (MCP, REST API, or `gh issue view`, etc.).
2. If there are attachments, save them under `.cursor/temp/<issue-key-lower>/` (add a download script under `.cursor/tools/` or fetch manually).
3. Restate acceptance in plain language before coding (`proj-no-invention.mdc`).
