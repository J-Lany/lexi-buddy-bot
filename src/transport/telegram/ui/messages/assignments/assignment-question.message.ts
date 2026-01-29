import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../../helpers/choice-emoji.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function assignmentQuestionMessage(params: {
  a: InternalAssignmentDto;
  q: InternalAssignmentQuestionDto;
  index: number;
}) {
  const { a, q, index } = params;

  const header = copy.ui.assignment.question.header(
    index + 1,
    a.questions.length,
  );
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

  if (attempt <= 1) return copy.ui.assignment.question.textHintFirst;
  return copy.ui.assignment.question.textHintRetry(attempt, maxAttempts);
}
