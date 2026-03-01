import { InlineKeyboard } from "grammy";
import { copy } from "../helpers/copy.js";

export function lessonAssignedKeyboard(lessonId: number) {
  return new InlineKeyboard()
    .text(copy.kb.nav.openLesson, `lesson_open:${lessonId}`)
    .row()
    .text(copy.kb.main.lessons, "nav:lessons");
}
