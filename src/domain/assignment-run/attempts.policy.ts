export function maxAttemptsForQuestionType(qType: string): number {
  if (qType === "gap_fill" || qType === "open_text") return 3;
  return 1;
}
