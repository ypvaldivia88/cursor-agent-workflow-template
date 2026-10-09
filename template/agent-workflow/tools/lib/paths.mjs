/**
 * Canonical directories for `.agent-workflow/tools`.
 */
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** `.agent-workflow/tools` */
export const TOOLS_DIR = resolve(here, "..");

/** Repository root (parent of `.agent-workflow`) */
export const REPO = resolve(TOOLS_DIR, "..", "..");

/** Watcher JSON + logs (not source) */
export const STATE_DIR = join(TOOLS_DIR, "state");

/** `.agent-workflow` — local agent kit (gitignored in app repos) */
export const AGENT_WORKFLOW_DIR = join(REPO, ".agent-workflow");

export const TEMP_DIR = join(AGENT_WORKFLOW_DIR, "temp");
export const MEMORY_DIR = join(AGENT_WORKFLOW_DIR, "memory");
export const MEMORY_EPISODIC_LOG = join(MEMORY_DIR, "episodic", "events.jsonl");
export const MEMORY_PLAYBOOKS_DIR = join(MEMORY_DIR, "playbooks");
export const MEMORY_GRAPH_STORE = join(MEMORY_DIR, "graph", "store.json");
export const MEMORY_COMPACTION_STATE = join(STATE_DIR, "memory-compaction.json");

export function ensureMemoryDirs() {
  mkdirSync(join(MEMORY_DIR, "episodic"), { recursive: true });
  mkdirSync(join(MEMORY_DIR, "playbooks", "by-client"), { recursive: true });
  mkdirSync(join(MEMORY_DIR, "playbooks", "by-topic"), { recursive: true });
  mkdirSync(join(MEMORY_DIR, "graph"), { recursive: true });
  ensureStateDir();
  return MEMORY_DIR;
}

export function ensureStateDir() {
  mkdirSync(STATE_DIR, { recursive: true });
  return STATE_DIR;
}

export function ticketTempDir(issueKey) {
  return join(TEMP_DIR, String(issueKey).toLowerCase());
}

export function qaScreenshotsDir(issueKey) {
  const dir = join(ticketTempDir(issueKey), "qa-screenshots");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function qaScreenshotPath(issueKey, filename) {
  return join(qaScreenshotsDir(issueKey), filename);
}
