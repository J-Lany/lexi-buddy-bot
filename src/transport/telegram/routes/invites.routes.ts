import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { InvitesService } from "../../../domain/invites/invites.service.js";
import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "../../../domain/invites/invites.errors.js";

import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { ack } from "../helpers/ack.js";

const inFlight = new Set<string>();

function successText(accepted: boolean) {
  return accepted
    ? "✅ Ты принял(а) запрос.\nТеперь преподаватель сможет назначать тебе задания."
    : "Ок, запрос отклонён.";
}

export function registerInvitesRoutes(
  bot: Bot<BotContext>,
  invites: InvitesService,
) {
  bot.callbackQuery(/^(invite_accept|invite_decline):\d+$/, async (ctx) => {
    const m = /^(invite_accept|invite_decline):(\d+)$/.exec(
      ctx.callbackQuery.data,
    );
    if (!m) {
      await ack(ctx);
      return;
    }

    const action = m[1];
    const inviteId = Number(m[2]);
    const accept = action === "invite_accept";

    const telegramId = ctx.from?.id;
    if (!telegramId || !Number.isFinite(inviteId)) {
      await ack(ctx, "Не удалось определить пользователя");
      return;
    }

    const key = `${telegramId}:${inviteId}`;
    if (inFlight.has(key)) {
      await ctx.answerCallbackQuery({ text: "Минутку…" }).catch(() => {});
      return;
    }

    inFlight.add(key);
    try {
      await withLoadingScreen(ctx, () =>
        invites.respond({ inviteId, telegramId, accept }),
      );

      await safeEditScreen(ctx, successText(accept), {
        reply_markup: undefined,
      });
    } catch (e: unknown) {
      if (e instanceof InviteAlreadyProcessedError) {
        await safeEditScreen(ctx, "✅ Этот запрос уже обработан.", {
          reply_markup: undefined,
        });
        return;
      }

      if (e instanceof InviteNotFoundError) {
        await safeEditScreen(ctx, "😕 Запрос не найден.", {
          reply_markup: undefined,
        });
        return;
      }

      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(`⚠️ Не получилось обработать запрос.\nПричина: ${msg}`);
    } finally {
      inFlight.delete(key);
    }
  });
}
