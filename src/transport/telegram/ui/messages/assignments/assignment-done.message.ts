import { uiMessage, uiHint, uiTitle } from "../../helpers/ui.js";

export function assignmentDoneMessage(score: number | null) {
  const result =
    score === null
      ? "Ответы сохранены."
      : `Результат: <b>${Math.round(score * 100)}%</b>`;

  return uiMessage([
    uiTitle("✅", "Готово"),
    "",
    result,
    "",
    uiHint("Хочешь — разберём ответы по шагам."),
  ]);
}
