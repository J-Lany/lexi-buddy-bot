import type { NavScreen } from "../../session.js";
import type { Translator } from "../helpers/copy.js";
import { escapeHtml } from "../helpers/html.js";

export type BreadcrumbMeta = {
  lessonTitle?: string | null;
  assignmentType?: string | null;
};

type Crumb = { title: string };

function joinCrumbs(crumbs: Crumb[]) {
  return `<i>${crumbs.map((c) => escapeHtml(c.title)).join("  ›  ")}</i>`;
}

export function breadcrumb(
  t: Translator,
  screen: NavScreen,
  meta: BreadcrumbMeta = {},
): string {
  const home: Crumb = { title: t("nav-home") };

  if (screen.name === "home") return joinCrumbs([home]);

  if (screen.name === "lessons_list")
    return joinCrumbs([home, { title: t("nav-lessons") }]);

  if (screen.name === "lesson") {
    const lessonTitle = meta.lessonTitle?.trim() || t("nav-lessons");
    return joinCrumbs([
      home,
      { title: t("nav-lessons") },
      { title: lessonTitle },
    ]);
  }

  if (screen.name === "assignment_intro") {
    const lessonTitle = meta.lessonTitle?.trim() || t("nav-lessons");
    const assignmentTitle = meta.assignmentType?.trim() || t("nav-assignment");
    return joinCrumbs([
      home,
      { title: t("nav-lessons") },
      { title: lessonTitle },
      { title: assignmentTitle },
    ]);
  }

  if (screen.name === "help")
    return joinCrumbs([home, { title: t("nav-help") }]);

  return joinCrumbs([home]);
}

export function withBreadcrumb(
  t: Translator,
  screen: NavScreen,
  body: string,
  meta: BreadcrumbMeta = {},
) {
  return `${breadcrumb(t, screen, meta)}\n\n${body}`;
}
