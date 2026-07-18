export function getCorrectAnswerText(question: {
  answers: Array<{ text: string; isCorrect: boolean }>;
}): string | null {
  const ans = question.answers.find((a) => a.isCorrect);
  return ans?.text ?? null;
}
