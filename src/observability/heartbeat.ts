import { logError, logInfo } from "./logger.js";
import type { UpdateTracker } from "./update-tracker.js";

export function startHeartbeat(
  tracker: UpdateTracker,
  intervalMs: number,
): NodeJS.Timeout {
  const timer = setInterval(() => {
    try {
      const snapshot = tracker.getSnapshot();

      logInfo("app_heartbeat", {
        uptime_ms: snapshot.uptimeMs,
        active_update_count: snapshot.activeUpdateCount,
        active_update_age_ms: snapshot.activeUpdateAgeMs,
        last_update_received_ago_ms: snapshot.lastUpdateReceivedAgoMs,
        last_update_finished_ago_ms: snapshot.lastUpdateFinishedAgoMs,
      });
    } catch (error) {
      // This is a background diagnostic tick, not critical path — it must
      // never reach the process-level uncaughtException handler and kill
      // the bot. If logging the failure itself throws (a broken logger),
      // give up silently rather than retry or recurse.
      try {
        logError("heartbeat_tick_failed", error);
      } catch {
        // Nothing more we can safely do here.
      }
    }
  }, intervalMs);

  timer.unref();

  return timer;
}
