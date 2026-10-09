/**
 * Build retrieval bundle for agents — fixed order per memory-bank architecture.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CURSOR_DIR,
  MEMORY_PLAYBOOKS_DIR,
} from "../lib/paths.mjs";
import { ensureGraphStore } from "./graph.mjs";
import { listStaleEvents, queryEvents } from "./episodic.mjs";

function playbookMatches(name, client, tags) {
  const base = name.replace(/\.md$/, "").toLowerCase();
  if (base === "readme") return false;
  const matchClient =
    client &&
    (base === String(client).toLowerCase() || base.includes(String(client).toLowerCase()));
  const matchTag = tags.some((t) => base.includes(String(t).toLowerCase()));
  return matchClient || matchTag;
}

function readPlaybookSnippets(client, tags = []) {
  const snippets = [];
  const dirs = [
    MEMORY_PLAYBOOKS_DIR,
    join(MEMORY_PLAYBOOKS_DIR, "by-client"),
    join(MEMORY_PLAYBOOKS_DIR, "by-topic"),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      if (!playbookMatches(name, client, tags)) continue;
      const full = join(dir, name);
      const body = readFileSync(full, "utf8").trim();
      if (body) snippets.push({ file: full, body });
    }
  }

  const seen = new Set();
  return snippets
    .filter((s) => {
      if (seen.has(s.file)) return false;
      seen.add(s.file);
      return true;
    })
    .slice(0, 8);
}

/**
 * @param {{ issueKey?: string, client?: string, tag?: string, days?: number }} opts
 */
export function buildContextBundle(opts = {}) {
  const days = opts.days ?? 14;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const lines = [];
  lines.push("# Memory bank retrieval bundle");
  lines.push("");
  lines.push("## Retrieval order (mandatory)");
  lines.push("1. `.cursor/rules/` — behavior gates");
  lines.push("2. Ticket context — issue tracker (MCP/API per PROJECT.md) + `.cursor/temp/<key>/`");
  lines.push("3. Episodic memory — recent decisions below");
  lines.push("4. Playbooks — compacted patterns below");
  lines.push("5. `.cursor/context/` — stable reference docs");
  lines.push("6. MCP `memory` server (optional) — cross-ticket graph when enabled in Cursor");
  lines.push("");

  const issueEvents = opts.issueKey
    ? queryEvents({ issueKey: opts.issueKey, since, limit: 20 })
    : [];

  const clientEvents = opts.client
    ? queryEvents({ client: opts.client, since, limit: 15 })
    : [];

  const tagEvents = opts.tag
    ? queryEvents({ tag: opts.tag, since, limit: 10 })
    : [];

  const seen = new Set();
  const merged = [];
  for (const list of [issueEvents, clientEvents, tagEvents]) {
    for (const e of list) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        merged.push(e);
      }
    }
  }
  merged.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  if (merged.length > 0) {
    lines.push("## Episodic memory (recent)");
    for (const e of merged.slice(0, 25)) {
      lines.push(`### ${e.timestamp} — ${e.issueKey || "no-ticket"} (${e.confidence})`);
      lines.push(`- **Client:** ${e.client || "n/a"}`);
      lines.push(`- **Symptom:** ${e.symptom}`);
      if (e.evidence) lines.push(`- **Evidence:** ${e.evidence}`);
      lines.push(`- **Decision:** ${e.decision}`);
      lines.push(`- **Source:** ${e.source} — ${e.sources.join("; ")}`);
      if (e.expiresAt) lines.push(`- **Expires:** ${e.expiresAt}`);
      if (e.tags?.length) lines.push(`- **Tags:** ${e.tags.join(", ")}`);
      lines.push("");
    }
  } else {
    lines.push("## Episodic memory");
    lines.push("_No matching events in the lookback window._");
    lines.push("");
  }

  const tags = merged.flatMap((e) => e.tags || []);
  const playbooks = readPlaybookSnippets(opts.client, tags);
  if (playbooks.length > 0) {
    lines.push("## Playbooks");
    for (const p of playbooks) {
      lines.push(`### ${p.file.replace(CURSOR_DIR, ".cursor")}`);
      lines.push(p.body);
      lines.push("");
    }
  }

  const stale = listStaleEvents();
  if (stale.length > 0) {
    lines.push("## Stale entries (past expiresAt — do not treat as facts)");
    for (const e of stale.slice(0, 10)) {
      lines.push(`- ${e.id} ${e.issueKey || ""} expired ${e.expiresAt}: ${e.decision}`);
    }
    lines.push("");
  }

  const graph = ensureGraphStore();
  lines.push("## MCP memory graph (optional)");
  if (graph.entityCount > 0) {
    lines.push(
      `Graph store: \`${graph.path.replace(CURSOR_DIR, ".cursor")}\` (${graph.entityCount} entities). Use MCP \`memory\` → \`search_nodes\` for cross-ticket links.`
    );
  } else {
    lines.push(
      `Graph store: \`${graph.path.replace(CURSOR_DIR, ".cursor")}\` (empty). Episodic log above is the source of truth until you enable MCP \`memory\` in Cursor and upsert verified patterns (\`memory-bank\` skill).`
    );
  }
  lines.push("");

  return lines.join("\n");
}
