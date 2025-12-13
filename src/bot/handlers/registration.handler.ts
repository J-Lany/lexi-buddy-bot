import type { Bot } from "grammy";
import {
  ageGroupKeyboard,
  startRegistrationKeyboard,
} from "../keyboards/registration.keyboard.js";
import { RegistrationStep } from "../../domain/registration/registration.types.js";
import type { RegistrationService } from "../../domain/registration/registration.service.js";
import { BotContext } from "../context.js";

export function registerRegistrationHandlers(
  bot: Bot<BotContext>,
  regService: RegistrationService,
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    const telegramId = from.id;
    const registered = await regService.isRegistered(telegramId);

    if (registered) {
      ctx.session.reg = undefined;
      await ctx.reply(
        `✅ Ты уже зарегистрирован(а), ${from.first_name}.\nЖди запрос от преподавателя 🙂`,
      );
      return;
    }

    ctx.session.reg = {
      step: RegistrationStep.ASK_AGE_GROUP,
      draft: {
        telegramId,
        username: from.username ?? null,
        firstName: from.first_name,
        lastName: from.last_name ?? null,
      },
    };

    await ctx.reply(
      `Привет, ${from.first_name}! 👋\n\n` +
        `Я помогу тебе получать задания от преподавателя английского прямо здесь, в Telegram.\n\n` +
        `Регистрация займёт меньше минуты.`,
      { reply_markup: startRegistrationKeyboard() },
    );
  });

  bot.command("cancel", async (ctx) => {
    ctx.session.reg = undefined;
    await ctx.reply("Ок, отменил. Напиши /start чтобы начать заново.");
  });

  bot.on("message:text", async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) return;

    await ctx.reply(
      "📝 Ты в процессе регистрации.\nПожалуйста, заверши её кнопками 👇\n\nМожно отменить: /cancel",
    );
  });

  bot.on("callback_query:data", async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg) return;

    const data: string = ctx.callbackQuery.data;

    if (data === "reg_cancel") {
      ctx.session.reg = undefined;
      await ctx.answerCallbackQuery();
      await ctx.editMessageReplyMarkup({ reply_markup: undefined });
      await ctx.reply(
        "Ок, регистрацию отменили. Напиши /start если передумаешь 🙂",
      );
      return;
    }

    if (data === "reg_begin") {
      await ctx.answerCallbackQuery();
      await ctx.editMessageReplyMarkup({ reply_markup: undefined });

      await ctx.reply("Выбери возрастную группу:", {
        reply_markup: ageGroupKeyboard(),
      });
      return;
    }

    if (data.startsWith("reg_age:")) {
      const ageGroup = data.split(":")[1];
      reg.draft.ageGroup = ageGroup;

      await ctx.answerCallbackQuery();
      await ctx.editMessageReplyMarkup({ reply_markup: undefined });

      try {
        await regService.register(reg.draft);
        ctx.session.reg = undefined;

        await ctx.reply(
          "✅ Готово! Ты зарегистрирован(а).\n\n" +
            "Теперь преподаватель сможет отправить тебе запрос, и ты начнёшь получать задания сюда 🙂",
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        await ctx.reply(
          `⚠️ Не получилось зарегистрироваться.\n\nПричина: ${msg}\n\nПопробуй /start заново или /cancel.`,
        );
      }
      return;
    }

    await ctx.answerCallbackQuery();
  });
}
