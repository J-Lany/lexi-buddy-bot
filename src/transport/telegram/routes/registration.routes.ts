import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";
import type { RegistrationDraft } from "../../../domain/registration/registration.types.js";

import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { ack } from "../helpers/ack.js";
import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import { setRequestUserId } from "../../../observability/request-context.js";
import { escapeHtml } from "../ui/helpers/html.js";

function buildDraftFromContext(ctx: BotContext): RegistrationDraft | null {
  const from = ctx.from;
  if (!from) return null;

  return {
    telegramId: from.id,
    username: from.username ?? null,
    firstName: from.first_name,
    lastName: from.last_name ?? null,
  };
}

export function registerRegistrationRoutes(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("cancel", async (ctx) => {
    beginNewScreen(ctx);

    delete ctx.session.reg;
    ctx.session.userId = null;
    setRequestUserId(null);

    await safeEditScreen(ctx, ctx.t("reg-cancel-ok"));
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.session.reg) return next();

    beginNewScreen(ctx);

    await safeEditScreen(ctx, ctx.t("reg-in-progress"), {
      reply_markup: startRegistrationKeyboard(ctx.t),
    });
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    await ack(ctx);

    const draft = ctx.session.reg?.draft ?? buildDraftFromContext(ctx);
    if (!draft) {
      await safeEditScreen(ctx, ctx.t("reg-restore-failed"));
      return;
    }

    try {
      await withLoadingScreen(ctx, () => regService.register(draft));

      const user = await regService.findByTelegramId(draft.telegramId);
      ctx.session.userId = user?.id ?? null;
      setRequestUserId(user?.id ?? null);

      delete ctx.session.reg;

      await safeEditScreen(ctx, ctx.t("reg-success"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);

      await safeEditScreen(ctx, ctx.t("reg-failed"));

      await ctx.reply(
        `${ctx.t("reg-reason-prefix")} ${escapeHtml(msg)}\n\n${ctx.t("reg-try-again")}`,
        { parse_mode: "HTML" },
      );
    }
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;
    ctx.session.userId = null;
    setRequestUserId(null);

    await ctx
      .answerCallbackQuery({ text: ctx.t("reg-callback-ok") })
      .catch(() => {});

    await safeEditScreen(ctx, ctx.t("reg-cancel-short"));
  });
}
