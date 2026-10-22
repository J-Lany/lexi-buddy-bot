import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CALLBACK_DATA_MAX_BYTES,
  ERROR_GENERIC_RU,
  choiceQuestions,
  createAssignmentRunHarness,
  staleAckIn,
  textQuestions,
} from "./helpers/assignment-run-harness.js";

// "Old" IDs fit the previous callback format; "new" IDs (5-digit answer ids)
// pushed it past Telegram's 64-byte limit — the production failure.
const ID_SETS = {
  old: { q: 812, a: 2431 },
  new: { q: 3334, a: 10001 },
  huge: { q: 2_000_000_000, a: 2_000_000_000 },
} as const;

const CHOICE_TYPES = ["definition_quiz", "phrase_fail"] as const;

for (const assignmentType of CHOICE_TYPES) {
  for (const [label, ids] of Object.entries(ID_SETS)) {
    test(`${assignmentType} (${label} ids): starts, every button fits, full run submits the chosen answers`, async () => {
      const h = createAssignmentRunHarness({
        assignmentType,
        questions: choiceQuestions(ids.q, ids.a),
      });

      const startCalls = await h.start();
      assert.ok(
        !startCalls.some((c) => c.payload.text === ERROR_GENERIC_RU),
        "start must not show the generic error",
      );

      const run = h.session.assignmentRun!;
      assert.ok(run, "assignment run created");

      for (let i = 0; i < run.assignment.questions.length; i++) {
        const buttons = h.lastQuestionButtons();
        assert.equal(buttons.length, 3, `question ${i}: 3 answer buttons`);
        for (const data of buttons) {
          assert.ok(
            Buffer.byteLength(data, "utf8") <= CALLBACK_DATA_MAX_BYTES,
            `callback_data too long: ${data}`,
          );
        }

        const q = run.assignment.questions[i]!;
        const correctIdx = q.answers.findIndex((a) => a.isCorrect);
        const pressCalls = await h.pressButton(buttons[correctIdx]!);
        assert.ok(!staleAckIn(pressCalls), `question ${i}: answer accepted`);
      }

      assert.equal(h.submitted.length, 1, "submitted exactly once");
      const body = h.submitted[0] as {
        results: Array<{
          questionId: number;
          attempts: Array<{ answer: { answerId: number }; isCorrect: boolean }>;
        }>;
      };
      assert.equal(body.results.length, 8);
      for (const r of body.results) {
        const q = run.assignment.questions.find((x) => x.id === r.questionId)!;
        const correct = q.answers.find((a) => a.isCorrect)!;
        assert.equal(r.attempts.length, 1);
        assert.equal(r.attempts[0]!.answer.answerId, correct.id);
        assert.equal(r.attempts[0]!.isCorrect, true);
      }
    });
  }
}

const TEXT_TYPES = [
  { assignmentType: "gap_filling", questionType: "gap_fill" },
  { assignmentType: "collocation_check", questionType: "open_text" },
] as const;

for (const { assignmentType, questionType } of TEXT_TYPES) {
  test(`${assignmentType} (huge ids): text flow is unchanged and sends no answer buttons`, async () => {
    const h = createAssignmentRunHarness({
      assignmentType,
      questions: textQuestions(questionType, ID_SETS.huge.q, ID_SETS.huge.a),
    });

    const startCalls = await h.start();
    assert.ok(!startCalls.some((c) => c.payload.text === ERROR_GENERIC_RU));
    assert.deepEqual(h.lastQuestionButtons(), []);

    const run = h.session.assignmentRun!;
    for (let i = 0; i < run.assignment.questions.length; i++) {
      const q = run.assignment.questions[run.index]!;
      await h.sendText(q.answers[0]!.text);
    }

    assert.equal(h.submitted.length, 1);
  });
}

test("stale: a button from a previous run is rejected", async () => {
  const h = createAssignmentRunHarness({
    assignmentType: "definition_quiz",
    questions: choiceQuestions(ID_SETS.new.q, ID_SETS.new.a),
  });

  await h.start();
  const oldButton = h.lastQuestionButtons()[0]!;

  // Re-open the intro and start again → a new run with a new session token.
  h.session.nav.stack = [
    { name: "home" },
    { name: "assignment_intro", assignmentId: 77 },
  ];
  await h.start();
  const run = h.session.assignmentRun!;

  const calls = await h.pressButton(oldButton);
  assert.ok(staleAckIn(calls));
  assert.deepEqual(run.results, {});
});

test("stale: a button for an earlier question is rejected", async () => {
  const h = createAssignmentRunHarness({
    assignmentType: "phrase_fail",
    questions: choiceQuestions(ID_SETS.new.q, ID_SETS.new.a),
  });

  await h.start();
  const firstQuestionButtons = h.lastQuestionButtons();
  await h.pressButton(firstQuestionButtons[0]!);

  const run = h.session.assignmentRun!;
  assert.equal(run.index, 1);

  const calls = await h.pressButton(firstQuestionButtons[1]!);
  assert.ok(staleAckIn(calls));
  assert.equal(run.index, 1);
  assert.equal(Object.keys(run.results).length, 1);
});

test("repeat press: the same answer button twice records one attempt", async () => {
  const h = createAssignmentRunHarness({
    assignmentType: "definition_quiz",
    questions: choiceQuestions(ID_SETS.new.q, ID_SETS.new.a).slice(0, 2),
  });

  await h.start();
  const button = h.lastQuestionButtons()[0]!;
  const run = h.session.assignmentRun!;
  const firstQuestionId = run.assignment.questions[0]!.id;

  await h.pressButton(button);
  const second = await h.pressButton(button);

  assert.ok(staleAckIn(second));
  assert.equal(run.results[firstQuestionId]!.attempts.length, 1);
  assert.equal(run.index, 1);
});

test("legacy assignment_choose callback for the active run is still accepted", async () => {
  const h = createAssignmentRunHarness({
    assignmentType: "definition_quiz",
    questions: choiceQuestions(ID_SETS.old.q, ID_SETS.old.a),
  });

  await h.start();
  const run = h.session.assignmentRun!;
  const q = run.assignment.questions[0]!;
  const answer = q.answers[1]!;

  const calls = await h.pressButton(
    `assignment_choose:${run.clientSessionId}:${q.id}:${answer.id}`,
  );

  assert.ok(!staleAckIn(calls));
  assert.equal(run.results[q.id]!.attempts[0]!.answer.answerId, answer.id);
  assert.equal(run.index, 1);
});

test("legacy assignment_choose callback from another session is rejected", async () => {
  const h = createAssignmentRunHarness({
    assignmentType: "definition_quiz",
    questions: choiceQuestions(ID_SETS.old.q, ID_SETS.old.a),
  });

  await h.start();
  const run = h.session.assignmentRun!;
  const q = run.assignment.questions[0]!;

  const calls = await h.pressButton(
    `assignment_choose:00000000-0000-4000-8000-000000000000:${q.id}:${q.answers[0]!.id}`,
  );

  assert.ok(staleAckIn(calls));
  assert.deepEqual(run.results, {});
});
