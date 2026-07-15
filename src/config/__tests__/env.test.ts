import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

// The test-only preload (test/setup-env.mjs) fills in fake values for the
// process that runs the test suite — but production must still fail fast
// and clearly when a required env var is genuinely missing. Module-level
// validation only runs once per process (subsequent imports are cached), so
// this has to spawn a fresh child process to actually re-trigger it.
const ENV_ENTRY = path.resolve(import.meta.dirname, "..", "env.js");
// Resolved to an absolute path (rather than the bare "tsx" specifier) so it
// still loads correctly once the child process's cwd is moved away from the
// project root — a bare specifier would fail to resolve from an arbitrary cwd.
const TSX_LOADER = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "node_modules",
  "tsx",
  "dist",
  "loader.mjs",
);

function runInChildWithout(missingKey: string): {
  status: number;
  stderr: string;
} {
  const env = { ...process.env };
  delete env[missingKey];

  try {
    execFileSync(
      process.execPath,
      ["--import", TSX_LOADER, "-e", `import(${JSON.stringify(ENV_ENTRY)})`],
      {
        env,
        // No .env file here — this must reproduce a real "no dotenv fallback"
        // production/CI environment, not the repo's local .env.
        cwd: os.tmpdir(),
        stdio: "pipe",
      },
    );
    return { status: 0, stderr: "" };
  } catch (e) {
    const err = e as { status: number | null; stderr: Buffer };
    return { status: err.status ?? 1, stderr: err.stderr.toString("utf8") };
  }
}

test("production runtime (no test preload) still fails fast with a clear error when TELEGRAM_BOT_TOKEN is missing", () => {
  const result = runInChildWithout("TELEGRAM_BOT_TOKEN");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing env: TELEGRAM_BOT_TOKEN/);
});

test("production runtime (no test preload) still fails fast with a clear error when BACKEND_BASE_URL is missing", () => {
  const result = runInChildWithout("BACKEND_BASE_URL");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing env: BACKEND_BASE_URL/);
});
