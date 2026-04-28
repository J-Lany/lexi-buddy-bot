import { InlineKeyboard } from "grammy";
import type { Translator } from "../helpers/copy.js";

export function mainInlineKeyboard(t: Translator) {
  return new InlineKeyboard()
    .text(t("kb-my-lessons"), "nav:lessons")
    .row()
    .text(t("kb-help"), "nav:help")
    .row()
    .text(t("kb-lang"), "nav:language");
}
