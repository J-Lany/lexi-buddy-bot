const EMOJIS = ["🇦", "🇧", "🇨"];

export function choiceEmoji(index: number): string {
  return EMOJIS[index] ?? "➡️";
}
