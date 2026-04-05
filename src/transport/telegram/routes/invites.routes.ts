import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { InvitesService } from "../../../domain/invites/invites.service.js";
import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "../../../domain/invites/invites.errors.js";

import { ack } from "../helpers/ack.js";
import { copy } from "../ui/helpers/copy.js";
import { safeEditCallbackMessage } from "../helpers/edit-screen/safe-edit-callback-message.js";
import { escapeHtml } from "../ui/helpers/html.js";

const inFlight = new Set<string>();

function successText(accepted: boolean) {
  return accepted ? copy.ui.invites.accepted : copy.ui.invites.declined;
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
      await ack(ctx, copy.ui.invites.errors.cannotIdentifyUser);
      return;
    }

    const key = `${telegramId}:${inviteId}`;
    if (inFlight.has(key)) {
      await ack(ctx, copy.ui.invites.inFlight);
      return;
    }

    inFlight.add(key);
    await ack(ctx);

    try {
      await invites.respond({ inviteId, telegramId, accept });

      await safeEditCallbackMessage(ctx, successText(accept), {
        reply_markup: { inline_keyboard: [] },
        parse_mode: "HTML",
      });
    } catch (e: unknown) {
      if (e instanceof InviteAlreadyProcessedError) {
        await safeEditCallbackMessage(
          ctx,
          `✅ ${copy.ui.invites.errors.alreadyProcessed}`,
          {
            reply_markup: { inline_keyboard: [] },
            parse_mode: "HTML",
          },
        );
        return;
      }

      if (e instanceof InviteNotFoundError) {
        await safeEditCallbackMessage(
          ctx,
          `😕 ${copy.ui.invites.errors.notFound}`,
          {
            reply_markup: { inline_keyboard: [] },
            parse_mode: "HTML",
          },
        );
        return;
      }

      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(
        `${copy.ui.invites.errors.processFailed}\n${copy.ui.invites.errors.reasonPrefix} ${escapeHtml(msg)}`,
        { parse_mode: "HTML" },
      );
    } finally {
      inFlight.delete(key);
    }
  });
}
