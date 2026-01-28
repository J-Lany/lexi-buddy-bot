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

  const lines: string[] = [];

  if (correct) {
    lines.push("✅ Верно.");
  } else {
    if (attempt < maxAttempts) {
      lines.push(
        `❌ Пока не так. Попробуй ещё раз (${attempt}/${maxAttempts}).`,
      );
    } else {
      lines.push(`❌ Попытки закончились (${attempt}/${maxAttempts}).`);
    }

    if (showCorrectAnswer && correctAnswerText) {
      lines.push("");
      lines.push(`Правильный ответ: ${correctAnswerText}`);
    }
  }

  if (explanation) {
    lines.push("");
    lines.push("Пояснение:");
    lines.push(explanation);
  }

  return lines.join("\n");
}
