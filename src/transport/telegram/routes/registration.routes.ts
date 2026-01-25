import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";

import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";

export function registerRegistrationRoutes(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("cancel", async (ctx) => {
    beginNewScreen(ctx);

    delete ctx.session.reg;
    await safeEditScreen(
      ctx,
      "Ок, отменили. Напиши /start если захочешь снова 🙂",
      {
        reply_markup: undefined,
      },
    );
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.session.reg) return next();

    beginNewScreen(ctx);

    await safeEditScreen(
      ctx,
      "Ты в процессе подключения 🙂\nПожалуйста, нажми кнопку ниже или /cancel — чтобы отменить.",
      { reply_markup: undefined },
    );
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    try {
      await withLoadingScreen(ctx, () => regService.register(reg.draft));
      delete ctx.session.reg;

      await safeEditScreen(
        ctx,
        "✅ Готово!\n\nТеперь преподаватель сможет найти тебя и назначить уроки 🙂",
        { reply_markup: undefined },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);

      await safeEditScreen(ctx, "⚠️ Не получилось подключиться.", {
        reply_markup: undefined,
      });
      await ctx.reply(`Причина: ${msg}\n\n/start — попробовать снова`);
    }
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;

    await ctx.answerCallbackQuery({ text: "Ок" }).catch(() => {});

    await safeEditScreen(ctx, "Ок 🙂 Если передумаешь — напиши /start", {
      reply_markup: undefined,
    });
  });
}
