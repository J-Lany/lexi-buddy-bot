type AttemptsPolicyLike =
  | {
      maxAttempts: number;
      showCorrectOnAttempt: number;
      appliesToQuestionTypes: string[];
    }
  | null
  | undefined;

export function maxAttemptsForQuestionType(
  qType: string,
  policy?: AttemptsPolicyLike,
): number {
  if (policy?.appliesToQuestionTypes?.includes(qType)) {
    return policy.maxAttempts;
  }

  if (qType === "gap_fill" || qType === "open_text") return 3;
  return 1;
}

export function showCorrectOnAttemptForQuestionType(
  qType: string,
  policy?: AttemptsPolicyLike,
): number {
  if (policy?.appliesToQuestionTypes?.includes(qType)) {
    return policy.showCorrectOnAttempt;
  }

  if (qType === "gap_fill" || qType === "open_text") return 3;
  return 1;
}
