import type { BotContext } from "../../../context.js";
import type { SessionData } from "../../../session.js";

export type EditMessageTextCall = {
  chatId: number;
  messageId: number;
  text: string;
  options: Record<string, unknown>;
};

export type ReplyCall = {
  text: string;
  options: Record<string, unknown> | undefined;
};

export function createMockCtx(
  overrides: {
    from?: Partial<NonNullable<BotContext["from"]>>;
    session?: Partial<SessionData>;
  } = {},
) {
  const editMessageTextCalls: EditMessageTextCall[] = [];
  const replyCalls: ReplyCall[] = [];
  const answerCallbackQueryCalls: unknown[] = [];

  const session: SessionData = {
    userId: undefined,
    nav: { stack: [{ name: "home" }] },
    ui: {},
    ...overrides.session,
  };

  const ctx = {
    from: {
      id: 111,
      username: "student1",
      first_name: "Anna",
      last_name: null,
      is_bot: false,
      ...overrides.from,
    },
    chat: { id: 999, type: "private" },
    callbackQuery: { id: "cbq-1", data: "x" },
    session,
    t: ((key: string) => key) as BotContext["t"],
    api: {
      editMessageText: async (
        chatId: number,
        messageId: number,
        text: string,
        options: Record<string, unknown> = {},
      ) => {
        editMessageTextCalls.push({ chatId, messageId, text, options });
      },
    },
    reply: async (text: string, options?: Record<string, unknown>) => {
      replyCalls.push({ text, options });
      return { message_id: 555 };
    },
    answerCallbackQuery: async (arg?: unknown) => {
      answerCallbackQueryCalls.push(arg);
    },
  };

  return {
    ctx: ctx as unknown as BotContext,
    editMessageTextCalls,
    replyCalls,
    answerCallbackQueryCalls,
    /** All text shown to the user across edited screens and replies, in order. */
    allShownText(): string[] {
      return [
        ...editMessageTextCalls.map((c) => c.text),
        ...replyCalls.map((c) => c.text),
      ];
    },
  };
}
