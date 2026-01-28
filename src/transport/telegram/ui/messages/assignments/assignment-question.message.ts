import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../../helpers/choice-emoji.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";

export function assignmentQuestionMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
}) {
  const { a, q, index } = params;

  const header = `<b>Вопрос ${index + 1}</b> <i>из ${a.questions.length}</i>`;
  const text = escapeHtml(q.text);

  const answers = q.answers?.length
    ? [
        "",
        ...q.answers.map(
          (ans, i) => `${choiceEmoji(i)} ${escapeHtml(ans.text)}`,
        ),
      ]
    : [];

  return uiMessage([header, "", text, ...answers]);
}

export function assignmentTextAnswerHintMessage(params: {
  attempt: number;
  maxAttempts: number;
}) {
  const { attempt, maxAttempts } = params;

  if (attempt <= 1) return "✍️ <b>Напиши ответ</b> сообщением.";
  return `✍️ Попробуй ещё раз <i>(${attempt}/${maxAttempts})</i>.`;
}
