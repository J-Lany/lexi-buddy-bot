import { Keyboard } from "grammy";

export function mainMenuKeyboard() {
  return new Keyboard()
    .text("📖 Мои уроки")
    .text("👤 Профиль")
    .resized()
    .persistent();
}
