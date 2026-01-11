import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";

export function registerRegistrationRoutes(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("cancel", async (ctx) => {
    delete ctx.session.reg;
    await ctx.reply("Ок, отменили. Напиши /start если захочешь снова 🙂");
  });

  bot.on("message:text", async (ctx) => {
    if (!ctx.session.reg) return;

    await ctx.reply(
      "Ты в процессе подключения 🙂\n" +
        "Пожалуйста, нажми кнопку ниже или /cancel — чтобы отменить.",
    );
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    try {
      await regService.register(reg.draft);
      delete ctx.session.reg;

      await ctx.answerCallbackQuery().catch(() => {});
      await ctx.editMessageReplyMarkup().catch(() => {});

      await ctx.reply(
        "✅ Готово!\n\n" +
          "Теперь преподаватель сможет найти тебя и назначить уроки 🙂",
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(
        `⚠️ Не получилось подключиться.\n` +
          `Причина: ${msg}\n\n` +
          `/start — попробовать снова`,
      );
    }
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.editMessageReplyMarkup().catch(() => {});
    await ctx.reply("Ок 🙂 Если передумаешь — напиши /start");
  });
}
