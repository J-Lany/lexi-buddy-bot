import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { teacherRequestKeyboard } from "../ui/keyboards/teacher-request.keyboard.js";
import { uiMessage } from "../ui/helpers/ui.js";
import { escapeHtml } from "../ui/helpers/html.js";
import { copy } from "../ui/helpers/copy.js";

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
        : copy.ui.notifications.teacherRequest.teacherFallbackName;

    const teacherNameHtml = escapeHtml(teacherLabel);

    const text = uiMessage([
      copy.ui.common.title("👩‍🏫", copy.ui.notifications.teacherRequest.title),
      "",
      copy.ui.notifications.teacherRequest.body(teacherNameHtml),
      payload.message?.trim()
        ? `\n${copy.ui.notifications.teacherRequest.messagePrefix} ${escapeHtml(
            payload.message.trim(),
          )}`
        : null,
      "",
      copy.ui.common.hint(copy.ui.notifications.teacherRequest.hint),
    ]);

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: teacherRequestKeyboard(payload.inviteId),
      parse_mode: "HTML",
    });
  }
}
