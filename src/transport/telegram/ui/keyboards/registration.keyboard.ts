import { InlineKeyboard } from "grammy";
import { copy } from "../helpers/copy.js";

export function startRegistrationKeyboard() {
  return new InlineKeyboard()
    .text(copy.kb.reg.join, "reg_begin")
    .row()
    .text(copy.kb.reg.notNow, "reg_cancel");
}
