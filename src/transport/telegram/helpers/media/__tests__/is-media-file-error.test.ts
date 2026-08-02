import { test } from "node:test";
import assert from "node:assert/strict";
import { GrammyError } from "grammy";

import { isMediaFileError } from "../is-media-file-error.js";

function grammyError(errorCode: number, description: string): GrammyError {
  return new GrammyError(
    "Call failed",
    { ok: false, error_code: errorCode, description, parameters: {} },
    "sendAnimation",
    {},
  );
}

test("isMediaFileError — true for a wrong file identifier 400", () => {
  assert.equal(
    isMediaFileError(
      grammyError(400, "Bad Request: wrong file identifier/HTTP URL specified"),
    ),
    true,
  );
});

test("isMediaFileError — true for a wrong remote file id 400", () => {
  assert.equal(
    isMediaFileError(
      grammyError(400, "Bad Request: wrong remote file id specified"),
    ),
    true,
  );
});

test("isMediaFileError — true for a failed-to-fetch-URL 400", () => {
  assert.equal(
    isMediaFileError(
      grammyError(400, "Bad Request: failed to get HTTP URL content"),
    ),
    true,
  );
});

test("isMediaFileError — true for a caption-too-long 400", () => {
  assert.equal(
    isMediaFileError(
      grammyError(400, "Bad Request: message caption is too long"),
    ),
    true,
  );
});

test("isMediaFileError — false for an unrelated 400", () => {
  assert.equal(
    isMediaFileError(grammyError(400, "Bad Request: chat not found")),
    false,
  );
});

test("isMediaFileError — false for a 403 (bot blocked by user)", () => {
  assert.equal(
    isMediaFileError(
      grammyError(403, "Forbidden: bot was blocked by the user"),
    ),
    false,
  );
});

test("isMediaFileError — false for a 429 (rate limit)", () => {
  assert.equal(isMediaFileError(grammyError(429, "Too Many Requests")), false);
});

test("isMediaFileError — false for a non-GrammyError", () => {
  assert.equal(isMediaFileError(new Error("network blip")), false);
  assert.equal(isMediaFileError("not even an Error"), false);
  assert.equal(isMediaFileError(undefined), false);
});
