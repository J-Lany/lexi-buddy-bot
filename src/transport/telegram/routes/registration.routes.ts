import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type { RegistrationService } from "../../../domain/registration/registration.service.js";
import type { RegistrationDraft } from "../../../domain/registration/registration.types.js";

import { safeEditScreen } from "../helpers/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { ack } from "../helpers/ack.js";
import { copy } from "../ui/helpers/copy.js";
import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import { setRequestUserId } from "../../../observability/request-context.js";

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

    await safeEditScreen(ctx, copy.ui.registration.cancelOk);
  });

  bot.on("message:text", async (ctx, next) => {
    if (!ctx.session.reg) return next();

    beginNewScreen(ctx);

    await safeEditScreen(ctx, copy.ui.registration.inProgress, {
      reply_markup: startRegistrationKeyboard(),
    });
  });

  bot.callbackQuery("reg_begin", async (ctx) => {
    await ack(ctx);

    const draft = ctx.session.reg?.draft ?? buildDraftFromContext(ctx);
    if (!draft) {
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось восстановить регистрацию. Нажми /start ещё раз.",
      );
      return;
    }

    try {
      await withLoadingScreen(ctx, () => regService.register(draft));

      const user = await regService.findByTelegramId(draft.telegramId);
      ctx.session.userId = user?.id ?? null;
      setRequestUserId(user?.id ?? null);

      delete ctx.session.reg;

      await safeEditScreen(ctx, copy.ui.registration.success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);

      await safeEditScreen(ctx, copy.ui.registration.failed);

      await ctx.reply(
        `${copy.ui.registration.reasonPrefix} ${msg}\n\n${copy.ui.registration.tryAgain}`,
        { parse_mode: "HTML" },
      );
    }
  });

  bot.callbackQuery("reg_cancel", async (ctx) => {
    delete ctx.session.reg;
    ctx.session.userId = null;
    setRequestUserId(null);

    await ctx
      .answerCallbackQuery({ text: copy.ui.registration.callbackOk })
      .catch(() => {});

    await safeEditScreen(ctx, copy.ui.registration.cancelShort);
  });
}
