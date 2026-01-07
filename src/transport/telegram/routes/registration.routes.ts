import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";

export function registerRegistrationRoutes(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const telegramId = from.id;
    const registered = await regService.isRegistered(telegramId);

    if (registered) {
      delete ctx.session.reg;
      await ctx.reply(
        `✅ Ты уже зарегистрирован(а), ${from.first_name}.\n` +
          `Преподаватель сможет назначать тебе уроки прямо здесь 🙂`,
      );
      return;
    }

    ctx.session.reg = {
      draft: {
        telegramId,
        username: from.username ?? null,
        firstName: from.first_name,
        lastName: from.last_name ?? null,
      },
    };

    await ctx.reply(
      `Привет, ${from.first_name}! 👋\n\n` +
        `Этот бот нужен, чтобы преподаватель мог:\n` +
        `• найти тебя в системе\n` +
        `• назначать уроки\n` +
        `• отправлять задания прямо сюда\n\n` +
        `Никаких настроек сейчас не нужно —\n` +
        `просто нажми кнопку ниже 👇`,
      { reply_markup: startRegistrationKeyboard() },
    );
  });

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
}
