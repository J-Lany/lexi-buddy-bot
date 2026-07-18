import { InlineKeyboard } from "grammy";
import type { Translator } from "../helpers/copy.js";

export function startRegistrationKeyboard(t: Translator) {
  return new InlineKeyboard()
    .text(t("kb-join"), "reg_begin")
    .row()
    .text(t("kb-not-now"), "reg_cancel");
}
