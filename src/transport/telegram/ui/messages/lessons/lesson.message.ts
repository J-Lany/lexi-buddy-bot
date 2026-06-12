import type { LessonAssignmentListItem } from "../../../../../domain/lessons/lessons.types.js";
import { isAssignmentDone } from "../../../../../domain/student-assignments/student-assignment-status.js";
import { uiMessage, uiMeta, uiTitle } from "../../helpers/ui.js";
import { escapeHtml } from "../../helpers/html.js";
import type { Translator } from "../../helpers/copy.js";

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function materialsBlock(t: Translator, links: string[]): string | null {
  if (links.length === 0) return null;

  const hosts = links.map(hostname);
  const counts: Record<string, number> = {};
  for (const h of hosts) counts[h] = (counts[h] ?? 0) + 1;

  const seen: Record<string, number> = {};
  const items = links.map((url, i) => {
    const h = hosts[i]!;
    seen[h] = (seen[h] ?? 0) + 1;
    const label = (counts[h] ?? 0) > 1 ? `${h} · ${seen[h]}` : h;
    return `• <a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
  });

  return `${t("lesson-materials-label")}\n${items.join("\n")}`;
}

function lessonDetailsBlock(
  t: Translator,
  params: {
    additionalInstructions?: string | null | undefined;
    materialLinks?: string[];
  },
): string | null {
  const { additionalInstructions, materialLinks = [] } = params;

  const instructions = additionalInstructions?.trim()
    ? escapeHtml(additionalInstructions.trim())
    : null;

  const materials = materialsBlock(t, materialLinks);

  const sections = [instructions, materials].filter(Boolean);

  if (sections.length === 0) return null;

  return `<blockquote expandable>${sections.join("\n\n")}</blockquote>`;
}

export function lessonMessage(
  t: Translator,
  params: {
    lessonId: number;
    lessonTitle?: string | null;
    topic?: string | null;
    level?: string | null;
    additionalInstructions?: string | null;
    materialLinks?: string[];
    items: LessonAssignmentListItem[];
  },
) {
  const {
    lessonId,
    lessonTitle,
    topic,
    level,
    additionalInstructions,
    materialLinks = [],
    items,
  } = params;

  const title = lessonTitle?.trim() || `${t("nav-lessons")} #${lessonId}`;
  const meta = uiMeta([topic ?? null, level ?? null]);

  const details = lessonDetailsBlock(t, {
    additionalInstructions,
    materialLinks,
  });

  if (items.length === 0) {
    return uiMessage([
      uiTitle("📘", title),
      meta,
      details,
      "",
      t("lesson-empty"),
      "",
      t("lesson-empty-hint"),
    ]);
  }

  const done = items.filter((x) => isAssignmentDone(x.status)).length;

  return uiMessage([
    uiTitle("📘", title),
    meta,
    details,
    "",
    t("progress", { done, total: items.length }),
    "",
    t("lesson-choose"),
  ]);
}
