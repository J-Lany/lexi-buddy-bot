import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function assignmentFeedbackMessage(params: {
  correct: boolean;
  attempt: number;
  maxAttempts: number;
  correctAnswerText: string | null;
  explanation: string | null;
  showCorrectAnswer: boolean;
}) {
  const {
    correct,
    attempt,
    maxAttempts,
    correctAnswerText,
    explanation,
    showCorrectAnswer,
  } = params;

  const lines: Array<string | null> = [];

  if (correct) {
    lines.push(copy.ui.assignment.feedback.correct);
  } else {
    if (attempt < maxAttempts) {
      lines.push(
        copy.ui.assignment.feedback.wrongTryAgain(attempt, maxAttempts),
      );
    } else {
      lines.push(copy.ui.assignment.feedback.wrongNoMore(attempt, maxAttempts));
    }

    if (showCorrectAnswer && correctAnswerText) {
      lines.push("");
      lines.push(copy.ui.assignment.feedback.correctAnswer(correctAnswerText));
    }
  }

  if (explanation?.trim()) {
    lines.push("");
    lines.push(copy.ui.assignment.feedback.explanationTitle);
    lines.push(explanation.trim());
  }

  return uiMessage(lines);
}
