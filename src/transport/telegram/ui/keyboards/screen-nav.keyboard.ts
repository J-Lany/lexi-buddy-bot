import { InlineKeyboard } from "grammy";

export function screenNavKeyboard() {
  return new InlineKeyboard()
    .text("⬅️ Назад", "nav:back")
    .text("🏠 Меню", "nav:home");
}
