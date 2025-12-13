import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import {
  ageGroupKeyboard,
  startRegistrationKeyboard,
} from "../ui/keyboards/registration.keyboard.js";

import { isAgeGroup } from "../../../domain/registration/registration.types.js";

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
        `✅ Ты уже зарегистрирован(а), ${from.first_name}.\nЖди запрос от преподавателя 🙂`,
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
        `Я помогу тебе получать задания от преподавателя английского прямо здесь.\n\n` +
        `Регистрация займёт меньше минуты.`,
      { reply_markup: startRegistrationKeyboard() },
    );
  });

  bot.command("cancel", async (ctx) => {
    delete ctx.session.reg;
    await ctx.reply("Ок, отменил. Напиши /start чтобы начать заново.");
  });

  bot.on("message:text", async (ctx) => {
    if (!ctx.session.reg) return;

    await ctx.reply(
      "📝 Ты в процессе регистрации.\nПожалуйста, используй кнопки 👇\n\n/cancel — отменить",
    );
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;
    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.editMessageReplyMarkup().catch(() => {});
    await ctx.reply(
      "Ок, регистрацию отменили. Напиши /start если передумаешь 🙂",
    );
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    if (!ctx.session.reg) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.editMessageReplyMarkup().catch(() => {});

    await ctx.reply("Выбери возрастную группу:", {
      reply_markup: ageGroupKeyboard(),
    });
  });

  bot.callbackQuery(/^reg_age:/, async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    const ageGroupRaw = ctx.callbackQuery.data.split(":")[1];
    if (!ageGroupRaw || !isAgeGroup(ageGroupRaw)) {
      await ctx
        .answerCallbackQuery({ text: "Некорректный выбор 😅" })
        .catch(() => {});
      return;
    }

    reg.draft.ageGroup = ageGroupRaw;

    try {
      await regService.register(reg.draft);
      delete ctx.session.reg;

      await ctx.answerCallbackQuery().catch(() => {});
      await ctx.editMessageReplyMarkup().catch(() => {});

      await ctx.reply(
        "✅ Готово! Ты зарегистрирован(а).\n\nТеперь преподаватель сможет отправить тебе запрос 🙂",
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.reply(
        `⚠️ Не получилось зарегистрироваться.\nПричина: ${msg}\n\n/start — попробовать снова`,
      );
    }
  });
}
