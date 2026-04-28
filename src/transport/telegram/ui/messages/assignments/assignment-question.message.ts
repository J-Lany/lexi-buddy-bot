import type {
  InternalAssignmentDto,
  InternalAssignmentQuestionDto,
} from "../../../../../infra/backend-api/backend-api.types.js";
import { choiceEmoji } from "../../../helpers/choice-emoji.js";
import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import { isChoiceQuestion } from "../../../../../domain/assignment-run/question.type.js";
import type { Translator } from "../../helpers/copy.js";

export function assignmentQuestionMessage(
  t: Translator,
  params: {
    a: InternalAssignmentDto;
    q: InternalAssignmentQuestionDto;
    index: number;
  },
) {
  const { a, q, index } = params;

  const header = t("question-header", {
    index: index + 1,
    total: a.questions.length,
  });
  const text = escapeHtml(q.text);

  const answers =
    isChoiceQuestion(q.questionType) && q.answers?.length
      ? [
          "",
          ...q.answers.map(
            (ans, i) => `${choiceEmoji(i)} ${escapeHtml(ans.text)}`,
          ),
        ]
      : [];

  return uiMessage([header, "", text, ...answers]);
}

export function assignmentTextAnswerHintMessage(
  t: Translator,
  params: {
    attempt: number;
    maxAttempts: number;
  },
) {
  const { attempt, maxAttempts } = params;

  if (attempt <= 1) return t("question-text-hint-first");
  return t("question-text-hint-retry", { attempt, max: maxAttempts });
}
