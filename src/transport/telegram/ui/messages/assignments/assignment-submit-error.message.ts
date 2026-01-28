export function assignmentSubmitErrorMessage(params: {
  details?: string | null;
}) {
  const details = params.details?.trim() || null;

  const lines: string[] = [];
  lines.push("⚠️ Не получилось отправить ответы");
  lines.push("");
  lines.push("Похоже, связь прервалась или сервер занят.");
  lines.push("Нажми «Повторить отправку» — и продолжим.");

  if (details) {
    lines.push("");
    lines.push(`Детали: ${details}`);
  }

  return lines.join("\n");
}
