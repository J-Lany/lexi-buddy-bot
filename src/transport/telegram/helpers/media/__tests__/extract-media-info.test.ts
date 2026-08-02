import { test } from "node:test";
import assert from "node:assert/strict";
import type { Message } from "grammy/types";

import { extractMediaInfo } from "../extract-media-info.js";

function baseMessage(overrides: Partial<Message>): Message {
  return {
    message_id: 1,
    date: 0,
    chat: { id: 1, type: "private", first_name: "A" },
    ...overrides,
  } as Message;
}

test("extractMediaInfo — animation is usable for media env", () => {
  const msg = baseMessage({
    animation: {
      file_id: "anim_1",
      file_unique_id: "u_anim_1",
      width: 1,
      height: 1,
      duration: 1,
      mime_type: "video/mp4",
      file_name: "party.gif",
    },
  });

  assert.deepEqual(extractMediaInfo(msg), {
    type: "animation",
    fileId: "anim_1",
    fileUniqueId: "u_anim_1",
    mimeType: "video/mp4",
    fileName: "party.gif",
    usableForMediaEnv: true,
  });
});

test("extractMediaInfo — video is usable for media env", () => {
  const msg = baseMessage({
    video: {
      file_id: "vid_1",
      file_unique_id: "u_vid_1",
      width: 1,
      height: 1,
      duration: 1,
      mime_type: "video/mp4",
    },
  });

  assert.deepEqual(extractMediaInfo(msg), {
    type: "video",
    fileId: "vid_1",
    fileUniqueId: "u_vid_1",
    mimeType: "video/mp4",
    fileName: null,
    usableForMediaEnv: true,
  });
});

test("extractMediaInfo — document with image/gif mime is diagnostic-only (not usable)", () => {
  const msg = baseMessage({
    document: {
      file_id: "doc_1",
      file_unique_id: "u_doc_1",
      mime_type: "image/gif",
      file_name: "party.gif",
    },
  });

  const info = extractMediaInfo(msg);
  assert.equal(info?.type, "document");
  assert.equal(info?.usableForMediaEnv, false);
});

test("extractMediaInfo — document with video/mp4 mime is diagnostic-only (not usable)", () => {
  const msg = baseMessage({
    document: {
      file_id: "doc_2",
      file_unique_id: "u_doc_2",
      mime_type: "video/mp4",
    },
  });

  const info = extractMediaInfo(msg);
  assert.equal(info?.type, "document");
  assert.equal(info?.usableForMediaEnv, false);
});

test("extractMediaInfo — document with an unsupported mime type is not recognized at all", () => {
  const msg = baseMessage({
    document: {
      file_id: "doc_3",
      file_unique_id: "u_doc_3",
      mime_type: "application/pdf",
    },
  });

  assert.equal(extractMediaInfo(msg), null);
});

test("extractMediaInfo — document without a mime type is not recognized", () => {
  const msg = baseMessage({
    document: { file_id: "doc_4", file_unique_id: "u_doc_4" },
  });

  assert.equal(extractMediaInfo(msg), null);
});

test("extractMediaInfo — a plain text message returns null", () => {
  const msg = baseMessage({ text: "hello" });
  assert.equal(extractMediaInfo(msg), null);
});
