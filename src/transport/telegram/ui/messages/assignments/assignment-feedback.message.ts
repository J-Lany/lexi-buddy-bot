import { uiMessage } from "../../helpers/ui.js";
import { escapeHtml } from "../../helpers/html.js";
import {
  isChoiceQuestion,
  isTextQuestion,
} from "../../../../../domain/assignment-run/question.type.js";
import type { Translator } from "../../helpers/copy.js";

export function assignmentFeedbackMessage(
  t: Translator,
  params: {
    questionType: string;
    correct: boolean;
    attempt: number;
    maxAttempts: number;
    correctAnswerText: string | null;
    explanation: string | null;
    showCorrectAnswer: boolean;
  },
) {
  const {
    questionType,
    correct,
    attempt,
    maxAttempts,
    correctAnswerText,
    explanation,
    showCorrectAnswer,
  } = params;

  const lines: Array<string | null> = [];
  const safeExplanation = explanation?.trim()
    ? escapeHtml(explanation.trim())
    : null;

  if (correct) {
    lines.push(t("feedback-correct"));

    if (safeExplanation) {
      lines.push("");
      lines.push(t("feedback-explanation-title"));
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  if (isChoiceQuestion(questionType)) {
    lines.push(t("feedback-wrong-choice"));

    if (correctAnswerText) {
      lines.push("");
      lines.push(
        t("feedback-correct-answer", { answer: escapeHtml(correctAnswerText) }),
      );
    }

    if (safeExplanation) {
      lines.push("");
      lines.push(t("feedback-explanation-title"));
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  if (isTextQuestion(questionType)) {
    if (attempt < maxAttempts) {
      lines.push(t("feedback-wrong-try-again", { attempt, max: maxAttempts }));
      return uiMessage(lines);
    }

    lines.push(t("feedback-wrong-no-more", { attempt, max: maxAttempts }));

    if (showCorrectAnswer && correctAnswerText) {
      lines.push("");
      lines.push(
        t("feedback-correct-answer", { answer: escapeHtml(correctAnswerText) }),
      );
    }

    if (safeExplanation) {
      lines.push("");
      lines.push(t("feedback-explanation-title"));
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  lines.push(t("feedback-wrong-choice"));

  if (correctAnswerText) {
    lines.push("");
    lines.push(
      t("feedback-correct-answer", { answer: escapeHtml(correctAnswerText) }),
    );
  }

  return uiMessage(lines);
}
