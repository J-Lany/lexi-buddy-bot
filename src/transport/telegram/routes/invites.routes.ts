import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { InvitesService } from "../../../domain/invites/invites.service.js";
import {
  InviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError,
  InviteNotFoundError,
} from "../../../domain/invites/invites.errors.js";

import { ack } from "../helpers/ack.js";
import { env } from "../../../config/env.js";
import { sendMediaOrFallback } from "../helpers/media/send-media-or-fallback.js";
import { logError } from "../../../observability/logger.js";

const inFlight = new Set<string>();

async function removeInviteKeyboard(ctx: BotContext, inviteId: number) {
  const chatId = ctx.chat?.id;
  const messageId = ctx.callbackQuery?.message?.message_id;
  if (!chatId || !messageId) return;

  try {
    await ctx.api.editMessageReplyMarkup(chatId, messageId, {
      reply_markup: { inline_keyboard: [] },
    });
  } catch (error) {
    logError("teacher_request_keyboard_cleanup_failed", error, {
      invite_id: inviteId,
      telegram_user_id: ctx.from?.id ?? null,
    });
  }
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
      try {
        await invites.respond({ inviteId, telegramId, accept });
      } catch (e: unknown) {
        if (e instanceof InviteAlreadyAcceptedError) {
          await removeInviteKeyboard(ctx, inviteId);
          await ctx.reply(ctx.t("invite-err-already-accepted"), {
            parse_mode: "HTML",
          });
          return;
        }

        if (e instanceof InviteAlreadyDeclinedError) {
          await removeInviteKeyboard(ctx, inviteId);
          await ctx.reply(ctx.t("invite-err-already-declined"), {
            parse_mode: "HTML",
          });
          return;
        }

        if (e instanceof InviteNotFoundError) {
          await ctx.reply(ctx.t("invite-err-not-found"), {
            parse_mode: "HTML",
          });
          return;
        }

        logError("teacher_request_response_failed", e, {
          invite_id: inviteId,
          telegram_user_id: telegramId,
          action: accept ? "accept" : "decline",
        });
        await ctx.reply(ctx.t("invite-err-process-failed"), {
          parse_mode: "HTML",
        });
        return;
      }

      // From this point the backend operation is committed. Presentation is
      // best-effort and must never be reported as a business-operation error.
      await removeInviteKeyboard(ctx, inviteId);
      try {
        if (accept) {
          const text = ctx.t("invite-accepted");
          const options = {
            parse_mode: "HTML" as const,
          };

          await sendMediaOrFallback({
            api: ctx.api,
            chatId: ctx.chat!.id,
            fileId: env.studentMedia.teacherRequestAcceptedGifFileId,
            kind: "animation",
            caption: text,
            options,
            fallback: async () => {
              await ctx.reply(text, options);
            },
            event: "student_teacher_request_accepted",
          });
        } else {
          await ctx.reply(ctx.t("invite-declined"), {
            parse_mode: "HTML",
          });
        }
      } catch (error) {
        logError("teacher_request_result_delivery_failed", error, {
          invite_id: inviteId,
          telegram_user_id: telegramId,
          action: accept ? "accept" : "decline",
        });
      }
    } finally {
      inFlight.delete(key);
    }
  });
}
