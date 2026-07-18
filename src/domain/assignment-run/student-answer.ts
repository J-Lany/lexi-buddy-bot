import type { InternalAssignmentQuestionDto } from "../../infra/backend-api/backend-api.types.js";

type ChoiceAnswer = { answerId: number; text?: string };
type TextAnswer = { text: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isTextAnswer(v: unknown): v is TextAnswer {
  return isObject(v) && typeof v.text === "string";
}

function isChoiceAnswer(v: unknown): v is ChoiceAnswer {
  return isObject(v) && typeof v.answerId === "number";
}

export function getStudentAnswerText(
  question: InternalAssignmentQuestionDto,
  answer: unknown,
): string | null {
  if (isTextAnswer(answer)) {
    return answer.text.trim() || null;
  }

  if (isChoiceAnswer(answer)) {
    const a = question.answers.find((x) => x.id === answer.answerId);
    const fromQuestion = a?.text?.trim();
    if (fromQuestion) return fromQuestion;

    const fromPayload =
      typeof answer.text === "string" ? answer.text.trim() : "";
    return fromPayload || null;
  }

  return null;
}
