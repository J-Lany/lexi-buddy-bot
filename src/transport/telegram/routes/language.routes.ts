import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { RoutesDeps } from "./routes.deps.js";

import { ack } from "../helpers/ack.js";
import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import { goTo } from "../helpers/go-to.js";
import { uiMessage } from "../ui/helpers/ui.js";
import { languageKeyboard } from "../ui/keyboards/language.keyboard.js";
import { SUPPORTED_LOCALES } from "../../../i18n/index.js";
import { logInfo } from "../../../observability/logger.js";

export function registerLanguageRoutes(bot: Bot<BotContext>, deps: RoutesDeps) {
  bot.callbackQuery("nav:language", async (ctx) => {
    await ack(ctx);

    const currentLocale = await ctx.i18n.getLocale();
    const text = uiMessage([ctx.t("lang-title"), "", ctx.t("lang-choose")]);

    await safeEditScreen(ctx, text, {
      reply_markup: languageKeyboard(ctx.t, currentLocale),
      parse_mode: "HTML",
    });
  });

  bot.callbackQuery(/^lang_set:[a-z]+$/, async (ctx) => {
    const m = /^lang_set:([a-z]+)$/.exec(ctx.callbackQuery.data);
    if (!m) {
      await ack(ctx);
      return;
    }

    const locale = m[1]!;
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
      await ack(ctx);
      return;
    }

    await ctx.i18n.setLocale(locale);

    logInfo("locale_changed", { locale });

    await ack(ctx, ctx.t("lang-changed"));

    await goTo(ctx, deps, { name: "home" }, { navMode: "reset" });
  });
}
