import { test } from "node:test";
import assert from "node:assert/strict";

import { registerMediaRegistrationRoutes } from "../media-registration.routes.js";
import { env } from "../../../../config/env.js";
import { createFakeBot } from "./helpers/fake-bot.js";
import { createMockCtx } from "./helpers/mock-ctx.js";
import { withEnvOverride } from "./helpers/with-env-override.js";

function setup() {
  const { bot, onHandlers } = createFakeBot();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerMediaRegistrationRoutes(bot as any);
  const handler = onHandlers.get("message:animation")?.[0];
  if (!handler) throw new Error("handler not registered");
  return handler;
}

async function runHandler(
  handler: ReturnType<typeof setup>,
  ctx: unknown,
): Promise<{ nextCalled: boolean }> {
  let nextCalled = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await handler(ctx as any, async () => {
    nextCalled = true;
  });
  return { nextCalled };
}

test("disabled (default) — never responds, even for an allowlisted admin", async () => {
  const handler = setup();
  const { ctx, replyCalls } = createMockCtx({
    from: { id: 111 },
    message: {
      animation: {
        file_id: "anim_1",
        file_unique_id: "u1",
        width: 1,
        height: 1,
        duration: 1,
      },
    },
  });

  const { nextCalled } = await runHandler(handler, ctx);

  assert.equal(replyCalls.length, 0);
  assert.equal(nextCalled, true);
});

test("enabled but empty allowlist — nobody gets access", async () => {
  await withEnvOverride(env.mediaRegistration, { enabled: true }, async () => {
    const handler = setup();
    const { ctx, replyCalls } = createMockCtx({
      from: { id: 111 },
      message: {
        animation: {
          file_id: "anim_1",
          file_unique_id: "u1",
          width: 1,
          height: 1,
          duration: 1,
        },
      },
    });

    const { nextCalled } = await runHandler(handler, ctx);

    assert.equal(replyCalls.length, 0);
    assert.equal(nextCalled, true);
  });
});

test("enabled, allowlist non-empty, sender not on it — silently no response", async () => {
  await withEnvOverride(
    env.mediaRegistration,
    { enabled: true, adminIds: new Set([999]) },
    async () => {
      const handler = setup();
      const { ctx, replyCalls } = createMockCtx({
        from: { id: 111 },
        message: {
          animation: {
            file_id: "anim_1",
            file_unique_id: "u1",
            width: 1,
            height: 1,
            duration: 1,
          },
        },
      });

      const { nextCalled } = await runHandler(handler, ctx);

      assert.equal(replyCalls.length, 0);
      assert.equal(nextCalled, true);
    },
  );
});

test("enabled + authorized admin — animation returns file_id/file_unique_id/mime/type", async () => {
  await withEnvOverride(
    env.mediaRegistration,
    { enabled: true, adminIds: new Set([111]) },
    async () => {
      const handler = setup();
      const { ctx, replyCalls } = createMockCtx({
        from: { id: 111 },
        message: {
          animation: {
            file_id: "anim_1",
            file_unique_id: "u1",
            width: 1,
            height: 1,
            duration: 1,
            mime_type: "video/mp4",
            file_name: "party.gif",
          },
        },
      });

      await runHandler(handler, ctx);

      assert.equal(replyCalls.length, 1);
      const reply = replyCalls[0]?.text ?? "";
      assert.ok(reply.includes("type: animation"));
      assert.ok(reply.includes("file_id: anim_1"));
      assert.ok(reply.includes("file_unique_id: u1"));
      assert.ok(reply.includes("mime_type: video/mp4"));
      assert.ok(!reply.includes("usable_for_media_env: false"));
    },
  );
});

test("enabled + authorized admin — video returns file_id/file_unique_id/mime/type", async () => {
  await withEnvOverride(
    env.mediaRegistration,
    { enabled: true, adminIds: new Set([111]) },
    async () => {
      const handler = setup();
      const { ctx, replyCalls } = createMockCtx({
        from: { id: 111 },
        message: {
          video: {
            file_id: "vid_1",
            file_unique_id: "u2",
            width: 1,
            height: 1,
            duration: 1,
            mime_type: "video/mp4",
          },
        },
      });

      await runHandler(handler, ctx);

      assert.equal(replyCalls.length, 1);
      const reply = replyCalls[0]?.text ?? "";
      assert.ok(reply.includes("type: video"));
      assert.ok(reply.includes("file_id: vid_1"));
      assert.ok(!reply.includes("usable_for_media_env: false"));
    },
  );
});

test("enabled + authorized admin — a supported document (image/gif) is flagged not usable for media env", async () => {
  await withEnvOverride(
    env.mediaRegistration,
    { enabled: true, adminIds: new Set([111]) },
    async () => {
      const handler = setup();
      const { ctx, replyCalls } = createMockCtx({
        from: { id: 111 },
        message: {
          document: {
            file_id: "doc_1",
            file_unique_id: "u3",
            mime_type: "image/gif",
            file_name: "party.gif",
          },
        },
      });

      await runHandler(handler, ctx);

      assert.equal(replyCalls.length, 1);
      const reply = replyCalls[0]?.text ?? "";
      assert.ok(reply.includes("type: document"));
      assert.ok(reply.includes("usable_for_media_env: false"));
      assert.ok(
        reply.toLowerCase().includes("resend this file as an animation"),
      );
    },
  );
});

test("enabled + authorized admin — an unsupported document mime type is not treated as media registration", async () => {
  await withEnvOverride(
    env.mediaRegistration,
    { enabled: true, adminIds: new Set([111]) },
    async () => {
      const handler = setup();
      const { ctx, replyCalls } = createMockCtx({
        from: { id: 111 },
        message: {
          document: {
            file_id: "doc_2",
            file_unique_id: "u4",
            mime_type: "application/pdf",
          },
        },
      });

      await runHandler(handler, ctx);

      assert.equal(replyCalls.length, 1);
      const reply = replyCalls[0]?.text ?? "";
      assert.ok(reply.toLowerCase().includes("unsupported document type"));
      assert.ok(!reply.includes("file_id: doc_2"));
    },
  );
});
