# agent-workflow-template

Plantilla reutilizable de **`.agent-workflow/`** para trabajar con **cualquier asistente de IA** en tus repos: reglas, skills, memoria episódica, evidencia temporal y reportes diarios.

Reusable **`.agent-workflow/`** template for **any AI coding assistant**: rules, skills, episodic memory, temp evidence, and daily reports.

**Vendor-neutral** — no asume un issue tracker, SCM ni IDE concretos.  
**Vendor-neutral** — does not assume any specific issue tracker, SCM, or IDE.

---

## Español

### ¿Qué es esto?

Un paquete que copias a cualquier repositorio para que **tu agente de IA** (Claude Code, Codex, Gemini CLI, Cursor, Copilot, Windsurf, etc.):

- Siga **reglas** consistentes (git, cambios mínimos, verificación antes del PR, comentarios en el tracker).
- Use **skills** (inicio de día, pickup de tickets, preparar PR).
- Guarde **memoria episódica** entre sesiones (`memory.mjs`).
- Separe **evidencia WIP** en `.agent-workflow/temp/` (capturas, adjuntos) sin ensuciar git.

La carpeta `.agent-workflow/` va en **`.gitignore`** del proyecto destino. El repo también recibe **`AGENTS.md`** en la raíz para herramientas que leen ese archivo.

### Compatibilidad con tu herramienta

| Herramienta | Cómo usar el kit |
|-------------|------------------|
| **Claude Code**, **Codex**, **Aider**, **Gemini CLI**, etc. | `AGENTS.md` + rutas bajo `.agent-workflow/` |
| **Cursor** | Tras instalar, ejecuta `Apply-AgentWorkflow.ps1 -SyncCursor` o `scripts/adapters/Sync-CursorRules.ps1` (copia reglas/skills a `.cursor/`) |
| **GitHub Copilot** | Apunta las instrucciones del workspace a `.agent-workflow/context/PROJECT.md` y las reglas que necesites |
| **Windsurf / Cline / Continue** | Igual que Cursor si el producto lee `.cursor/rules`; si no, usa `AGENTS.md` |

### Requisitos

| Herramienta | Para qué |
|-------------|----------|
| Cualquier IDE/agente con acceso al repo | Leer reglas, skills y `AGENTS.md` |
| [Node.js](https://nodejs.org) 18+ | CLI `memory.mjs`, `temp-cleanup.mjs` |
| Git | Ramas por ticket, PR |
| CLI de tu SCM (opcional) | p. ej. `gh` si usas GitHub |

### Instalación en un proyecto

1. Clona este repositorio (solo necesitas la carpeta una vez).

2. Ejecuta el script (PowerShell):

```powershell
cd ruta\a\agent-workflow-template
.\scripts\Apply-AgentWorkflow.ps1 -TargetRepo "D:\ruta\a\TuProyecto"
```

- Crea `TuProyecto\.agent-workflow\` con el contenido de `template/agent-workflow/`.
- Crea `TuProyecto\AGENTS.md` si no existe.
- Añade `.agent-workflow/` al `.gitignore` si falta.

3. **Si usas Cursor**, añade la sincronización a `.cursor/`:

```powershell
.\scripts\Apply-AgentWorkflow.ps1 -TargetRepo "D:\ruta\a\TuProyecto" -Force -SyncCursor
```

4. Edita la configuración:

| Archivo | Qué poner |
|---------|-----------|
| `.agent-workflow/project.config.json` | Prefijos de issue (`PROJ`, `BUG`, …), rama base, SCM, revisores de PR, reporte diario |
| `.agent-workflow/context/PROJECT.md` | Stack, build/run, CI, **cómo el agente lee/escribe issues** |

5. (Opcional) MCP: copia `mcp.json.example` → `.agent-workflow/mcp.json` y configúralo en tu IDE.

### Verificar

Desde la raíz del **proyecto destino**:

```bash
node .agent-workflow/tools/cli/memory.mjs bootstrap
node .agent-workflow/tools/cli/memory.mjs log --issue PROJ-1 --symptom "prueba" --decision "template OK" --confidence fact --source other --sources "readme"
```

### Estructura instalada

```
TuProyecto/
├── AGENTS.md                 # Punto de entrada para asistentes
└── .agent-workflow/
    ├── project.config.json
    ├── rules/                # Reglas (*.mdc)
    ├── skills/
    ├── context/
    ├── tools/cli/
    ├── memory/episodic/
    ├── temp/
    ├── reports/
    └── secrets/
```

### Flujo recomendado

1. **Cada conversación nueva:** `memory.mjs bootstrap` (`proj-memory-bank.mdc`).
2. **Inicio de jornada:** skill `session-start`.
3. **Nuevo ticket:** rama = clave del issue; adjuntos en `.agent-workflow/temp/<key>/`.
4. **Antes del PR:** evidencia en `qa-screenshots/`, `proj-no-pr-without-verification.mdc`.
5. **Ticket cerrado:** `node .agent-workflow/tools/cli/temp-cleanup.mjs PROJ-123`.

### FAQ

**¿Subo `.agent-workflow/` a git?** No — gitignórelo. Este repo de distribución versiona `template/agent-workflow/`.

**¿Actualizar un proyecto ya instalado?** `Apply-AgentWorkflow.ps1 -Force` y, si usas Cursor, `-SyncCursor`.

---

## English

### What is this?

A package you apply to any repository so **your AI assistant** can use shared rules, skills, memory, and temp evidence — regardless of vendor.

### Tool compatibility

| Tool | How to use the kit |
|------|---------------------|
| **Claude Code**, **Codex**, **Aider**, **Gemini CLI**, etc. | Root `AGENTS.md` + `.agent-workflow/` paths |
| **Cursor** | `Apply-AgentWorkflow.ps1 -SyncCursor` or `scripts/adapters/Sync-CursorRules.ps1` |
| **GitHub Copilot** | Workspace instructions → `PROJECT.md` + selected rules |
| **Windsurf / Cline / Continue** | `.cursor/rules` when supported; otherwise `AGENTS.md` |

### Requirements

| Tool | Purpose |
|------|---------|
| Any agent with repo access | Rules, skills, `AGENTS.md` |
| Node.js 18+ | Memory and temp CLIs |
| Git | Branches and PRs |

### Install

```powershell
.\scripts\Apply-AgentWorkflow.ps1 -TargetRepo "D:\path\to\YourProject"
.\scripts\Apply-AgentWorkflow.ps1 -TargetRepo "D:\path\to\YourProject" -SyncCursor   # Cursor only
```

Configure `.agent-workflow/project.config.json` and `.agent-workflow/context/PROJECT.md`.

### Verify

```bash
node .agent-workflow/tools/cli/memory.mjs bootstrap
```

### FAQ

**Commit `.agent-workflow/`?** No — gitignore in app repos. **Update?** Re-run apply with `-Force` (and `-SyncCursor` for Cursor).

---

## License

MIT — see [LICENSE](LICENSE).
