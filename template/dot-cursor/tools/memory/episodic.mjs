/**
 * Append and query episodic memory (JSONL).
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { ensureMemoryDirs, MEMORY_EPISODIC_LOG } from "../lib/paths.mjs";
import { isExpired, normalizeEvent } from "./schema.mjs";

function ensureLog() {
  ensureMemoryDirs();
  if (!existsSync(MEMORY_EPISODIC_LOG)) {
    writeFileSync(MEMORY_EPISODIC_LOG, "", "utf8");
  }
}

/**
 * @returns {import('./schema.mjs').MemoryEvent[]}
 */
export function readAllEvents() {
  ensureLog();
  const raw = readFileSync(MEMORY_EPISODIC_LOG, "utf8");
  if (!raw.trim()) return [];
  const events = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // skip corrupt lines
    }
  }
  return events;
}

/**
 * @param {Partial<import('./schema.mjs').MemoryEvent>} input
 * @returns {import('./schema.mjs').MemoryEvent}
 */
export function appendEvent(input) {
  const event = normalizeEvent(input);
  ensureLog();
  appendFileSync(MEMORY_EPISODIC_LOG, `${JSON.stringify(event)}\n`, "utf8");
  return event;
}

/**
 * @param {{
 *   issueKey?: string,
 *   client?: string,
 *   tag?: string,
 *   since?: string,
 *   until?: string,
 *   limit?: number,
 *   includeExpired?: boolean,
 *   confidence?: string,
 * }} opts
 */
export function queryEvents(opts = {}) {
  let events = readAllEvents();

  if (!opts.includeExpired) {
    events = events.filter((e) => !isExpired(e));
  }

  if (opts.issueKey) {
    const key = String(opts.issueKey).toUpperCase();
    events = events.filter((e) => e.issueKey === key);
  }

  if (opts.client) {
    const client = String(opts.client).toLowerCase();
    events = events.filter((e) => e.client === client);
  }

  if (opts.tag) {
    const tag = String(opts.tag).toLowerCase();
    events = events.filter((e) => Array.isArray(e.tags) && e.tags.includes(tag));
  }

  if (opts.confidence) {
    const c = String(opts.confidence).toLowerCase();
    events = events.filter((e) => e.confidence === c);
  }

  if (opts.since) {
    const since = Date.parse(opts.since);
    if (!Number.isNaN(since)) {
      events = events.filter((e) => Date.parse(e.timestamp) >= since);
    }
  }

  if (opts.until) {
    const until = Date.parse(opts.until);
    if (!Number.isNaN(until)) {
      events = events.filter((e) => Date.parse(e.timestamp) <= until);
    }
  }

  events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const limit = opts.limit ?? 50;
  return events.slice(0, limit);
}

/**
 * @returns {import('./schema.mjs').MemoryEvent[]}
 */
export function listStaleEvents() {
  return readAllEvents().filter((e) => isExpired(e));
}
