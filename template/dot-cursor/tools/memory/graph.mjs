/**
 * MCP @modelcontextprotocol/server-memory file store bootstrap.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { MEMORY_GRAPH_STORE, ensureMemoryDirs } from "../lib/paths.mjs";

const EMPTY_STORE = { entities: [], relations: [] };

export function ensureGraphStore() {
  ensureMemoryDirs();
  if (!existsSync(MEMORY_GRAPH_STORE)) {
    writeFileSync(MEMORY_GRAPH_STORE, `${JSON.stringify(EMPTY_STORE, null, 2)}\n`, "utf8");
    return { created: true, path: MEMORY_GRAPH_STORE, entityCount: 0 };
  }

  try {
    const raw = readFileSync(MEMORY_GRAPH_STORE, "utf8");
    const data = JSON.parse(raw);
    const entities = Array.isArray(data.entities) ? data.entities.length : 0;
    return { created: false, path: MEMORY_GRAPH_STORE, entityCount: entities };
  } catch {
    writeFileSync(MEMORY_GRAPH_STORE, `${JSON.stringify(EMPTY_STORE, null, 2)}\n`, "utf8");
    return { created: true, path: MEMORY_GRAPH_STORE, entityCount: 0, repaired: true };
  }
}
