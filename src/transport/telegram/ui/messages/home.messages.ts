import type { Translator } from "../helpers/copy.js";
import { uiMessage } from "../helpers/ui.js";
import { escapeHtml } from "../helpers/html.js";

export function homeMessage(t: Translator, firstName?: string | null) {
  const name = firstName?.trim();
  const greeting = name
    ? t("home-greeting-named", { name: escapeHtml(name) })
    : t("home-greeting");

  return uiMessage([
    t("home-title"),
    "",
    greeting,
    t("home-question"),
    "",
    t("home-hint"),
  ]);
}
