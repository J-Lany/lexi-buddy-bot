import { test } from "node:test";
import assert from "node:assert/strict";

import { registerStartRoutes } from "../start.routes.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";

function setup(
  getStartViewImpl: () => Promise<
    | { type: "NEED_REG" }
    | { type: "REGISTERED_NO_TEACHER"; userId: number }
    | { type: "ACTIVE_STUDENT"; userId: number }
  >,
) {
  const { bot, commandHandlers } = createFakeBot();

  const home = { getStartView: getStartViewImpl };
  const deps = {
    home,
    lessons: {},
    profile: {},
    studentAssignments: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerStartRoutes(bot as any, deps);

  return { commandHandlers };
}

test("/start with NEED_REG populates session.reg and does not skip to the app", async () => {
  const { commandHandlers } = setup(async () => ({ type: "NEED_REG" }));
  const { ctx, allShownText } = createMockCtx();

  await commandHandlers.get("start")!(ctx);

  assert.ok(ctx.session.reg?.draft, "a draft must be created for NEED_REG");
  assert.equal(ctx.session.reg?.draft.telegramId, 111);
  assert.ok(
    allShownText().some((text) => text.includes("start-need-reg-title")),
  );
});

test("/start for an already-registered (ACTIVE_STUDENT) user does not populate session.reg — no consent screen", async () => {
  const { commandHandlers } = setup(async () => ({
    type: "ACTIVE_STUDENT",
    userId: 42,
  }));
  const { ctx } = createMockCtx();

  await commandHandlers.get("start")!(ctx);

  assert.equal(
    ctx.session.reg,
    undefined,
    "an already-registered user must never see the consent flow",
  );
  assert.equal(ctx.session.userId, 42);
});

test("/start for a REGISTERED_NO_TEACHER user does not populate session.reg — no consent screen", async () => {
  const { commandHandlers } = setup(async () => ({
    type: "REGISTERED_NO_TEACHER",
    userId: 7,
  }));
  const { ctx } = createMockCtx();

  await commandHandlers.get("start")!(ctx);

  assert.equal(ctx.session.reg, undefined);
  assert.equal(ctx.session.userId, 7);
});

test("/start always clears any previous registration session first", async () => {
  const { commandHandlers } = setup(async () => ({ type: "NEED_REG" }));
  const { ctx } = createMockCtx({
    session: {
      reg: {
        draft: {
          telegramId: 999,
          username: "old",
          firstName: "Old",
          lastName: null,
        },
        processing: true,
      },
    },
  });

  await commandHandlers.get("start")!(ctx);

  // A fresh draft was built from the live Telegram profile, not the stale one.
  assert.equal(ctx.session.reg?.draft.telegramId, 111);
  assert.equal(ctx.session.reg?.processing, undefined);
});
