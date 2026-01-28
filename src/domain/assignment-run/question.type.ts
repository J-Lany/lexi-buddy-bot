export function isTextQuestion(qType: string) {
  return qType === "gap_fill" || qType === "open_text";
}

export function isChoiceQuestion(qType: string) {
  return qType === "multiple_choice";
}
