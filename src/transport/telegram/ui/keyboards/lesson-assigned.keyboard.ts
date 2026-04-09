import { InlineKeyboard } from "grammy";
import { copy } from "../helpers/copy.js";

export function lessonAssignedKeyboard(lessonId: number) {
  return new InlineKeyboard()
    .text(copy.kb.nav.openLesson, `notification_open_lesson:${lessonId}`)
    .row()
    .text(copy.kb.main.lessons, "notification_open_lessons");
}
