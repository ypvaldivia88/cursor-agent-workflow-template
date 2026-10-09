#!/usr/bin/env node
/**
 * Delete .agent-workflow/temp/<issue-key>/ folders (ticket WIP — attachments, QA shots).
 *
 * This template does not call any issue-tracker API. You delete folders when work
 * is finished, or extend this script to query your issue tracker API when status is Done.
 *
 * Usage:
 *   node .agent-workflow/tools/cli/temp-cleanup.mjs              # list ticket dirs
 *   node .agent-workflow/tools/cli/temp-cleanup.mjs --dry-run    # same as default
 *   node .agent-workflow/tools/cli/temp-cleanup.mjs PROJ-123     # remove one folder
 *   node .agent-workflow/tools/cli/temp-cleanup.mjs PROJ-1 PROJ-2 --dry-run
 */
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "../lib/paths.mjs";
import { issueKeyExtractRegex } from "../lib/project-config.mjs";

const TEMP_DIR = join(REPO, ".agent-workflow", "temp");
const extractRe = issueKeyExtractRegex();

function listTempTicketDirs() {
  if (!existsSync(TEMP_DIR)) return [];
  const out = [];
  for (const name of readdirSync(TEMP_DIR)) {
    const match = name.match(extractRe);
    if (!match) continue;
    const full = join(TEMP_DIR, name);
    try {
      if (!statSync(full).isDirectory()) continue;
    } catch {
      continue;
    }
    out.push(match[0].toUpperCase());
  }
  return [...new Set(out)].sort();
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const keys = argv
    .filter((a) => !a.startsWith("--"))
    .map((k) => k.toUpperCase())
    .filter((k) => extractRe.test(k));
  return { dryRun, keys };
}

function removeKey(key, dryRun) {
  const lower = key.toLowerCase();
  const candidates = [
    join(TEMP_DIR, lower),
    join(TEMP_DIR, key),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    if (dryRun) {
      console.log(`would remove ${dir}`);
      return true;
    }
    rmSync(dir, { recursive: true, force: true });
    console.log(`removed ${dir}`);
    return true;
  }
  console.log(`skip ${key} (no temp folder)`);
  return false;
}

function main() {
  const { dryRun, keys } = parseArgs(process.argv.slice(2));
  const targets = keys.length > 0 ? keys : listTempTicketDirs();

  if (keys.length === 0) {
    console.log(
      keys.length === 0 && targets.length === 0
        ? "No ticket folders under .agent-workflow/temp"
        : `Ticket temp folders (${dryRun ? "dry-run" : "pass issue keys to delete"}):`
    );
    for (const k of targets) console.log(`  ${k}`);
    if (keys.length === 0 && targets.length > 0) {
      console.log("\nPass issue keys to delete, e.g. temp-cleanup.mjs PROJ-123");
    }
    return;
  }

  for (const key of targets) removeKey(key, dryRun);
}

main();
