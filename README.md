# cursor-agent-workflow-template

Plantilla reutilizable de **`.cursor/`** para trabajar con agentes de IA en Cursor: reglas, skills, memoria episódica, evidencia temporal y reportes diarios.

Reusable **`.cursor/`** template for AI-assisted development in Cursor: rules, skills, episodic memory, temp evidence, and daily reports.

**Vendor-neutral** — no asume un issue tracker, SCM ni chat concretos.  
**Vendor-neutral** — does not assume any specific issue tracker, SCM, or chat tool.

---

## Español

### ¿Qué es esto?

Un paquete que copias a cualquier repositorio para que el agente de Cursor:

- Siga **reglas** consistentes (git, cambios mínimos, verificación antes del PR, comentarios en el tracker).
- Use **skills** (inicio de día, pickup de tickets, preparar PR).
- Guarde **memoria episódica** entre sesiones (`memory.mjs`).
- Separe **evidencia WIP** en `.cursor/temp/` (capturas, adjuntos) sin ensuciar git.

La carpeta `.cursor/` va en **`.gitignore`** del proyecto destino: reglas y skills sí se copian; secretos, reportes y temp quedan solo en tu máquina.

### Requisitos

| Herramienta | Para qué |
|-------------|----------|
| [Cursor](https://cursor.com) | Reglas, skills, agente |
| [Node.js](https://nodejs.org) 18+ | CLI `memory.mjs`, `temp-cleanup.mjs` |
| Git | Ramas por ticket, PR |
| CLI de tu SCM (opcional) | p. ej. `gh` si usas GitHub |

### Instalación en un proyecto

1. Clona o descarga este repositorio (solo necesitas la carpeta una vez).

2. Ejecuta el script de aplicación (PowerShell):

```powershell
cd ruta\a\cursor-agent-workflow-template
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\ruta\a\TuProyecto"
```

- Crea `TuProyecto\.cursor\` con todo el contenido de `template/dot-cursor/`.
- Si no existe, copia `project.config.json` desde el ejemplo.
- Añade `.cursor/` al `.gitignore` del proyecto si falta.

3. Si ya tenías `.cursor/`, usa `-Force` para fusionar archivos del template:

```powershell
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\ruta\a\TuProyecto" -Force
```

4. Edita la configuración del proyecto:

| Archivo | Qué poner |
|---------|-----------|
| `.cursor/project.config.json` | Prefijos de issue (`PROJ`, `BUG`, …), rama base, tu usuario de SCM, revisores de PR, nombre del reporte diario |
| `.cursor/context/PROJECT.md` | Stack, cómo compilar/ejecutar, CI, **cómo el agente lee/escribe issues** (MCP, API, manual) |

5. (Opcional) MCP en Cursor: copia `mcp.json.example` → `.cursor/mcp.json` y añade los servidores que uses.

### Verificar que funciona

Desde la raíz del **proyecto destino** (no desde este repo template):

```bash
node .cursor/tools/cli/memory.mjs bootstrap
node .cursor/tools/cli/memory.mjs log --issue PROJ-1 --symptom "prueba" --decision "template OK" --confidence fact --source other --sources "readme"
```

`bootstrap` debe imprimir un bundle (aunque esté vacío al inicio). Eso confirma rutas y `project.config.json`.

### Estructura que se instala

```
TuProyecto/.cursor/
├── project.config.json    # Config del equipo/proyecto
├── rules/                 # Reglas Cursor (*.mdc)
├── skills/                # Flujos (session-start, pr-create, …)
├── context/               # ROUTING.md, PROJECT.md, guías
├── tools/cli/             # memory.mjs, temp-cleanup.mjs
├── memory/episodic/       # events.jsonl (decisiones verificadas)
├── temp/                  # WIP por ticket (gitignored vía .cursor/)
├── reports/               # Reportes diarios markdown
└── secrets/               # Credenciales locales (nunca en git)
```

### Flujo de trabajo recomendado

1. **Cada conversación nueva en Cursor:** el agente ejecuta `memory.mjs bootstrap` (regla `proj-memory-bank.mdc`).
2. **Inicio de jornada:** skill `session-start` — reporte del día, cola de issues/PRs, plan (tú apruebas antes de codear).
3. **Nuevo ticket:** rama = clave del issue (`PROJ-123`), skill `issue-get-context`, adjuntos en `.cursor/temp/proj-123/`.
4. **Antes del push/PR:** evidencia en `temp/.../qa-screenshots/`, regla `proj-no-pr-without-verification.mdc`, skill `pr-prepare`.
5. **PR abierto:** skill `pr-create` + revisores en `project.config.json`.
6. **Comentario en el tracker:** borrador en chat; publicar solo si tú confirmas (`proj-issue-reports.mdc`).
7. **Ticket cerrado:** `node .cursor/tools/cli/temp-cleanup.mjs PROJ-123` borra la carpeta temp.

### Campos útiles de `project.config.json`

```json
{
  "issueKeyPrefixes": ["PROJ"],
  "defaultBaseBranch": "main",
  "developerGitHub": "tu-usuario",
  "dailyReport": {
    "filePattern": "Developer_Report_YYYY-MM-DD.md",
    "targetHoursPerDay": 6
  },
  "pr": { "defaultReviewers": ["colega-a"] },
  "issueTracker": { "product": "generic", "notes": "Ver PROJECT.md" },
  "integrations": { "scm": "github", "issueTrackerMcp": null }
}
```

Ajusta prefijos y nombres de reporte a tu equipo.

### Actualizar un proyecto que ya usa el template

Vuelve a clonar este repo, ejecuta `Apply-CursorWorkflow.ps1 -Force` y revisa el diff en `.cursor/`. Mezcla manualmente si personalizaste reglas.

### Preguntas frecuentes

**¿Subo `.cursor/` a git?** No. Mantén `.cursor/` en `.gitignore`. Este repositorio template sí versiona `template/dot-cursor/` para distribuir la plantilla.

**¿Funciona sin issue tracker?** Sí. Documenta en `PROJECT.md` cómo trabajas; las reglas hablan de “issue tracker” de forma genérica.

**¿Puedo añadir mis propios scripts?** Sí, en `.cursor/tools/` siguiendo `proj-tools-layout.mdc`.

---

## English

### What is this?

A package you apply to any repository so the Cursor agent can:

- Follow consistent **rules** (git, minimal diffs, verify before PR, tracker comments).
- Use **skills** (session start, sprint pickup, PR prepare/create).
- Persist **episodic memory** across sessions (`memory.mjs`).
- Keep **WIP evidence** under `.cursor/temp/` (screenshots, attachments) out of git.

The target project **gitignores** `.cursor/`; rules and skills are copied in, while secrets, reports, and temp stay local.

### Requirements

| Tool | Purpose |
|------|---------|
| [Cursor](https://cursor.com) | Rules, skills, agent |
| [Node.js](https://nodejs.org) 18+ | `memory.mjs`, `temp-cleanup.mjs` CLIs |
| Git | Ticket branches, PRs |
| Your SCM CLI (optional) | e.g. `gh` on GitHub |

### Install into a project

1. Clone this repository once on your machine.

2. Run the apply script (PowerShell):

```powershell
cd path\to\cursor-agent-workflow-template
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\path\to\YourProject"
```

- Creates `YourProject\.cursor\` from `template/dot-cursor/`.
- Seeds `project.config.json` on first install.
- Appends `.cursor/` to `.gitignore` when missing.

3. To merge into an existing `.cursor/` folder:

```powershell
.\scripts\Apply-CursorWorkflow.ps1 -TargetRepo "D:\path\to\YourProject" -Force
```

4. Configure the target project:

| File | Content |
|------|---------|
| `.cursor/project.config.json` | Issue key prefixes, default branch, SCM username, PR reviewers, daily report filename |
| `.cursor/context/PROJECT.md` | Stack, build/run, CI, **how agents load/post issues** |

5. (Optional) Copy `mcp.json.example` to `.cursor/mcp.json` and add your MCP servers in Cursor settings.

### Verify installation

From the **target project root**:

```bash
node .cursor/tools/cli/memory.mjs bootstrap
node .cursor/tools/cli/memory.mjs log --issue PROJ-1 --symptom "smoke test" --decision "template OK" --confidence fact --source other --sources "readme"
```

### Installed layout

```
YourProject/.cursor/
├── project.config.json
├── rules/              # Cursor rules (*.mdc)
├── skills/             # Workflows
├── context/            # ROUTING.md, PROJECT.md
├── tools/cli/          # memory, temp-cleanup
├── memory/episodic/    # JSONL log
├── temp/               # Per-issue WIP
├── reports/            # Daily markdown logs
└── secrets/            # Local credentials
```

### Recommended workflow

1. **New agent chat:** `memory.mjs bootstrap` every time (`proj-memory-bank.mdc`).
2. **Start of day:** `session-start` skill — daily report draft, queue, plan (you approve before coding).
3. **New ticket:** branch = issue key, `issue-get-context`, attachments under `.cursor/temp/<key>/`.
4. **Before push/PR:** QA evidence in temp, `proj-no-pr-without-verification.mdc`, `pr-prepare` skill.
5. **Open PR:** `pr-create` + reviewers from config.
6. **Tracker comment:** draft in chat; post only after you confirm.
7. **Done:** `temp-cleanup.mjs PROJ-123` removes temp folder.

### Updating projects already on the template

Re-run `Apply-CursorWorkflow.ps1 -Force` from a fresh clone of this repo and review `.cursor/` diffs.

### FAQ

**Should I commit `.cursor/`?** No — gitignore it in app repos. This distribution repo tracks `template/dot-cursor/` only.

**No issue tracker?** Still works; document your process in `PROJECT.md`.

**Custom tools?** Add under `.cursor/tools/` per `proj-tools-layout.mdc`.

---

## License

MIT — see [LICENSE](LICENSE).
