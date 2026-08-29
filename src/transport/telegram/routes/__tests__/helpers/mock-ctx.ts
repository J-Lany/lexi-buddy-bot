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

export type SendAnimationCall = {
  chatId: number | string;
  fileId: string;
  options: Record<string, unknown>;
};

export type SendVideoCall = {
  chatId: number | string;
  fileId: string;
  options: Record<string, unknown>;
};

export type DeleteMessageCall = {
  chatId: number | string;
  messageId: number;
};

export type EditMessageReplyMarkupCall = {
  chatId: number;
  messageId: number;
  options: Record<string, unknown>;
};

export function createMockCtx(
  overrides: {
    from?: Partial<NonNullable<BotContext["from"]>>;
    session?: Partial<SessionData>;
    callbackQuery?: {
      id?: string;
      data?: string;
      message?: { message_id: number };
    };
    /** For message-type-filtered handlers (e.g. bot.on("message:animation", ...)). */
    message?: Record<string, unknown>;
    /** Set to have sendAnimation/sendVideo throw instead of succeed — e.g. to simulate a bad file_id. */
    sendAnimationImpl?: (
      chatId: number | string,
      fileId: string,
      options: Record<string, unknown>,
    ) => Promise<{ message_id: number }>;
    sendVideoImpl?: (
      chatId: number | string,
      fileId: string,
      options: Record<string, unknown>,
    ) => Promise<{ message_id: number }>;
    editMessageReplyMarkupImpl?: (
      chatId: number,
      messageId: number,
      options: Record<string, unknown>,
    ) => Promise<unknown>;
    replyImpl?: (
      text: string,
      options?: Record<string, unknown>,
    ) => Promise<{ message_id: number }>;
  } = {},
) {
  const editMessageTextCalls: EditMessageTextCall[] = [];
  const replyCalls: ReplyCall[] = [];
  const answerCallbackQueryCalls: unknown[] = [];
  const sendAnimationCalls: SendAnimationCall[] = [];
  const sendVideoCalls: SendVideoCall[] = [];
  const deleteMessageCalls: DeleteMessageCall[] = [];
  const editMessageReplyMarkupCalls: EditMessageReplyMarkupCall[] = [];

  let nextMediaMessageId = 2000;

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
    callbackQuery: { id: "cbq-1", data: "x", ...overrides.callbackQuery },
    message: overrides.message,
    session,
    t: ((key: string) => key) as BotContext["t"],
    api: {
      editMessageReplyMarkup: async (
        chatId: number,
        messageId: number,
        options: Record<string, unknown> = {},
      ) => {
        editMessageReplyMarkupCalls.push({ chatId, messageId, options });
        return overrides.editMessageReplyMarkupImpl?.(
          chatId,
          messageId,
          options,
        );
      },
      editMessageText: async (
        chatId: number,
        messageId: number,
        text: string,
        options: Record<string, unknown> = {},
      ) => {
        editMessageTextCalls.push({ chatId, messageId, text, options });
      },
      sendAnimation: async (
        chatId: number | string,
        fileId: string,
        options: Record<string, unknown> = {},
      ) => {
        sendAnimationCalls.push({ chatId, fileId, options });
        if (overrides.sendAnimationImpl) {
          return overrides.sendAnimationImpl(chatId, fileId, options);
        }
        return { message_id: nextMediaMessageId++ };
      },
      sendVideo: async (
        chatId: number | string,
        fileId: string,
        options: Record<string, unknown> = {},
      ) => {
        sendVideoCalls.push({ chatId, fileId, options });
        if (overrides.sendVideoImpl) {
          return overrides.sendVideoImpl(chatId, fileId, options);
        }
        return { message_id: nextMediaMessageId++ };
      },
      deleteMessage: async (chatId: number | string, messageId: number) => {
        deleteMessageCalls.push({ chatId, messageId });
        return true;
      },
    },
    reply: async (text: string, options?: Record<string, unknown>) => {
      replyCalls.push({ text, options });
      if (overrides.replyImpl) {
        return overrides.replyImpl(text, options);
      }
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
    sendAnimationCalls,
    sendVideoCalls,
    deleteMessageCalls,
    editMessageReplyMarkupCalls,
    /** All text shown to the user across edited screens and replies, in order. */
    allShownText(): string[] {
      return [
        ...editMessageTextCalls.map((c) => c.text),
        ...replyCalls.map((c) => c.text),
      ];
    },
  };
}
