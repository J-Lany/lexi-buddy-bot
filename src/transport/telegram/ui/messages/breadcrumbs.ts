import type { NavScreen } from "../../session.js";
import { copy } from "../helpers/copy.js";

export type BreadcrumbMeta = {
  lessonTitle?: string | null;
  assignmentType?: string | null;
};

type Crumb = { title: string };

function joinCrumbs(crumbs: Crumb[]) {
  return `<i>${crumbs.map((c) => c.title).join("  ›  ")}</i>`;
}

export function breadcrumb(
  screen: NavScreen,
  meta: BreadcrumbMeta = {},
): string {
  const home: Crumb = { title: copy.ui.common.text.menu };

  if (screen.name === "home") return joinCrumbs([home]);

  if (screen.name === "lessons_list")
    return joinCrumbs([home, { title: copy.ui.common.text.lessons }]);

  if (screen.name === "lesson") {
    const lessonTitle = meta.lessonTitle?.trim() || copy.ui.common.text.lessons;

    return joinCrumbs([
      home,
      { title: copy.ui.common.text.lessons },
      { title: lessonTitle },
    ]);
  }

  if (screen.name === "assignment_intro") {
    const lessonTitle = meta.lessonTitle?.trim() || copy.ui.common.text.lessons;

    const assignmentTitle =
      meta.assignmentType?.trim() || copy.ui.common.text.assignment;

    return joinCrumbs([
      home,
      { title: copy.ui.common.text.lessons },
      { title: lessonTitle },
      { title: assignmentTitle },
    ]);
  }

  if (screen.name === "help")
    return joinCrumbs([home, { title: copy.ui.common.text.help }]);

  return joinCrumbs([home]);
}

export function withBreadcrumb(
  screen: NavScreen,
  body: string,
  meta: BreadcrumbMeta = {},
) {
  return `${breadcrumb(screen, meta)}\n\n${body}`;
}
