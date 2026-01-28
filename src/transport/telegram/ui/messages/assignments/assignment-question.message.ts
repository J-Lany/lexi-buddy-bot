import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";

export function assignmentQuestionMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
}) {
  const { a, q, index } = params;

  const lines: string[] = [];
  lines.push(`Вопрос ${index + 1} из ${a.questions.length}`);
  lines.push("");
  lines.push(q.text);

  return lines.join("\n");
}

export function assignmentTextAnswerHintMessage(params: {
  attempt: number;
  maxAttempts: number;
}) {
  const { attempt, maxAttempts } = params;

  if (attempt <= 1) return "✍️ Напиши ответ сообщением.";
  return `✍️ Попробуй ещё раз (${attempt}/${maxAttempts}).`;
}
