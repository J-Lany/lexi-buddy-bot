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
  // Keyed by the exact trigger passed to bot.callbackQuery — a plain string
  // for exact-match triggers (most routes), or a RegExp for pattern triggers
  // (e.g. invites.routes.ts's `/^(invite_accept|invite_decline):\d+$/`).
  const callbackHandlers = new Map<string | RegExp, Handler>();
  const commandHandlers = new Map<string, Handler>();
  const textHandlers: TextHandler[] = [];
  // Keyed by every individual filter string a bot.on(...) call was
  // registered with (a single string, or each entry of an array) — lets
  // tests retrieve a handler registered via e.g.
  // bot.on(["message:animation", "message:video"], handler).
  const onHandlers = new Map<string, TextHandler[]>();

  const bot = {
    callbackQuery(trigger: string | RegExp, handler: Handler) {
      callbackHandlers.set(trigger, handler);
      return bot;
    },
    command(name: string, handler: Handler) {
      commandHandlers.set(name, handler);
      return bot;
    },
    on(filter: string | string[], handler: TextHandler) {
      const filters = Array.isArray(filter) ? filter : [filter];
      if (filters.includes("message:text")) textHandlers.push(handler);
      for (const f of filters) {
        const existing = onHandlers.get(f) ?? [];
        existing.push(handler);
        onHandlers.set(f, existing);
      }
      return bot;
    },
  };

  /** Mirrors grammY's own dispatch: finds the handler whose trigger (string
   * exact-match or RegExp) matches the given callback_query data. */
  function findCallbackHandler(data: string): Handler | undefined {
    for (const [trigger, handler] of callbackHandlers) {
      if (typeof trigger === "string" ? trigger === data : trigger.test(data)) {
        return handler;
      }
    }
    return undefined;
  }

  return {
    bot,
    callbackHandlers,
    commandHandlers,
    textHandlers,
    onHandlers,
    findCallbackHandler,
  };
}
