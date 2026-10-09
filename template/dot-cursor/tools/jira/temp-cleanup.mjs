#!/usr/bin/env node
/**
 * Delete .cursor/temp/<issue-key>/ folders for tickets in Jira Done category
 * (statusCategory.key === "done": Done, QA - Ready, Closed, etc.).
 *
 * Usage:
 *   node .cursor/tools/cli/temp-cleanup.mjs              # scan temp, remove Done
 *   node .cursor/tools/cli/temp-cleanup.mjs --dry-run    # list only
 *   node .cursor/tools/cli/temp-cleanup.mjs GRO-2304     # remove if that key is Done
 *
 * Credentials: .cursor/secrets/integrations/jira.env
 */
import { readdirSync, rmSync, existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "../lib/paths.mjs";
const TEMP_DIR = join(REPO, ".cursor", "temp");
const ENV_PATH = join(REPO, ".cursor", "secrets", "integrations", "jira.env");
const KEY_RE = /^[A-Z]+-\d+$/i;

function loadEnv(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${path} — need ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, JIRA_SITE`);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  for (const key of ["ATLASSIAN_EMAIL", "ATLASSIAN_API_TOKEN", "JIRA_SITE"]) {
    if (!env[key]) throw new Error(`jira.env missing ${key}`);
  }
  return env;
}

function authHeader(email, token) {
  return {
    Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
    Accept: "application/json",
  };
}

async function issueStatus(env, issueKey) {
  const url = `https://${env.JIRA_SITE}/rest/api/3/issue/${issueKey}?fields=status`;
  const res = await fetch(url, { headers: authHeader(env.ATLASSIAN_EMAIL, env.ATLASSIAN_API_TOKEN) });
  if (res.status === 404) return { key: issueKey, missing: true };
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${issueKey}`);
  const json = await res.json();
  const status = json.fields?.status;
  return {
    key: issueKey,
    status: status?.name || "?",
    category: status?.statusCategory?.key || status?.statusCategory?.name || "?",
  };
}

function listTempTicketDirs() {
  if (!existsSync(TEMP_DIR)) return [];
  return readdirSync(TEMP_DIR)
    .filter((name) => {
      const full = join(TEMP_DIR, name);
      try {
        return KEY_RE.test(name) && statSync(full).isDirectory();
      } catch {
        return false;
      }
    })
    .map((name) => name.toUpperCase());
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const keys = argv.filter((a) => KEY_RE.test(a)).map((k) => k.toUpperCase());
  return { dryRun, keys };
}

async function main() {
  const { dryRun, keys } = parseArgs(process.argv.slice(2));
  const env = loadEnv(ENV_PATH);
  const targets = keys.length > 0 ? keys : listTempTicketDirs();

  if (targets.length === 0) {
    console.log("temp-cleanup: no ticket folders under .cursor/temp/");
    return;
  }

  const removed = [];
  const kept = [];

  for (const key of targets) {
    const dir = join(TEMP_DIR, key.toLowerCase());
    if (!existsSync(dir)) {
      console.log(`skip ${key}: no folder`);
      continue;
    }
    const info = await issueStatus(env, key);
    const isDone = info.missing || String(info.category).toLowerCase() === "done";
    if (isDone) {
      if (dryRun) {
        console.log(`would-remove ${key} (${info.missing ? "not found" : info.status})`);
      } else {
        rmSync(dir, { recursive: true, force: true });
        console.log(`removed ${key} (${info.missing ? "not found" : info.status})`);
      }
      removed.push(key);
    } else {
      console.log(`keep ${key} (${info.status})`);
      kept.push(key);
    }
  }

  console.log(
    JSON.stringify({
      dryRun,
      removed,
      kept,
      tempDir: TEMP_DIR,
    })
  );
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
