import { InlineKeyboard } from "grammy";
import { copy } from "../helpers/copy.js";

export function mainInlineKeyboard() {
  return new InlineKeyboard()
    .text(copy.kb.main.lessons, "nav:lessons")
    .row()
    .text(copy.kb.main.help, "nav:help");
}
