import type { Bot } from "grammy";
import type { BotContext } from "../context.js";

import type {
  RegisteredTelegramUser,
  RegistrationService,
} from "../../../domain/registration/registration.service.js";
import type { RegistrationDraft } from "../../../domain/registration/registration.types.js";
import { BOT_CONSENT_VERSION } from "../../../domain/registration/registration.types.js";

import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { withLoadingScreen } from "../helpers/with-loading.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { ack } from "../helpers/ack.js";
import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import {
  lookupRetryKeyboard,
  registrationConsentKeyboard,
} from "../ui/keyboards/consent.keyboard.js";
import { registrationConsentMessage } from "../ui/messages/registration-consent.message.js";
import { setRequestUserId } from "../../../observability/request-context.js";
import { logError } from "../../../observability/logger.js";
import { legalUrls } from "../../../config/legal-urls.js";

const LOOKUP_RETRY_ATTEMPTS = 3;
const LOOKUP_RETRY_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A small bounded retry for read-after-write lag on the backend. */
async function findUserWithRetry(
  regService: RegistrationService,
  telegramId: number,
  attempts = LOOKUP_RETRY_ATTEMPTS,
): Promise<RegisteredTelegramUser | null> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const user = await regService.findByTelegramId(telegramId);
    if (user) return user;
    if (attempt < attempts) await sleep(LOOKUP_RETRY_DELAY_MS);
  }
  return null;
}

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

async function showConsentScreen(ctx: BotContext) {
  await safeEditScreen(ctx, registrationConsentMessage(ctx.t), {
    reply_markup: registrationConsentKeyboard(ctx.t, legalUrls),
  });
}

async function showLookupPendingScreen(ctx: BotContext) {
  await safeEditScreen(ctx, ctx.t("reg-lookup-failed"), {
    reply_markup: lookupRetryKeyboard(ctx.t),
  });
}

async function showRegistrationFailedScreen(ctx: BotContext) {
  await safeEditScreen(ctx, ctx.t("reg-failed"), {
    reply_markup: registrationConsentKeyboard(ctx.t, legalUrls),
  });
}

async function completeRegistration(ctx: BotContext, userId: number) {
  ctx.session.userId = userId;
  setRequestUserId(userId);

  await safeEditScreen(ctx, ctx.t("reg-success"));
  delete ctx.session.reg;
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
    const reg = ctx.session.reg;

    if (reg?.processing) {
      await ack(ctx);
      return;
    }

    if (reg?.registrationCompleted) {
      await ack(ctx);
      await showLookupPendingScreen(ctx);
      return;
    }

    await ack(ctx);

    // Only reached for a normal pre-registration flow: no reg session yet,
    // or one that hasn't completed registration or started processing.
    const draft = reg?.draft ?? buildDraftFromContext(ctx);
    if (!draft) {
      await safeEditScreen(ctx, ctx.t("reg-restore-failed"));
      return;
    }

    ctx.session.reg = { draft };

    await showConsentScreen(ctx);
  });

  bot.callbackQuery("reg_consent_continue", async (ctx) => {
    // to buildDraftFromContext.
    const reg = ctx.session.reg;
    if (!reg) {
      await ack(ctx);
      await safeEditScreen(ctx, ctx.t("reg-restore-failed"));
      return;
    }

    // Guard against a double tap / two near-simultaneous callback deliveries
    // triggering two register requests. Must be set synchronously, before
    // any await, so a second invocation sharing the same session object sees
    // it immediately.
    if (reg.processing) {
      await ack(ctx);
      return;
    }
    reg.processing = true;

    await ack(ctx);

    try {
      if (!reg.registrationCompleted) {
        const consentedDraft = {
          ...reg.draft,
          consentAccepted: true as const,
          consentVersion: BOT_CONSENT_VERSION,
        };

        const result = await withLoadingScreen(ctx, () =>
          regService.register(consentedDraft),
        );

        // The register call itself did not throw — registration succeeded.
        // From here on this flow must never call it again, regardless of
        // what happens with resolving the user id below.
        reg.registrationCompleted = true;

        if (result) {
          await completeRegistration(ctx, result.id);
          return;
        }
        // Response didn't include a usable id — fall through to the lookup
        // fallback below, same as a retried Continue tap would.
      }

      const user = await findUserWithRetry(regService, reg.draft.telegramId);

      if (!user) {
        reg.processing = false;
        await showLookupPendingScreen(ctx);
        return;
      }

      await completeRegistration(ctx, user.id);
    } catch (e: unknown) {
      logError("registration_failed", e, {
        telegram_id: reg.draft.telegramId,
      });

      if (ctx.session.reg) ctx.session.reg.processing = false;

      if (ctx.session.reg?.registrationCompleted) {
        // Registration itself already succeeded; this failure is from the
        // lookup step. Never re-offer a path that re-registers.
        await showLookupPendingScreen(ctx);
        return;
      }

      // Never surface e.message to the user — it may contain backend/HTTP
      // internals. Draft is still intact, so show one message with the
      // retry button attached, so they can retry without needing /start
      // again.
      await showRegistrationFailedScreen(ctx);
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
