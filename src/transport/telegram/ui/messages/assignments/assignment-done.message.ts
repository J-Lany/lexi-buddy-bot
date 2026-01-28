export function assignmentDoneMessage(score: number | null) {
  const lines: string[] = [];

  lines.push("Готово ✅");
  lines.push("");

  if (score === null) {
    lines.push("Ответы сохранены.");
  } else {
    lines.push(`Результат: ${Math.round(score * 100)}%`);
  }

  lines.push("");
  lines.push("Хочешь — разберём ответы.");

  return lines.join("\n");
}
