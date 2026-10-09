# secrets/ (gitignored via repo .gitignore)

Store **local-only** credentials for CLIs and MCP helpers. Never commit this folder.

| Pattern | Use |
|---------|-----|
| `integrations/*.env` | API tokens for optional tools you add (issue tracker, SCM, chat) |
| `local/` | Environment-specific overrides (e.g. `.current-profile` for active deployment target) |

The base template ships **no** required secret files — only add what your extended tooling needs.
