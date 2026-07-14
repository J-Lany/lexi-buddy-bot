import { test } from "node:test";
import assert from "node:assert/strict";

import { registerRegistrationRoutes } from "../registration.routes.js";
import { BOT_CONSENT_VERSION } from "../../../../domain/registration/registration.types.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";
import { createFakeRegistrationService } from "./helpers/fake-registration-service.js";

function setup(
  regServiceOptions: Parameters<typeof createFakeRegistrationService>[0] = {},
) {
  const { bot, callbackHandlers, commandHandlers } = createFakeBot();
  const { regService, registerCalls, findByTelegramIdCalls } =
    createFakeRegistrationService(regServiceOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerRegistrationRoutes(bot as any, regService);

  return {
    callbackHandlers,
    commandHandlers,
    registerCalls,
    findByTelegramIdCalls,
  };
}

const DRAFT = {
  telegramId: 111,
  username: "student1",
  firstName: "Anna",
  lastName: null,
};

test("Join (reg_begin) shows the consent screen but does not register", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx, allShownText } = createMockCtx();

  await callbackHandlers.get("reg_begin")!(ctx);

  assert.equal(registerCalls.length, 0);
  assert.ok(ctx.session.reg?.draft);
  assert.ok(allShownText().some((text) => text.includes("reg-consent-title")));
});

test("a stale Join callback after registrationCompleted does not reopen registration", async () => {
  const { callbackHandlers, registerCalls, findByTelegramIdCalls } = setup();
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT, registrationCompleted: true } },
  });

  await callbackHandlers.get("reg_begin")!(ctx);

  // The session must be left untouched — still registrationCompleted, still
  // the same draft, never rebuilt from scratch.
  assert.equal(ctx.session.reg?.registrationCompleted, true);
  assert.deepEqual(ctx.session.reg?.draft, DRAFT);
  assert.equal(registerCalls.length, 0);
  assert.ok(allShownText().some((text) => text.includes("reg-lookup-failed")));
  assert.ok(!allShownText().some((text) => text.includes("reg-consent-title")));

  // Pressing "Try again" afterward must only retry the lookup, never register.
  await callbackHandlers.get("reg_consent_continue")!(ctx);
  assert.equal(registerCalls.length, 0);
  assert.deepEqual(findByTelegramIdCalls, [111]);
});

test("a Join callback while registration is processing is acknowledged and does nothing", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT, processing: true } },
  });

  await callbackHandlers.get("reg_begin")!(ctx);

  assert.equal(ctx.session.reg?.processing, true);
  assert.deepEqual(ctx.session.reg?.draft, DRAFT);
  assert.equal(registerCalls.length, 0);
  assert.deepEqual(allShownText(), []);
});

test("Continue registers with both consent fields and resolves the user directly from the register response", async () => {
  const { callbackHandlers, registerCalls, findByTelegramIdCalls } = setup();
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.equal(registerCalls.length, 1);
  assert.deepEqual(registerCalls[0], {
    telegramId: 111,
    username: "student1",
    firstName: "Anna",
    lastName: null,
    consentAccepted: true,
    consentVersion: BOT_CONSENT_VERSION,
  });
  // The register response already contained an id — no lookup is needed at all.
  assert.deepEqual(findByTelegramIdCalls, []);

  assert.equal(ctx.session.userId, 42);
  assert.equal(ctx.session.reg, undefined);
  assert.ok(allShownText().some((text) => text.includes("reg-success")));
});

test("Continue falls back to findByTelegramId when the register response has no id", async () => {
  const { callbackHandlers, registerCalls, findByTelegramIdCalls } = setup({
    registerImpl: async () => null,
    findByTelegramIdImpl: async () => ({ id: 42 }),
  });
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.equal(registerCalls.length, 1);
  assert.deepEqual(findByTelegramIdCalls, [111]);
  assert.equal(ctx.session.userId, 42);
  assert.equal(ctx.session.reg, undefined);
  assert.ok(allShownText().some((text) => text.includes("reg-success")));
});

test("a stale Continue button after /cancel does not register anyone", async () => {
  const { callbackHandlers, commandHandlers, registerCalls } = setup();
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  await commandHandlers.get("cancel")!(ctx);
  assert.equal(ctx.session.reg, undefined);

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.equal(registerCalls.length, 0);
  assert.ok(allShownText().some((text) => text.includes("reg-restore-failed")));
});

test("a stale Continue button after reg_cancel does not register anyone", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx } = createMockCtx({ session: { reg: { draft: DRAFT } } });

  await callbackHandlers.get("reg_cancel")!(ctx);
  assert.equal(ctx.session.reg, undefined);

  await callbackHandlers.get("reg_consent_continue")!(ctx);
  assert.equal(registerCalls.length, 0);
});

test("a stale Continue button after a fresh restart (session.reg cleared) does not register anyone", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx } = createMockCtx({ session: { reg: { draft: DRAFT } } });

  delete ctx.session.reg;

  await callbackHandlers.get("reg_consent_continue")!(ctx);
  assert.equal(registerCalls.length, 0);
});

test("two near-simultaneous Continue taps only call register once", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx } = createMockCtx({ session: { reg: { draft: DRAFT } } });

  const handler = callbackHandlers.get("reg_consent_continue")!;
  await Promise.all([handler(ctx), handler(ctx)]);

  assert.equal(registerCalls.length, 1);
});

