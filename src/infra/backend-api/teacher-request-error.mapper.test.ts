import { test } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import {
  InviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError,
  InviteNotFoundError,
} from "./backend-api.errors.js";
import { toKnownTeacherRequestError } from "./teacher-request-error.mapper.js";

for (const [code, ErrorType] of [
  ["TEACHER_REQUEST_ALREADY_ACCEPTED", InviteAlreadyAcceptedError],
  ["TEACHER_REQUEST_ALREADY_DECLINED", InviteAlreadyDeclinedError],
  ["TEACHER_REQUEST_NOT_FOUND", InviteNotFoundError],
] as const) {
  test(`maps backend domain code ${code}`, () => {
    const error = new axios.AxiosError(
      "technical message",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: { headers: {} },
        data: { code, requestId: "req-1" },
      },
    );

    assert.ok(toKnownTeacherRequestError(error) instanceof ErrorType);
  });
}

test("does not infer a business state from HTTP status alone", () => {
  const error = new axios.AxiosError(
    "Request failed with status code 409",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: { headers: {} },
      data: { code: "CONFLICT" },
    },
  );

  assert.equal(toKnownTeacherRequestError(error), null);
});
