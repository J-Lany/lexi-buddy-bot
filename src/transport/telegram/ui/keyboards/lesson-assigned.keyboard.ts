import { InlineKeyboard } from "grammy";
import type { Translator } from "../helpers/copy.js";

export function lessonAssignedKeyboard(t: Translator, lessonId: number) {
  return new InlineKeyboard()
    .text(t("kb-open-lesson"), `notification_open_lesson:${lessonId}`)
    .row()
    .text(t("kb-my-lessons"), "notification_open_lessons");
}
