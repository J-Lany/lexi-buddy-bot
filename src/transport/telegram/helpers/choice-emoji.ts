export function choiceEmoji(index: number): string {
  const base = 0x1f1e6;
  if (index >= 0 && index < 26) {
    return String.fromCodePoint(base + index);
  }
  return "➡️";
}
