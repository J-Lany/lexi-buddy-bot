/**
 * callback_data for answer buttons of choice questions (any assignment type
 * whose questions are "multiple_choice").
 *
 * Telegram caps callback_data at 64 bytes. The previous format embedded a
 * full UUID plus database question/answer ids and broke once ids grew. The
 * run (shuffled questions and answers) already lives in the session, so a
 * button only needs positions inside that run:
 *
 *   ac:<runToken>:<questionIndex>:<answerIndex>     e.g. ac:3f9a1c2e:7:2
 *
 * Size depends on question/answer counts, never on database ids.
 * runToken is derived from the run's clientSessionId, so a button from a
 * previous run is rejected as stale.
 */
const PREFIX = "ac";
const LEGACY_PREFIX = "assignment_choose";
const RUN_TOKEN_LENGTH = 8;

/** Matches both formats, for bot.callbackQuery(...). */
export const CHOICE_CALLBACK_TRIGGER = /^(?:ac|assignment_choose):/;

export type ChoiceCallback =
  | {
      format: "compact";
      runToken: string;
      questionIndex: number;
      answerIndex: number;
    }
  // Buttons sent before this format existed may still sit in students' chats.
  | {
      format: "legacy";
      sessionId: string;
      questionId: number;
      answerId: number;
    };

export function runTokenOf(clientSessionId: string): string {
  return clientSessionId.replaceAll("-", "").slice(0, RUN_TOKEN_LENGTH);
}

export function encodeChoiceCallback(params: {
  clientSessionId: string;
  questionIndex: number;
  answerIndex: number;
}): string {
  const { clientSessionId, questionIndex, answerIndex } = params;
  return `${PREFIX}:${runTokenOf(clientSessionId)}:${questionIndex}:${answerIndex}`;
}

export function parseChoiceCallback(data: string): ChoiceCallback | null {
  const compact = new RegExp(`^${PREFIX}:([0-9a-z]+):(\\d+):(\\d+)$`).exec(
    data,
  );
  if (compact) {
    return {
      format: "compact",
      runToken: compact[1]!,
      questionIndex: Number(compact[2]),
      answerIndex: Number(compact[3]),
    };
  }

  const legacy = new RegExp(`^${LEGACY_PREFIX}:([^:]+):(\\d+):(\\d+)$`).exec(
    data,
  );
  if (legacy) {
    return {
      format: "legacy",
      sessionId: legacy[1]!,
      questionId: Number(legacy[2]),
      answerId: Number(legacy[3]),
    };
  }

  return null;
}
