import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { BackendApiService } from "../../../infra/backend-api/backend-api.service.js";
import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "../../../infra/backend-api/backend-api.errors.js";

const inFlight = new Set<string>();

export function registerTeacherRequestRoutes(
  bot: Bot<BotContext>,
  backend: BackendApiService,
) {
  bot.callbackQuery(/^(invite_accept|invite_decline):\d+$/, async (ctx) => {
    const m = /^(invite_accept|invite_decline):(\d+)$/.exec(
      ctx.callbackQuery.data,
    );
    if (!m) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    const action = m[1];
    const inviteId = Number(m[2]);

    const telegramId = ctx.from?.id;
    if (!telegramId || !Number.isFinite(inviteId)) {
      await ctx
        .answerCallbackQuery({ text: "Не удалось определить пользователя" })
        .catch(() => {});
      return;
    }

    const key = `${telegramId}:${inviteId}`;
    if (inFlight.has(key)) {
      await ctx.answerCallbackQuery({ text: "Минутку…" }).catch(() => {});
      return;
    }

    inFlight.add(key);
    try {
      await backend.respondToTeacherRequestFromTelegram({
        inviteId,
        telegramId,
        accept: action === "invite_accept",
      });

      await ctx
        .answerCallbackQuery({
          text: action === "invite_accept" ? "Принято ✅" : "Отклонено",
        })
        .catch(() => {});

      await ctx.editMessageReplyMarkup().catch(() => {});

      await ctx.reply(
        action === "invite_accept"
          ? "✅ Ты принял(а) запрос. Теперь преподаватель сможет назначать тебе задания."
          : "Ок, запрос отклонён.",
      );
    } catch (e: unknown) {
      if (e instanceof InviteAlreadyProcessedError) {
        await ctx
          .answerCallbackQuery({ text: "Этот запрос уже обработан ✅" })
          .catch(() => {});
        await ctx.editMessageReplyMarkup().catch(() => {});
        return;
      }
      if (e instanceof InviteNotFoundError) {
        await ctx
          .answerCallbackQuery({ text: "Запрос не найден 😕" })
          .catch(() => {});
        await ctx.editMessageReplyMarkup().catch(() => {});
        return;
      }

      const msg = e instanceof Error ? e.message : String(e);
      await ctx.answerCallbackQuery({ text: "Ошибка 😕" }).catch(() => {});
      await ctx.reply(`⚠️ Не получилось обработать запрос.\nПричина: ${msg}`);
    } finally {
      inFlight.delete(key);
    }
  });
}
