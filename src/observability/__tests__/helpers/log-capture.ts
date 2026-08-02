type CapturedLog = {
  method: "log" | "warn" | "error";
  payload: Record<string, unknown>;
};

/**
 * The logger (observability/logger.ts) writes JSON lines straight to
 * console.log/warn/error — capturing those is the only way to assert on
 * what actually got logged without changing the logger's public API.
 */
export function captureConsole(): {
  entries: CapturedLog[];
  restore: () => void;
} {
  const entries: CapturedLog[] = [];
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  function record(method: CapturedLog["method"]) {
    return (line: unknown) => {
      try {
        entries.push({ method, payload: JSON.parse(String(line)) });
      } catch {
        // Not one of our JSON log lines — ignore.
      }
    };
  }

  console.log = record("log");
  console.warn = record("warn");
  console.error = record("error");

  return {
    entries,
    restore() {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
    },
  };
}
