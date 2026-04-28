import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { teacherRequestKeyboard } from "../ui/keyboards/teacher-request.keyboard.js";
import { uiMessage } from "../ui/helpers/ui.js";
import { escapeHtml } from "../ui/helpers/html.js";
import { i18n } from "../../../i18n/index.js";

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
    const t = (key: string, params?: Record<string, unknown>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      i18n.t("en", key, params as any);

    const teacherLabel =
      payload.teacherName && payload.teacherName.trim()
        ? payload.teacherName.trim()
        : t("notif-teacher-fallback-name");

    const teacherNameHtml = escapeHtml(teacherLabel);

    const text = uiMessage([
      t("notif-teacher-request-title"),
      "",
      t("notif-teacher-request-body", { teacherName: teacherNameHtml }),
      payload.message?.trim()
        ? `\n${t("notif-teacher-message-prefix")} ${escapeHtml(
            payload.message.trim(),
          )}`
        : null,
      "",
      t("notif-teacher-hint"),
    ]);

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: teacherRequestKeyboard(t, payload.inviteId),
      parse_mode: "HTML",
    });
  }
}
