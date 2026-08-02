import type { BotContext } from "../../context.js";
import type { InlineKeyboardMarkup } from "grammy/types";
import { getEditErrorKind } from "./get-edit-error-kind.js";
import { setTrackedScreenMessage } from "../screen-message-state.js";

type ScreenEditOptions = {
  reply_markup?: InlineKeyboardMarkup;
  parse_mode?: "HTML";
};

export async function safeEditScreen(
  ctx: BotContext,
  text: string,
  options: ScreenEditOptions = {},
) {
  const chatId = ctx.chat?.id;
  const screenMessageId = ctx.session.ui.screenMessageId;
  const kind = ctx.session.ui.screenMessageKind;

  // A media (animation/video-with-caption) tracked message can never be
  // edited via editMessageText — Telegram rejects it. Skip straight to the
  // replace path below instead of making a doomed API call.
  if (chatId && screenMessageId && kind !== "media") {
    try {
      await ctx.api.editMessageText(chatId, screenMessageId, text, {
        ...options,
        parse_mode: options.parse_mode ?? "HTML",
      });
      setTrackedScreenMessage(ctx, screenMessageId, "text");
      return;
    } catch (err) {
      const editErrorKind = getEditErrorKind(err);

      if (editErrorKind === "not_modified") {
        // editMessageText only reaches "not modified" for a message it could
        // otherwise have edited — safe to self-heal an unknown kind (legacy
        // session) to "text" so future calls skip straight to the edit path.
        if (kind === undefined) ctx.session.ui.screenMessageKind = "text";
        return;
      }
      if (editErrorKind !== "not_editable") throw err;
      // not_editable (including a legacy/unsynced session pointing at a
      // media message) — fall through to the replace path below.
    }
  }

  const previousMessageId = screenMessageId;

  const msg = await ctx.reply(text, {
    ...options,
    parse_mode: options.parse_mode ?? "HTML",
  });
  setTrackedScreenMessage(ctx, msg.message_id, "text");

  if (chatId && previousMessageId && previousMessageId !== msg.message_id) {
    await ctx.api.deleteMessage(chatId, previousMessageId).catch(() => {
      // best-effort cleanup only — a failed delete doesn't affect the
      // already-delivered replacement message and must not throw or retry
    });
  }
}
