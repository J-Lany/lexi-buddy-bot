import { InlineKeyboard } from "grammy";

export function startRegistrationKeyboard() {
  return new InlineKeyboard()
    .text("✨ Присоединиться", "reg_begin")
    .row()
    .text("❌ Не сейчас", "reg_cancel");
}
