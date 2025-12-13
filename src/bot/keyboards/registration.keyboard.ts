import { InlineKeyboard } from "grammy";

export function startRegistrationKeyboard() {
  return new InlineKeyboard()
    .text("📝 Зарегистрироваться", "reg_begin")
    .row()
    .text("❌ Не сейчас", "reg_cancel");
}

export function ageGroupKeyboard() {
  return new InlineKeyboard()
    .text("до 18", "reg_age:UNDER_18")
    .row()
    .text("18–35", "reg_age:BETWEEN_18_35")
    .row()
    .text("35+", "reg_age:OVER_35");
}
