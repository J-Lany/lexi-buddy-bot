import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";

import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { ack } from "../helpers/ack.js";
import { copy } from "../ui/helpers/copy.js";

export function registerRegistrationRoutes(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("cancel", async (ctx) => {
    beginNewScreen(ctx);

    delete ctx.session.reg;
    await safeEditScreen(ctx, copy.ui.registration.cancelOk, {
      reply_markup: undefined,
    });
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.session.reg) return next();

    beginNewScreen(ctx);

    await safeEditScreen(ctx, copy.ui.registration.inProgress, {
      reply_markup: undefined,
    });
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) {
      await ack(ctx);
      return;
    }

    try {
      await withLoadingScreen(ctx, () => regService.register(reg.draft));
      delete ctx.session.reg;

      await safeEditScreen(ctx, copy.ui.registration.success, {
        reply_markup: undefined,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);

      await safeEditScreen(ctx, copy.ui.registration.failed, {
        reply_markup: undefined,
      });

      await ctx.reply(
        `${copy.ui.registration.reasonPrefix} ${msg}\n\n${copy.ui.registration.tryAgain}`,
        { parse_mode: "HTML" },
      );
    }
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;

    await ctx
      .answerCallbackQuery({ text: copy.ui.registration.callbackOk })
      .catch(() => {});

    await safeEditScreen(ctx, copy.ui.registration.cancelShort, {
      reply_markup: undefined,
    });
  });
}
