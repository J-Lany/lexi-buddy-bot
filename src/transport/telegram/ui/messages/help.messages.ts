import type { Translator } from "../helpers/copy.js";
import { uiMessage } from "../helpers/ui.js";

export function helpMessage(t: Translator) {
  return uiMessage([
    t("help-title"),
    "",
    t("help-section"),
    t("help-commands"),
    "",
    t("help-hint"),
  ]);
}
