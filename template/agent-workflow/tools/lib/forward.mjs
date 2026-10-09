/**
 * Stable CLI entry: `node .agent-workflow/tools/cli/<name>.mjs` forwards to the real script.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import { REPO, TOOLS_DIR } from "./paths.mjs";

export function forward(relPath) {
  const child = spawn(process.execPath, [join(TOOLS_DIR, relPath), ...process.argv.slice(2)], {
    stdio: "inherit",
    cwd: REPO,
  });
  child.on("exit", (code) => process.exit(code ?? 1));
  child.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });
}
