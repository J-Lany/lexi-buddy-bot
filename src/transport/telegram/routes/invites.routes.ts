import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { InvitesService } from "../../../domain/invites/invites.service.js";
import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "../../../domain/invites/invites.errors.js";

import { ack } from "../helpers/ack.js";
import { safeEditCallbackMessage } from "../helpers/edit-screen/safe-edit-callback-message.js";
import { escapeHtml } from "../ui/helpers/html.js";
import { env } from "../../../config/env.js";
import { sendMediaOrFallback } from "../helpers/media/send-media-or-fallback.js";

const inFlight = new Set<string>();

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
      await ack(ctx, ctx.t("invite-err-cannot-identify"));
      return;
    }

    const key = `${telegramId}:${inviteId}`;
    if (inFlight.has(key)) {
      await ack(ctx, ctx.t("invite-in-flight"));
      return;
    }

    inFlight.add(key);
    await ack(ctx);

    try {
      await invites.respond({ inviteId, telegramId, accept });

      if (accept) {
        const text = ctx.t("invite-accepted");
        const options = {
          reply_markup: { inline_keyboard: [] },
          parse_mode: "HTML" as const,
        };

        await sendMediaOrFallback({
          api: ctx.api,
          chatId: ctx.chat!.id,
          fileId: env.studentMedia.teacherRequestAcceptedGifFileId,
          kind: "animation",
          caption: text,
          options,
          previousMessageId: ctx.callbackQuery?.message?.message_id,
          fallback: () => safeEditCallbackMessage(ctx, text, options),
          event: "student_teacher_request_accepted",
        });
      } else {
        await safeEditCallbackMessage(ctx, ctx.t("invite-declined"), {
          reply_markup: { inline_keyboard: [] },
          parse_mode: "HTML",
        });
      }
    } catch (e: unknown) {
      if (e instanceof InviteAlreadyProcessedError) {
        await safeEditCallbackMessage(
          ctx,
          ctx.t("invite-err-already-processed"),
          {
            reply_markup: { inline_keyboard: [] },
            parse_mode: "HTML",
          },
        );
        return;
      }

      if (e instanceof InviteNotFoundError) {
        await safeEditCallbackMessage(ctx, ctx.t("invite-err-not-found"), {
          reply_markup: { inline_keyboard: [] },
          parse_mode: "HTML",
        });
        return;
      }

      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(
        `${ctx.t("invite-err-process-failed")}\n${ctx.t("invite-err-reason-prefix")} ${escapeHtml(msg)}`,
        { parse_mode: "HTML" },
      );
    } finally {
      inFlight.delete(key);
    }
  });
}
