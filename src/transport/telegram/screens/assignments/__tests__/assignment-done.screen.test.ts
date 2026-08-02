import { test } from "node:test";
import assert from "node:assert/strict";

import { renderAssignmentDoneScreen } from "../assignment-done.screen.js";
import { env } from "../../../../../config/env.js";
import { createMockCtx } from "../../../routes/__tests__/helpers/mock-ctx.js";
import { withEnvOverride } from "../../../routes/__tests__/helpers/with-env-override.js";

const DONE_SCREEN = { name: "assignment_done" as const };

function fakeRun(submitted = true) {
  return {
    clientSessionId: "s1",
    assignmentId: 1,
    lessonId: 1,
    attemptId: 1,
    attemptNo: 1,
    attemptsPolicy: null,
    assignment: {} as never,
    index: 0,
    shownAt: 0,
    startInFlight: false,
    nextInFlight: false,
    submitInFlight: false,
    submitted,
    results: {},
  };
}

function withBothVideoEnvSet(fn: () => Promise<void>) {
  return withEnvOverride(
    env.studentMedia,
    {
      taskResultLowVideoFileId: "test_low_video",
      taskResultPositiveVideoFileId: "test_positive_video",
    },
    fn,
  );
}

test("score just under 30% picks the low-result video", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: 0.29 },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 1);
    assert.equal(sendVideoCalls[0]?.fileId, "test_low_video");
  });
});

test("score at exactly 30% picks the positive-result video (the boundary)", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: 0.3 },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 1);
    assert.equal(sendVideoCalls[0]?.fileId, "test_positive_video");
  });
});

test("score well above 30% picks the positive-result video", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: 0.75 },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 1);
    assert.equal(sendVideoCalls[0]?.fileId, "test_positive_video");
  });
});

test("low and positive video are never sent together for the same result", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: 0.1 },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 1);
  });
});

test("score === null (done-saved) never touches the media path, even with both video envs set", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls, replyCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: null },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 0);
    assert.equal(replyCalls.length, 1);
    assert.ok(replyCalls[0]?.text.includes("done-saved"));
  });
});

test("without any video env set — sends the plain text result as before", async () => {
  const { ctx, sendVideoCalls, replyCalls } = createMockCtx({
    session: { assignmentRun: fakeRun(), assignmentLastScore: 0.9 },
  });

  await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

  assert.equal(sendVideoCalls.length, 0);
  assert.equal(replyCalls.length, 1);
  assert.ok(replyCalls[0]?.text.includes("result-percent"));
});

test("a media-file error on the video falls back to the text result exactly once", async () => {
  await withBothVideoEnvSet(async () => {
    const { GrammyError } = await import("grammy");
    const { ctx, sendVideoCalls, replyCalls } = createMockCtx({
      session: { assignmentRun: fakeRun(), assignmentLastScore: 0.9 },
      sendVideoImpl: async () => {
        throw new GrammyError(
          "Call failed",
          {
            ok: false,
            error_code: 400,
            description:
              "Bad Request: wrong file identifier/HTTP URL specified",
            parameters: {},
          },
          "sendVideo",
          {},
        );
      },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 1);
    assert.equal(replyCalls.length, 1);
  });
});

test("session-not-found and submit-error branches are unaffected by video env", async () => {
  await withBothVideoEnvSet(async () => {
    const { ctx, sendVideoCalls, replyCalls } = createMockCtx({
      session: { assignmentRun: null },
    });

    await renderAssignmentDoneScreen(ctx, {} as never, DONE_SCREEN);

    assert.equal(sendVideoCalls.length, 0);
    assert.ok(replyCalls[0]?.text.includes("session-not-found"));
  });
});
