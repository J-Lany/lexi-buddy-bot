import type { InternalAssignmentDto } from "../../../../../infra/backend-api/backend-api.types.js";
import { uiMessage, uiMeta } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";
import { escapeHtml } from "../../helpers/html.js";

function howToAnswerText(a: InternalAssignmentDto): string {
  const types = new Set(a.questions.map((q) => q.questionType));
  const hasChoice = types.has("multiple_choice");
  const hasText = types.has("gap_fill") || types.has("open_text");

  if (hasChoice && hasText) return copy.ui.assignment.intro.howToAnswer.mixed;
  if (hasChoice) return copy.ui.assignment.intro.howToAnswer.choice;
  if (hasText) return copy.ui.assignment.intro.howToAnswer.text;
  return copy.ui.assignment.intro.howToAnswer.fallback;
}

function vocabBlock(a: InternalAssignmentDto): string | null {
  const items = (a.vocab ?? []).filter((x) => x.term?.trim());
  if (items.length === 0) return null;

  const lines = items.map((x) => {
    const term = escapeHtml(x.term.trim());

    const tr = x.translation?.trim()
      ? ` — ${escapeHtml(x.translation.trim())}`
      : "";

    const syn = x.synonyms?.length
      ? `\n<i>Синонимы:</i> ${escapeHtml(x.synonyms.join(", "))}`
      : "";

    return `• <b>${term}</b>${tr}${syn}`;
  });

  const content = lines.join("\n\n");
  return [
    copy.ui.common.section("Словарь"),
    `<blockquote expandable>\n${content}\n</blockquote>`,
  ].join("\n");
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
  const vocab = vocabBlock(a);

  return uiMessage([
    meta,
    "",
    copy.ui.common.title("📝", title),
    "",
    vocab ? `${vocab}\n` : null,
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
