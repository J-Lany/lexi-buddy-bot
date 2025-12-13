import type { Bot } from "grammy";
import { teacherRequestKeyboard } from "../../transport/telegram/ui/keyboards/teacher-request.keyboard.js";
import type { BotContext } from "../../transport/telegram/context.js";

export type TeacherRequestNotification = {
  telegramId: number;
  inviteId: number;
  teacherName?: string | null;
  message?: string | null;
};

export class TeacherRequestNotificationService {
  constructor(private readonly bot: Bot<BotContext>) {}

  async send(payload: TeacherRequestNotification) {
    const chatId = payload.telegramId;

    const teacherLabel =
      payload.teacherName && payload.teacherName.trim()
        ? payload.teacherName
        : "Преподаватель";

    const text =
      `👩‍🏫 ${teacherLabel} хочет добавить тебя как студента.` +
      (payload.message ? `\n\n💬 ${payload.message}` : "") +
      `\n\nПринять запрос?`;

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: teacherRequestKeyboard(payload.inviteId),
    });
  }
}
