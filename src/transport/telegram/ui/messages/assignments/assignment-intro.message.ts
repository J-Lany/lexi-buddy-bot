import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import { uiMessage, uiMeta } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

function howToAnswerText(a: InternalAssignmentDto): string {
  const types = new Set(a.questions.map((q) => q.questionType));
  const hasChoice = types.has("multiple_choice");
  const hasText = types.has("gap_fill") || types.has("open_text");

  if (hasChoice && hasText) return copy.ui.assignment.intro.howToAnswer.mixed;
  if (hasChoice) return copy.ui.assignment.intro.howToAnswer.choice;
  if (hasText) return copy.ui.assignment.intro.howToAnswer.text;
  return copy.ui.assignment.intro.howToAnswer.fallback;
}

export function assignmentIntroMessage(a: InternalAssignmentDto) {
  const meta = uiMeta([
    a.lesson?.title ?? null,
    a.lesson?.topic ?? null,
    a.lesson?.level ?? null,
  ]);

  const typeKey = (a.type ?? "").trim();
  const typed = (copy.ui.assignment.intro.byType as Record<string, unknown>)[
    typeKey
  ] as
    | {
        title: string;
        body: string;
        exampleTitle: string;
        exampleBodyHtml: string;
        note?: string;
      }
    | undefined;

  const title = typed?.title ?? copy.ui.assignment.title;
  const body = typed?.body ?? "";
  const quoteTitle =
    typed?.exampleTitle ?? copy.ui.assignment.intro.fallbackExampleTitle;
  const quoteBody =
    typed?.exampleBodyHtml ?? copy.ui.assignment.intro.fallbackExampleBodyHtml;

  const howTo = howToAnswerText(a);

  return uiMessage([
    copy.ui.common.title("📝", title),
    meta,
    "",
    body ? body : null,
    "",
    copy.ui.common.labels.questionsCount(a.questions.length),

    !typed ? `Как отвечать: ${howTo}` : null,

    "",
    copy.ui.common.quote(quoteTitle, quoteBody),

    typed?.note ? `\n${copy.ui.common.hint(typed.note)}` : null,

    "",
    copy.ui.assignment.intro.ready,
  ]);
}
