import {
  uiList,
  uiMessage,
  uiSection,
  uiTitle,
  uiHint,
} from "../helpers/ui.js";

export function helpMessage() {
  return uiMessage([
    uiTitle("❓", "Помощь"),
    "",
    uiSection("Команды"),
    uiList([
      "/start — главное меню",
      "/lessons — мои уроки",
      "/profile — профиль",
      "/help — помощь",
    ]),
    "",
    uiHint("Кнопка Menu рядом с полем ввода — самый быстрый путь 🙂"),
  ]);
}
