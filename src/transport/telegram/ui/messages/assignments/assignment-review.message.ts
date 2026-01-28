import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";

export function assignmentReviewMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
  studentAnswerText: string | null;
  correctAnswerText: string | null;
}) {
  const { a, q, index, studentAnswerText, correctAnswerText } = params;

  const lines: string[] = [];
  lines.push(`Разбор • ${index + 1}/${a.questions.length}`);
  lines.push("");

  lines.push(`Вопрос: ${q.text}`);
  lines.push("");
  lines.push(`Твой ответ: ${studentAnswerText ?? "—"}`);
  lines.push(`Правильный ответ: ${correctAnswerText ?? "—"}`);

  if (q.explanation) {
    lines.push("");
    lines.push("Пояснение:");
    lines.push(q.explanation);
  }

  return lines.join("\n");
}
