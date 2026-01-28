function normalizeLetters(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[\s\-–—_]+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function isCorrectTextAnswer(
  studentText: string,
  correctText: string,
): boolean {
  return normalizeLetters(studentText) === normalizeLetters(correctText);
}
