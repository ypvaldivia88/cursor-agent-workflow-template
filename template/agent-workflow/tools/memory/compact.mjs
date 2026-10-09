/**
 * Weekly compaction — summarize episodic events into playbooks.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ensureMemoryDirs,
  MEMORY_COMPACTION_STATE,
  MEMORY_PLAYBOOKS_DIR,
} from "../lib/paths.mjs";
import { readAllEvents } from "./episodic.mjs";
import { isExpired } from "./schema.mjs";

function loadState() {
  if (!existsSync(MEMORY_COMPACTION_STATE)) {
    return { compactedIds: [], lastRun: null };
  }
  try {
    return JSON.parse(readFileSync(MEMORY_COMPACTION_STATE, "utf8"));
  } catch {
    return { compactedIds: [], lastRun: null };
  }
}

function saveState(state) {
  writeFileSync(MEMORY_COMPACTION_STATE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function groupKey(event) {
  const client = event.client || "general";
  const topic = (event.tags && event.tags[0]) || "misc";
  return `${client}::${topic}`;
}

/**
 * @param {{ dryRun?: boolean, minAgeDays?: number }} opts
 */
export function compactEpisodic(opts = {}) {
  const dryRun = Boolean(opts.dryRun);
  const minAgeDays = opts.minAgeDays ?? 7;
  const cutoff = Date.now() - minAgeDays * 24 * 60 * 60 * 1000;

  ensureMemoryDirs();
  const state = loadState();
  const compactedSet = new Set(state.compactedIds || []);

  const candidates = readAllEvents().filter((e) => {
    if (compactedSet.has(e.id)) return false;
    if (isExpired(e)) return false;
    if (e.confidence === "hypothesis") return false;
    return Date.parse(e.timestamp) <= cutoff;
  });

  const groups = new Map();
  for (const e of candidates) {
    const key = groupKey(e);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  const written = [];

  for (const [key, events] of groups) {
    if (events.length < 2) continue;

    const [client, topic] = key.split("::");
    const dir =
      client === "general"
        ? join(MEMORY_PLAYBOOKS_DIR, "by-topic")
        : join(MEMORY_PLAYBOOKS_DIR, "by-client");
    const fileName = client === "general" ? `${topic}.md` : `${client}.md`;
    const filePath = join(dir, fileName);

    const header = `# Playbook — ${client} / ${topic}\n\n_Auto-compacted ${new Date().toISOString().slice(0, 10)}. Prefer episodic log for provenance._\n\n`;
    const bullets = events
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .map((e) => {
        const ref = e.issueKey ? `${e.issueKey}: ` : "";
        return `- ${ref}**${e.symptom}** → ${e.decision} _(source: ${e.source}, ${e.confidence})_`;
      })
      .join("\n");

    const body = `${header}${bullets}\n`;

    if (!dryRun) {
      let existing = "";
      if (existsSync(filePath)) {
        existing = readFileSync(filePath, "utf8");
      }
      if (!existing.includes(bullets.slice(0, 80))) {
        writeFileSync(filePath, existing ? `${existing.trim()}\n\n${bullets}\n` : body, "utf8");
      }
      for (const e of events) {
        compactedSet.add(e.id);
      }
    }

    written.push({ filePath, count: events.length });
  }

  if (!dryRun) {
    saveState({
      compactedIds: [...compactedSet],
      lastRun: new Date().toISOString(),
    });
  }

  return { groups: written.length, files: written, dryRun };
}
