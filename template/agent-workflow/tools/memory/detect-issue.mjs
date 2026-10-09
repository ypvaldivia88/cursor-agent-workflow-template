/**
 * Infer active issue key from git branch, daily report, and .agent-workflow/temp folders.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { AGENT_WORKFLOW_DIR, REPO, TEMP_DIR } from "../lib/paths.mjs";
import {
  dailyReportPathForDate,
  issueKeyExtractRegex,
  issueKeyRegex,
} from "../lib/project-config.mjs";
import { queryEvents } from "./episodic.mjs";

function issueFromGitBranch() {
  const issueRe = issueKeyRegex();
  const extractRe = issueKeyExtractRegex();
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: REPO,
      encoding: "utf8",
    }).trim();
    const upper = branch.toUpperCase();
    const full = upper.match(issueRe);
    if (full) return { issueKey: full[0].toUpperCase(), source: "git-branch" };
    const match = upper.match(extractRe);
    if (match) return { issueKey: match[0].toUpperCase(), source: "git-branch" };
  } catch {
    // not a git repo or git missing
  }
  return null;
}

function issueFromTempDirs() {
  const extractRe = issueKeyExtractRegex();
  if (!existsSync(TEMP_DIR)) return null;
  const candidates = [];
  for (const name of readdirSync(TEMP_DIR)) {
    const match = name.match(extractRe);
    if (!match) continue;
    const issueKey = match[0].toUpperCase();
    const full = join(TEMP_DIR, name.toLowerCase());
    const alt = join(TEMP_DIR, name);
    const path = existsSync(full) ? full : alt;
    try {
      const mtime = statSync(path).mtimeMs;
      candidates.push({ issueKey, mtime, source: "temp-folder" });
    } catch {
      candidates.push({ issueKey, mtime: 0, source: "temp-folder" });
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.mtime - a.mtime);
  return { issueKey: candidates[0].issueKey, source: candidates[0].source };
}

function clientForIssue(issueKey) {
  const events = queryEvents({ issueKey, limit: 1 });
  if (events.length > 0 && events[0].client) {
    return { client: events[0].client, source: "episodic" };
  }
  return null;
}

function issueFromDailyReport() {
  const path = dailyReportPathForDate();
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf8");
  const extractRe = issueKeyExtractRegex();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!extractRe.test(line)) continue;
    if (/\(planned\)/i.test(line)) continue;
    if (/\(\d+:\d+\s*hrs\)/i.test(line)) {
      const m = line.match(extractRe);
      if (m) return { issueKey: m[0].toUpperCase(), source: "daily-report" };
    }
  }

  const fallback = text.match(extractRe);
  if (fallback) {
    return { issueKey: fallback[0].toUpperCase(), source: "daily-report-fallback" };
  }
  return null;
}

function clientFromActiveProfile() {
  const path = join(AGENT_WORKFLOW_DIR, "secrets", "local", ".current-profile");
  if (!existsSync(path)) return null;
  const id = readFileSync(path, "utf8").trim().toLowerCase();
  if (!id || id.includes("\n")) return null;
  return { client: id, source: "active-profile" };
}

/**
 * @param {{ explicitIssue?: string, explicitClient?: string }} overrides
 */
export function detectActiveIssue(overrides = {}) {
  const explicit = overrides.explicitIssue
    ? String(overrides.explicitIssue).toUpperCase()
    : null;
  const fromGit = issueFromGitBranch();
  const fromReport = issueFromDailyReport();
  const fromTemp = issueFromTempDirs();

  let issueKey = explicit;
  let issueSource = explicit ? "user-message" : null;

  if (!issueKey && fromGit) {
    issueKey = fromGit.issueKey;
    issueSource = fromGit.source;
  }
  if (!issueKey && fromReport) {
    issueKey = fromReport.issueKey;
    issueSource = fromReport.source;
  }
  if (!issueKey && fromTemp) {
    issueKey = fromTemp.issueKey;
    issueSource = fromTemp.source;
  }

  let client = overrides.explicitClient
    ? String(overrides.explicitClient).toLowerCase()
    : null;
  let clientSource = client ? "user-message" : null;

  if (issueKey && !client) {
    const resolved = clientForIssue(issueKey);
    if (resolved) {
      client = resolved.client;
      clientSource = resolved.source;
    }
  }

  if (!client) {
    const fromProfile = clientFromActiveProfile();
    if (fromProfile) {
      client = fromProfile.client;
      clientSource = fromProfile.source;
    }
  }

  return {
    issueKey,
    client,
    issueSource,
    clientSource,
  };
}
