---
name: pr-prepare
description: Pre-push self-review and verification gate
---

# PR prepare

1. `proj-no-pr-without-verification.mdc` — evidence in `.agent-workflow/temp/`
2. `git merge origin/<defaultBaseBranch>`
3. Review diff for scope creep (`proj-minimal-changes.mdc`)
4. Commit only when user asked; push only when user asked
5. `memory.mjs log` if milestone verified and not duplicate
