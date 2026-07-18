import type { Translator } from "../helpers/copy.js";
import { uiMessage } from "../helpers/ui.js";
import { escapeHtml } from "../helpers/html.js";

export function startNeedRegMessage(t: Translator, firstName: string) {
  return uiMessage([
    t("start-need-reg-title", { firstName: escapeHtml(firstName) }),
    "",
    t("start-need-reg-text"),
    "",
    t("start-need-reg-hint"),
  ]);
}

export function startRegisteredNoTeacherMessage(t: Translator) {
  return uiMessage([
    t("start-no-teacher-title"),
    "",
    t("start-no-teacher-text"),
    "",
    t("start-no-teacher-hint"),
  ]);
}

export function startActiveStudentMessage(t: Translator, firstName: string) {
  return uiMessage([
    t("start-active-title", { firstName: escapeHtml(firstName) }),
    "",
    t("start-active-text"),
  ]);
}
