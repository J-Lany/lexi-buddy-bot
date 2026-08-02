export type UpdateTrackerSnapshot = {
  uptimeMs: number;
  activeUpdateCount: number;
  activeUpdateAgeMs: number | null;
  lastUpdateReceivedAgoMs: number | null;
  lastUpdateFinishedAgoMs: number | null;
};

export type UpdateTracker = {
  recordUpdateReceived: () => void;
  recordUpdateFinished: () => void;
  // eslint-disable-next-line no-unused-vars -- named for readability of the type signature only
  getSnapshot: (currentTime?: number) => UpdateTrackerSnapshot;
};

// Simple long polling (bot.start()) processes updates sequentially, so
// activeUpdateCount is only ever 0 or 1 today. Tracked as a counter (rather
// than a boolean) so this keeps working without changes if that ever stops
// being true, e.g. a future move to @grammyjs/runner.
export function createUpdateTracker(
  processStartedAt: number = Date.now(),
): UpdateTracker {
  let lastUpdateReceivedAt: number | null = null;
  let lastUpdateFinishedAt: number | null = null;
  let activeUpdateCount = 0;
  let activeUpdateStartedAt: number | null = null;

  return {
    recordUpdateReceived() {
      const now = Date.now();
      lastUpdateReceivedAt = now;
      activeUpdateCount += 1;
      if (activeUpdateStartedAt === null) {
        activeUpdateStartedAt = now;
      }
    },

    recordUpdateFinished() {
      lastUpdateFinishedAt = Date.now();
      if (activeUpdateCount > 0) {
        activeUpdateCount -= 1;
      }
      if (activeUpdateCount === 0) {
        activeUpdateStartedAt = null;
      }
    },

    getSnapshot(now: number = Date.now()): UpdateTrackerSnapshot {
      return {
        uptimeMs: now - processStartedAt,
        activeUpdateCount,
        activeUpdateAgeMs:
          activeUpdateStartedAt === null ? null : now - activeUpdateStartedAt,
        lastUpdateReceivedAgoMs:
          lastUpdateReceivedAt === null ? null : now - lastUpdateReceivedAt,
        lastUpdateFinishedAgoMs:
          lastUpdateFinishedAt === null ? null : now - lastUpdateFinishedAt,
      };
    },
  };
}
