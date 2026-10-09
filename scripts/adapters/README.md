# Adapters (optional)

The **canonical** install path is `.agent-workflow/` in each app repo.

Some products only auto-load certain folders:

| Adapter | Script | Purpose |
|---------|--------|---------|
| Cursor | `Sync-CursorRules.ps1` | Copy `rules/` and `skills/` into `.cursor/` |

Add new adapters here (e.g. symlink `CLAUDE.md` → `AGENTS.md`) without renaming the core kit.
