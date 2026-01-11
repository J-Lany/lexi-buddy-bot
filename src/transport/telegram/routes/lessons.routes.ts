import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import { lessonsListKeyboard } from "../ui/keyboards/lessons.keyboard.js";
import { lessonsHeader } from "../ui/messages/lessons.messages.js";
import { mainMenuKeyboard } from "../ui/keyboards/main.keyboard.js";

export function registerLessonsRoutes(
  bot: Bot<BotContext>,
  lessons: LessonsService,
) {
  bot.hears("📖 Мои уроки", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const items = await lessons.listForStudent(telegramId);

    if (items.length === 0) {
      await ctx.reply(lessonsHeader(0), { reply_markup: mainMenuKeyboard() });
      return;
    }

    await ctx.reply(lessonsHeader(items.length), {
      reply_markup: lessonsListKeyboard(items),
    });
  });

  // Открыть урок (пока заглушка)
  bot.callbackQuery(/^lesson_open:\d+$/, async (ctx) => {
    const m = /^lesson_open:(\d+)$/.exec(ctx.callbackQuery.data);
    if (!m) {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }

    const lessonId = Number(m[1]);
    await ctx.answerCallbackQuery().catch(() => {});
    // Здесь позже сделаем “хаб урока”: Задания / Слова
    await ctx.reply(
      `📘 Урок под айди #${lessonId}\n\n(скоро тут будут задания и слова)`,
      {
        reply_markup: mainMenuKeyboard(),
      },
    );
  });
}
