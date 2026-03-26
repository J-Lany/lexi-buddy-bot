import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";
import { escapeHtml } from "../../helpers/html.js";
import {
  isChoiceQuestion,
  isTextQuestion,
} from "../../../../../domain/assignment-run/question.type.js";

export function assignmentFeedbackMessage(params: {
  questionType: string;
  correct: boolean;
  attempt: number;
  maxAttempts: number;
  correctAnswerText: string | null;
  explanation: string | null;
  showCorrectAnswer: boolean;
}) {
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
    lines.push(copy.ui.assignment.feedback.correct);

    if (safeExplanation) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.explanationTitle);
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  if (isChoiceQuestion(questionType)) {
    lines.push(copy.ui.assignment.feedback.wrongChoice);

    if (correctAnswerText) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.correctAnswer(correctAnswerText));
    }

    if (safeExplanation) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.explanationTitle);
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  if (isTextQuestion(questionType)) {
    if (attempt < maxAttempts) {
      lines.push(
        copy.ui.assignment.feedback.wrongTryAgain(attempt, maxAttempts),
      );
      return uiMessage(lines);
    }

    lines.push(
      copy.ui.assignment.feedback.wrongNoMoreText(attempt, maxAttempts),
    );

    if (showCorrectAnswer && correctAnswerText) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.correctAnswer(correctAnswerText));
    }

    if (safeExplanation) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.explanationTitle);
      lines.push(safeExplanation);
    }

    return uiMessage(lines);
  }

  lines.push(copy.ui.assignment.feedback.wrongChoice);

  if (correctAnswerText) {
    lines.push("");
    lines.push(copy.ui.assignment.feedback.correctAnswer(correctAnswerText));
  }

  return uiMessage(lines);
}
