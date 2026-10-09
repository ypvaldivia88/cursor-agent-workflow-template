/**
 * Canonical directories for .cursor/tools.
 * Always resolve from this file so CLIs work in any nested folder.
 */
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** `.cursor/tools` */
export const TOOLS_DIR = resolve(here, "..");

/** Repo root (Incent) */
export const REPO = resolve(TOOLS_DIR, "..", "..");

/** Watcher JSON + logs (not source) */
export const STATE_DIR = join(TOOLS_DIR, "state");

/** `.cursor` — local agent context (gitignored) */
export const CURSOR_DIR = join(REPO, ".cursor");

/** `.cursor/temp` — gitignored ticket WIP (attachments, QA screenshots) */
export const TEMP_DIR = join(CURSOR_DIR, "temp");

/** `.cursor/memory` — episodic log, playbooks, MCP graph store */
export const MEMORY_DIR = join(CURSOR_DIR, "memory");
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

/** `.cursor/temp/<issue-key-lower>/` */
export function ticketTempDir(issueKey) {
  return join(TEMP_DIR, String(issueKey).toLowerCase());
}

/** `.cursor/temp/<issue-key-lower>/qa-screenshots/` (created if missing) */
export function qaScreenshotsDir(issueKey) {
  const dir = join(ticketTempDir(issueKey), "qa-screenshots");
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Full path for one QA PNG under the ticket temp folder */
export function qaScreenshotPath(issueKey, filename) {
  return join(qaScreenshotsDir(issueKey), filename);
}
