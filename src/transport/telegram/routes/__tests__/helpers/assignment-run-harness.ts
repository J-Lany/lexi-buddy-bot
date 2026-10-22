import { Bot } from "grammy";
import type { Update } from "grammy/types";

import type { BotContext } from "../../../context.js";
import type { SessionData } from "../../../session.js";
import { i18n } from "../../../../../i18n/index.js";
import { registerStudentAssignmentsRoutes } from "../../student-assignments.routes.js";

/** Telegram Bot API: InlineKeyboardButton.callback_data must be 1–64 bytes. */
export const CALLBACK_DATA_MAX_BYTES = 64;

export type ApiCall = { method: string; payload: Record<string, unknown> };

export type TestQuestion = {
  id: number;
  text: string;
  questionType: string;
  explanation: string | null;
  answers: Array<{ id: number; text: string; isCorrect: boolean }>;
};

export function callbackDatasOf(payload: Record<string, unknown>): string[] {
  const markup = payload.reply_markup as
    | { inline_keyboard?: Array<Array<{ callback_data?: string }>> }
    | undefined;
  return (markup?.inline_keyboard ?? [])
    .flat()
    .map((b) => b.callback_data)
    .filter((d): d is string => typeof d === "string");
}

/**
 * Runs the real student-assignments routes on a real grammY Bot. Only two
 * things are replaced: the backend (studentAssignments.start/submit) and
 * Telegram itself — the latter by an API transformer that enforces the
 * documented callback_data limit and answers like the Bot API does
 * (400 BUTTON_DATA_INVALID), so oversized keyboards fail exactly as in prod.
 */
export function createAssignmentRunHarness(params: {
  assignmentType: string;
  questions: TestQuestion[];
}) {
  const bot = new Bot<BotContext>("test-telegram-token", {
    botInfo: {
      id: 1,
      is_bot: true,
      first_name: "LexiBuddy",
      username: "lexi_test_bot",
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
    } as never,
  });

  const calls: ApiCall[] = [];
  let nextMessageId = 500;

  bot.api.config.use(async (_prev, method, payload) => {
    const p = (payload ?? {}) as Record<string, unknown>;
    calls.push({ method, payload: p });

    for (const data of callbackDatasOf(p)) {
      const size = Buffer.byteLength(data, "utf8");
      if (size < 1 || size > CALLBACK_DATA_MAX_BYTES) {
        return {
          ok: false,
          error_code: 400,
          description: "Bad Request: BUTTON_DATA_INVALID",
        } as never;
      }
    }

    if (method === "answerCallbackQuery" || method === "deleteMessage") {
      return { ok: true, result: true } as never;
    }

    return {
      ok: true,
      result: {
        message_id:
          method === "editMessageText"
            ? (p.message_id as number)
            : nextMessageId++,
        date: 0,
        chat: { id: 42, type: "private" },
        text: String(p.text ?? ""),
      },
    } as never;
  });

  const session = {
    __language_code: "ru",
    nav: {
      stack: [{ name: "home" }, { name: "assignment_intro", assignmentId: 77 }],
    },
    ui: { screenMessageId: 100, screenMessageKind: "text" },
  } as SessionData;

  bot.use(async (ctx, next) => {
    ctx.session = session;
    await next();
  });
  bot.use(i18n);

  const submitted: unknown[] = [];
  const deps = {
    lessons: {} as never,
    profile: {} as never,
    studentAssignments: {
      start: async (_telegramId: number, assignmentId: number) => ({
        attemptId: 9001,
        attemptNo: 1,
        status: "IN_PROGRESS",
        attemptsPolicy: null,
        assignment: {
          assignmentId,
          type: params.assignmentType,
          lesson: { lessonId: 5 },
          questions: structuredClone(params.questions),
        },
      }),
      submit: async (body: unknown) => {
        submitted.push(body);
        return { status: "COMPLETED", score: null };
      },
    } as never,
  };

  registerStudentAssignmentsRoutes(bot, deps);

  let updateId = 1;
  const from = { id: 42, is_bot: false, first_name: "Student" };
  const chat = { id: 42, type: "private" as const, first_name: "Student" };

  async function pressButton(data: string) {
    const before = calls.length;
    await bot.handleUpdate({
      update_id: updateId++,
      callback_query: {
        id: `cb${updateId}`,
        chat_instance: "ci",
        data,
        from,
        message: { message_id: 100, date: 0, chat, text: "screen" },
      },
    } as Update);
    return calls.slice(before);
  }

  async function sendText(text: string) {
    const before = calls.length;
    await bot.handleUpdate({
      update_id: updateId++,
      message: { message_id: 1000 + updateId, date: 0, chat, from, text },
    } as Update);
    return calls.slice(before);
  }

  /** Callback data of the answer buttons on the most recent question message. */
  function lastQuestionButtons(): string[] {
    for (let i = calls.length - 1; i >= 0; i--) {
      const c = calls[i]!;
      if (c.method !== "sendMessage") continue;
      const datas = callbackDatasOf(c.payload);
      if (datas.length) return datas;
    }
    return [];
  }

  return {
    bot,
    calls,
    session,
    submitted,
    pressButton,
    sendText,
    lastQuestionButtons,
    start: () => pressButton("assignment_begin"),
  };
}

export function staleAckIn(calls: ApiCall[]): boolean {
  return calls.some(
    (c) =>
      c.method === "answerCallbackQuery" &&
      c.payload.text === "Экран устарел. Открой задание заново.",
  );
}

export const ERROR_GENERIC_RU = "⚠️ Что-то пошло не так. Попробуй позже.";

export function choiceQuestions(baseQuestionId: number, baseAnswerId: number) {
  return Array.from({ length: 8 }, (_, i) => ({
    id: baseQuestionId + i,
    text: `'word${i}' =`,
    questionType: "multiple_choice",
    explanation: "because",
    answers: [0, 1, 2].map((j) => ({
      id: baseAnswerId + i * 3 + j,
      text: `option ${i}.${j}`,
      isCorrect: j === 0,
    })),
  }));
}

export function textQuestions(
  questionType: "gap_fill" | "open_text",
  baseQuestionId: number,
  baseAnswerId: number,
) {
  return Array.from({ length: 3 }, (_, i) => ({
    id: baseQuestionId + i,
    text: `Fill ___ (${i})`,
    questionType,
    explanation: null,
    answers: [{ id: baseAnswerId + i, text: `answer${i}`, isCorrect: true }],
  }));
}
