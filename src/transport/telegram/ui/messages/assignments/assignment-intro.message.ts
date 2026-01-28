import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";

export function assignmentIntroMessage(a: InternalAssignmentDto) {
  const lines: string[] = [];

  lines.push("📝 Задание");

  const meta: string[] = [];
  if (a.lesson?.title) meta.push(a.lesson.title);
  if (a.lesson?.topic) meta.push(a.lesson.topic);
  if (a.lesson?.level) meta.push(a.lesson.level);

  if (meta.length) {
    lines.push(meta.join(" • "));
  }

  lines.push("");
  lines.push(`Вопросов: ${a.questions.length}`);
  lines.push("");

  lines.push("Готов(а)? Нажми «Начать».");

  return lines.join("\n");
}