test("a register API error does not leak the raw error message to the user", async () => {
  const { callbackHandlers, registerCalls } = setup({
    registerImpl: async () => {
      throw new Error(
        "connect ECONNREFUSED 10.0.0.5:5432 — internal backend failure, path /auth/register/telegram",
      );
    },
  });
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.equal(registerCalls.length, 1);
  const shown = allShownText().join("\n");
  assert.ok(!shown.includes("10.0.0.5"));
  assert.ok(!shown.includes("ECONNREFUSED"));
  assert.ok(!shown.includes("/auth/register/telegram"));
  assert.ok(shown.includes("reg-failed"));
});

test("after a register API error (not yet completed), the consent screen and draft are still usable and retry re-attempts registration", async () => {
  const { ctx } = createMockCtx({ session: { reg: { draft: DRAFT } } });

  let attempt = 0;
  const { callbackHandlers, registerCalls } = setup({
    registerImpl: async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("temporary failure");
      return { id: 42 };
    },
  });

  const handler = callbackHandlers.get("reg_consent_continue")!;

  await handler(ctx);
  assert.equal(registerCalls.length, 1);
  assert.ok(
    ctx.session.reg,
    "draft must survive the failure so the user can retry",
  );
  assert.equal(ctx.session.reg?.processing, false);
  assert.equal(ctx.session.reg?.registrationCompleted, undefined);

  await handler(ctx);
  assert.equal(registerCalls.length, 2);
  assert.equal(ctx.session.userId, 42);
  assert.equal(ctx.session.reg, undefined);
});

test("reg_consent_continue without any active session shows reg-restore-failed and never registers", async () => {
  const { callbackHandlers, registerCalls } = setup();
  const { ctx, allShownText } = createMockCtx({ session: {} });

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.equal(registerCalls.length, 0);
  assert.ok(allShownText().some((text) => text.includes("reg-restore-failed")));
});

// ─── registrationCompleted state machine (register succeeded, lookup pending) ──

test("register succeeds with no id in the response, and the lookup exhausts its bounded retries: a later Continue press resolves it WITHOUT re-registering", async () => {
  let lookupAttempt = 0;
  const { callbackHandlers, registerCalls, findByTelegramIdCalls } = setup({
    registerImpl: async () => null, // registration succeeded but the response had no id
    findByTelegramIdImpl: async () => {
      lookupAttempt += 1;
      return lookupAttempt > 3 ? { id: 42 } : null;
    },
  });
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  const handler = callbackHandlers.get("reg_consent_continue")!;

  // First press: register succeeds, but all 3 bounded lookup retries come back empty.
  await handler(ctx);
  assert.equal(registerCalls.length, 1);
  assert.equal(findByTelegramIdCalls.length, 3);
  assert.equal(ctx.session.reg?.registrationCompleted, true);
  assert.equal(ctx.session.reg?.processing, false);
  assert.ok(!allShownText().some((text) => text.includes("reg-success")));
  assert.ok(allShownText().some((text) => text.includes("reg-lookup-failed")));

  // Second press ("Try again"): must NOT call register again — only retries the lookup.
  await handler(ctx);
  assert.equal(
    registerCalls.length,
    1,
    "register must not be called a second time",
  );
  assert.equal(findByTelegramIdCalls.length, 4);
  assert.equal(ctx.session.userId, 42);
  assert.equal(ctx.session.reg, undefined);
  assert.ok(allShownText().some((text) => text.includes("reg-success")));
});

test("persistent lookup failure across multiple retry presses never shows a false success and never re-registers", async () => {
  const { callbackHandlers, registerCalls } = setup({
    registerImpl: async () => null,
    findByTelegramIdImpl: async () => null,
  });
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  const handler = callbackHandlers.get("reg_consent_continue")!;
  await handler(ctx);
  await handler(ctx);
  await handler(ctx);

  assert.equal(
    registerCalls.length,
    1,
    "register must never be called more than once",
  );
  assert.notEqual(ctx.session.userId, 42);
  assert.ok(!allShownText().some((text) => text.includes("reg-success")));
  assert.ok(ctx.session.reg, "must remain retryable");
  assert.equal(ctx.session.reg?.registrationCompleted, true);
});

test("a lookup-step network error after registrationCompleted shows the lookup-retry screen, not the consent screen (no re-registration path)", async () => {
  let lookupCallCount = 0;
  const { callbackHandlers, registerCalls } = setup({
    registerImpl: async () => null,
    findByTelegramIdImpl: async () => {
      lookupCallCount += 1;
      throw new Error("network blip during lookup");
    },
  });
  const { ctx, allShownText } = createMockCtx({
    session: { reg: { draft: DRAFT } },
  });

  await callbackHandlers.get("reg_consent_continue")!(ctx);

  assert.ok(lookupCallCount > 0);
  assert.equal(registerCalls.length, 1);
  assert.equal(ctx.session.reg?.registrationCompleted, true);
  assert.ok(allShownText().some((text) => text.includes("reg-lookup-failed")));
  assert.ok(!allShownText().some((text) => text.includes("reg-consent-title")));
});
