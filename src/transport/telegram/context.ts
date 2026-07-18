import type { Context } from "grammy";
import type { I18nFlavor } from "../../i18n/index.js";
import type { SessionData } from "./session.js";

export type BotContext = Context & I18nFlavor & { session: SessionData };
