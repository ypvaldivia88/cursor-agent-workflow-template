#!/usr/bin/env node
/**
 * Memory bank CLI — episodic log, retrieval bundle, compaction.
 *
 * Usage:
 *   node .cursor/tools/cli/memory.mjs log --symptom "..." --decision "..." --source qa --sources "path"
 *   node .cursor/tools/cli/memory.mjs query --issue GRO-1234 --client kinecta --limit 10
 *   node .cursor/tools/cli/memory.mjs context --issue GRO-1234 --client kinecta
 *   node .cursor/tools/cli/memory.mjs stale
 *   node .cursor/tools/cli/memory.mjs compact [--dry-run] [--min-age-days 7]
 *   node .cursor/tools/cli/memory.mjs schema
 */
import { appendEvent, listStaleEvents, queryEvents } from "./episodic.mjs";
import { buildContextBundle } from "./context-bundle.mjs";
import { compactEpisodic } from "./compact.mjs";
import { ensureGraphStore } from "./graph.mjs";
import { detectActiveIssue } from "./detect-issue.mjs";
import { MEMORY_GRAPH_STORE, REPO } from "../lib/paths.mjs";
import { CONFIDENCE, SOURCES } from "./schema.mjs";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > -1) {
        args[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
          args[key] = next;
          i++;
        } else {
          args[key] = true;
        }
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function cmdLog(args) {
  const tags = args.tags ? String(args.tags).split(",").map((t) => t.trim()) : [];
  const related = args.entities
    ? String(args.entities).split(",").map((t) => t.trim())
    : [];

  const event = appendEvent({
    issueKey: args.issue || args.issueKey || null,
    client: args.client || null,
    symptom: args.symptom,
    evidence: args.evidence || null,
    decision: args.decision,
    confidence: args.confidence || "hypothesis",
    source: args.source || "other",
    sources: String(args.sources || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    tags,
    expiresAt: args.expires || args.expiresAt || null,
    relatedEntities: related,
  });

  console.log(JSON.stringify(event, null, 2));
}

function cmdQuery(args) {
  const events = queryEvents({
    issueKey: args.issue || args.issueKey,
    client: args.client,
    tag: args.tag,
    since: args.since,
    until: args.until,
    limit: args.limit ? Number(args.limit) : 50,
    includeExpired: Boolean(args.includeExpired),
    confidence: args.confidence,
  });
  console.log(JSON.stringify(events, null, 2));
}

function cmdContext(args) {
  const text = buildContextBundle({
    issueKey: args.issue || args.issueKey,
    client: args.client,
    tag: args.tag,
    days: args.days ? Number(args.days) : 14,
  });
  console.log(text);
}

function cmdBootstrap(args) {
  const detected = detectActiveIssue({
    explicitIssue: args.issue || args.issueKey,
    explicitClient: args.client,
  });

  if (args.json) {
    const bundle = detected.issueKey || detected.client
      ? buildContextBundle({
          issueKey: detected.issueKey,
          client: detected.client,
          days: args.days ? Number(args.days) : 14,
        })
      : "";
    console.log(
      JSON.stringify(
        {
          detected,
          hasEpisodicMatch: Boolean(detected.issueKey || detected.client),
          bundleChars: bundle.length,
        },
        null,
        2
      )
    );
    if (bundle) console.log("\n" + bundle);
    return;
  }

  console.log("# Memory bank bootstrap");
  console.log("");
  if (detected.issueKey) {
    console.log(
      `- **Issue:** ${detected.issueKey} (from ${detected.issueSource || "unknown"})`
    );
  } else {
    console.log("- **Issue:** not detected — use branch `GRO-XXXX`, temp folder, or `--issue`");
  }
  if (detected.client) {
    console.log(`- **Client:** ${detected.client} (from ${detected.clientSource || "unknown"})`);
  } else if (detected.issueKey) {
    console.log("- **Client:** unknown — pass `--client <id>` or log episodic events with client set");
  }
  console.log("");

  const text = buildContextBundle({
    issueKey: detected.issueKey,
    client: detected.client,
    days: args.days ? Number(args.days) : 14,
  });
  console.log(text);
}

function cmdStale() {
  const stale = listStaleEvents();
  console.log(JSON.stringify(stale, null, 2));
}

function cmdCompact(args) {
  const result = compactEpisodic({
    dryRun: Boolean(args["dry-run"] || args.dryRun),
    minAgeDays: args["min-age-days"] ? Number(args["min-age-days"]) : 7,
  });
  console.log(JSON.stringify(result, null, 2));
}

function cmdInit() {
  const graph = ensureGraphStore();
  console.log(
    JSON.stringify(
      {
        graph,
        mcpEnv: {
          MEMORY_FILE_PATH: MEMORY_GRAPH_STORE,
          note: "Set this in .cursor/mcp.json for server-memory if relative path fails. Restart Cursor after editing mcp.json.",
        },
        repo: REPO,
      },
      null,
      2
    )
  );
}

function cmdSchema() {
  console.log(
    JSON.stringify(
      {
        confidence: CONFIDENCE,
        source: SOURCES,
        required: ["symptom", "decision", "sources"],
        optional: [
          "issueKey",
          "client",
          "evidence",
          "tags",
          "expiresAt",
          "relatedEntities",
        ],
        example: {
          issueKey: "GRO-1234",
          client: "kinecta",
          symptom: "Leaderboard empty for shared child",
          evidence: "SQL: ChildParentRelationships has row",
          decision: "Filter via ChildParentRelationships not Children.AccountID",
          confidence: "verified",
          source: "sql",
          sources: [".cursor/temp/gro-1234/qa-screenshots/after.png"],
          tags: ["leaderboard", "alkami"],
          expiresAt: null,
        },
      },
      null,
      2
    )
  );
}

function usage() {
  console.log(`Memory bank CLI

Commands:
  log       Append episodic event (--symptom, --decision, --sources required)
  query     Search events
  context   Print retrieval bundle for agent
  bootstrap Auto-detect issue (git branch, temp/) + print bundle — run every conversation
  stale     List expired events
  compact   Summarize old events into playbooks
  init      Create graph store.json + print MCP MEMORY_FILE_PATH
  schema    Show event schema

Examples:
  node .cursor/tools/cli/memory.mjs log --issue GRO-1234 --client kinecta \\
    --symptom "SSO lands on error" --decision "Parent email in NameRelationshipsQ2" \\
    --confidence verified --source sql --sources "Accounts|NameRelationshipsQ2"

  node .cursor/tools/cli/memory.mjs context --issue GRO-1234 --client kinecta
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case "log":
      cmdLog(args);
      break;
    case "query":
      cmdQuery(args);
      break;
    case "context":
      cmdContext(args);
      break;
    case "bootstrap":
      cmdBootstrap(args);
      break;
    case "stale":
      cmdStale();
      break;
    case "compact":
      cmdCompact(args);
      break;
    case "init":
      cmdInit();
      break;
    case "schema":
      cmdSchema();
      break;
    default:
      usage();
      process.exit(cmd ? 1 : 0);
  }
}

main();
