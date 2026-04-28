import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import { uiMessage, uiSection } from "../ui/helpers/ui.js";
import { escapeHtml } from "../ui/helpers/html.js";
import { i18n } from "../../../i18n/index.js";
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
    const t = (key: string, params?: Record<string, unknown>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      i18n.t("en", key, params as any);

    const title = payload.lessonTitle?.trim() || t("nav-lessons");

    const teacherLine = payload.teacherName?.trim()
      ? `${t("notif-teacher-fallback-name")}: ${uiSection(payload.teacherName.trim())}`
      : null;

    const text = uiMessage([
      t("notif-lesson-new"),
      "",
      uiSection(escapeHtml(title)),
      teacherLine,
      "",
      t("notif-lesson-open-hint"),
    ]);

    await this.bot.api.sendMessage(chatId, text, {
      reply_markup: lessonAssignedKeyboard(t, payload.lessonId),
      parse_mode: "HTML",
    });
  }
}
