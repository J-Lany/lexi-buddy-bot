import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { uiMessage, uiSection } from "../ui/helpers/ui.js";
import { copy } from "../ui/helpers/copy.js";
import { lessonAssignedKeyboard } from "../ui/keyboards/lesson-assigned.keyboard.js";

export type LessonAssignedNotification = {
  telegramId: number;
  lessonId: number;
  lessonTitle: string;
  teacherName?: string | null;
};

export class LessonAssignedNotificationSender {
  constructor(private readonly bot: Bot<BotContext>) {}

  async send(payload: LessonAssignedNotification) {
    const chatId = payload.telegramId;

    const title = payload.lessonTitle?.trim() || `Урок`;

    const teacherLine = payload.teacherName?.trim()
      ? `От: ${uiSection(payload.teacherName.trim())}`
      : null;

    const text = uiMessage([
      copy.ui.home.greeting(),
      copy.ui.common.title("📘", copy.ui.lessons.lesson.newLesson),
      "",
      uiSection(title),
      teacherLine,
      "",
      copy.ui.common.hint(copy.ui.lessons.lesson.openLesson),
    ]);

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: lessonAssignedKeyboard(payload.lessonId),
      parse_mode: "HTML",
    });
  }
}
