import { InlineKeyboard } from "grammy";

export function mainInlineKeyboard() {
  return new InlineKeyboard()
    .text("📖 Мои уроки", "nav:lessons")
    .row()
    .text("👤 Профиль", "nav:profile")
    .row()
    .text("❓ Помощь", "nav:help");
}
