import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { teacherRequestKeyboard } from "../ui/keyboards/teacher-request.keyboard.js";
import { uiHint, uiMessage, uiTitle } from "../ui/helpers/ui.js";
import { escapeHtml } from "../ui/helpers/html.js";

export type TeacherRequestNotification = {
  telegramId: number;
  inviteId: number;
  teacherName?: string | null;
  message?: string | null;
};

export class TeacherRequestNotificationSender {
  constructor(private readonly bot: Bot<BotContext>) {}

  async send(payload: TeacherRequestNotification) {
    const chatId = payload.telegramId;

    const teacherLabel =
      payload.teacherName && payload.teacherName.trim()
        ? payload.teacherName.trim()
        : "Преподаватель";

    const text = uiMessage([
      uiTitle("👩‍🏫", "Запрос от преподавателя"),
      "",
      `<b>${escapeHtml(teacherLabel)}</b> хочет добавить тебя как студента.`,
      payload.message?.trim()
        ? `\n💬 ${escapeHtml(payload.message.trim())}`
        : null,
      "",
      uiHint("Выбери действие кнопками ниже."),
    ]);

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: teacherRequestKeyboard(payload.inviteId),
      parse_mode: "HTML",
    });
  }
}
