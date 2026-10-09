/**
 * Load `.cursor/project.config.json` (project-specific workflow settings).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CURSOR_DIR } from "./paths.mjs";

const CONFIG_PATH = join(CURSOR_DIR, "project.config.json");

const DEFAULTS = {
  issueKeyPrefixes: ["PROJ"],
  defaultBaseBranch: "main",
  dailyReport: {
    filePattern: "Developer_Report_YYYY-MM-DD.md",
    authorLabel: "Developer",
  },
};

let cached = null;

export function loadProjectConfig() {
  if (cached) return cached;
  if (!existsSync(CONFIG_PATH)) {
    cached = { ...DEFAULTS, _missing: true };
    return cached;
  }
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    cached = {
      ...DEFAULTS,
      ...raw,
      dailyReport: { ...DEFAULTS.dailyReport, ...raw.dailyReport },
    };
    return cached;
  } catch {
    cached = { ...DEFAULTS, _parseError: true };
    return cached;
  }
}

export function issueKeyRegex() {
  const cfg = loadProjectConfig();
  const prefixes = cfg.issueKeyPrefixes || DEFAULTS.issueKeyPrefixes;
  const alt = prefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`^(${alt})-\\d+$`, "i");
}

export function issueKeyExtractRegex() {
  const cfg = loadProjectConfig();
  const prefixes = cfg.issueKeyPrefixes || DEFAULTS.issueKeyPrefixes;
  const alt = prefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(${alt})-\\d+`, "i");
}

export function dailyReportPathForDate(date = new Date()) {
  const cfg = loadProjectConfig();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const pattern = cfg.dailyReport?.filePattern || "Developer_Report_YYYY-MM-DD.md";
  const fileName = pattern
    .replace("YYYY", String(yyyy))
    .replace("MM", mm)
    .replace("DD", dd);
  return join(CURSOR_DIR, "reports", fileName);
}
