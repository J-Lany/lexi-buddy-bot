import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import {
  CHOICE_CALLBACK_TRIGGER,
  encodeChoiceCallback,
  parseChoiceCallback,
  runTokenOf,
} from "../assignment-choice-callback.js";
import { AssignmentRunFlow } from "../../../../application/assignment-run/assignment-run.flow.js";
import type { BotContext } from "../../context.js";

test("encode → parse round-trips positions and run token", () => {
  const clientSessionId = randomUUID();
  const data = encodeChoiceCallback({
    clientSessionId,
    questionIndex: 7,
    answerIndex: 2,
  });

  assert.match(data, /^ac:[0-9a-f]{8}:7:2$/);
  assert.ok(CHOICE_CALLBACK_TRIGGER.test(data));
  assert.deepEqual(parseChoiceCallback(data), {
    format: "compact",
    runToken: runTokenOf(clientSessionId),
    questionIndex: 7,
    answerIndex: 2,
  });
});

test("worst case stays within Telegram's 64 bytes regardless of database ids", () => {
  const data = encodeChoiceCallback({
    clientSessionId: randomUUID(),
    questionIndex: Number.MAX_SAFE_INTEGER,
    answerIndex: Number.MAX_SAFE_INTEGER,
  });
  assert.ok(Buffer.byteLength(data, "utf8") <= 64, `${data.length} bytes`);
});

test("legacy assignment_choose format is still parsed", () => {
  const sessionId = randomUUID();
  const data = `assignment_choose:${sessionId}:812:2433`;

  assert.ok(CHOICE_CALLBACK_TRIGGER.test(data));
  assert.deepEqual(parseChoiceCallback(data), {
    format: "legacy",
    sessionId,
    questionId: 812,
    answerId: 2433,
  });
});

test("malformed data is rejected", () => {
  for (const data of [
    "ac:",
    "ac:abc:1",
    "ac:abc:x:1",
    "ac:ABC:1:1",
    "assignment_choose:s:1",
    "assignment_choose::1:2",
    "acx:abc:1:1",
  ]) {
    assert.equal(parseChoiceCallback(data), null, data);
  }
});

function ctxWithRun(clientSessionId: string) {
  return {
    session: {
      assignmentRun: {
        clientSessionId,
        assignment: {
          questions: [
            { id: 31, answers: [{ id: 301 }, { id: 302 }, { id: 303 }] },
            { id: 32, answers: [{ id: 304 }, { id: 305 }, { id: 306 }] },
          ],
        },
      },
    },
  } as unknown as BotContext;
}

test("resolveChoiceCallback maps positions to ids of the active run", () => {
  const flow = new AssignmentRunFlow();
  const clientSessionId = randomUUID();
  const ctx = ctxWithRun(clientSessionId);

  assert.deepEqual(
    flow.resolveChoiceCallback(ctx, {
      format: "compact",
      runToken: runTokenOf(clientSessionId),
      questionIndex: 1,
      answerIndex: 2,
    }),
    { sessionId: clientSessionId, questionId: 32, answerId: 306 },
  );
});

test("resolveChoiceCallback rejects foreign runs and out-of-range positions", () => {
  const flow = new AssignmentRunFlow();
  const clientSessionId = randomUUID();
  const ctx = ctxWithRun(clientSessionId);
  const runToken = runTokenOf(clientSessionId);

  const cases = [
    { runToken: runTokenOf(randomUUID()), questionIndex: 0, answerIndex: 0 },
    { runToken, questionIndex: 2, answerIndex: 0 },
    { runToken, questionIndex: 0, answerIndex: 3 },
  ];
  for (const c of cases) {
    assert.equal(
      flow.resolveChoiceCallback(ctx, { format: "compact", ...c }),
      null,
      JSON.stringify(c),
    );
  }

  assert.equal(
    flow.resolveChoiceCallback({ session: {} } as unknown as BotContext, {
      format: "compact",
      runToken,
      questionIndex: 0,
      answerIndex: 0,
    }),
    null,
  );
});
