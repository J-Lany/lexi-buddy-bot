import type { BotContext } from "../../../context.js";

type Handler = (ctx: BotContext) => Promise<void> | void;
type TextHandler = (
  ctx: BotContext,
  next: () => Promise<void>,
) => Promise<void> | void;

/**
 * A minimal stand-in for grammY's Bot that just records the handlers passed
 * to callbackQuery/command/on("message:text",...), so route-registration
 * functions (which take a real `Bot<BotContext>`) can be exercised without a
 * network connection or a real bot token.
 */
export function createFakeBot() {
  const callbackHandlers = new Map<string, Handler>();
  const commandHandlers = new Map<string, Handler>();
  const textHandlers: TextHandler[] = [];

  const bot = {
    callbackQuery(trigger: string, handler: Handler) {
      callbackHandlers.set(trigger, handler);
      return bot;
    },
    command(name: string, handler: Handler) {
      commandHandlers.set(name, handler);
      return bot;
    },
    on(filter: string, handler: TextHandler) {
      if (filter === "message:text") textHandlers.push(handler);
      return bot;
    },
  };

  return { bot, callbackHandlers, commandHandlers, textHandlers };
}
