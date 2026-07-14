import { test } from "node:test";
import assert from "node:assert/strict";

import { RegistrationService } from "../registration.service.js";
import type { BackendApiService } from "../../../infra/backend-api/backend-api.service.js";

const DRAFT = {
  telegramId: 111,
  username: "student1",
  firstName: "Anna",
  lastName: null,
  consentAccepted: true as const,
  consentVersion: 1,
};

function serviceWithRegisterResponse(response: unknown) {
  const backend = {
    registerTelegramStudent: async () => response,
  } as unknown as BackendApiService;

  return new RegistrationService(backend);
}

test("register — resolves the id when the response is a plain object with a numeric id", async () => {
  const service = serviceWithRegisterResponse({ id: 42, username: "student1" });
  const result = await service.register(DRAFT);
  assert.deepEqual(result, { id: 42 });
});

test("register — returns null when the response has no id field", async () => {
  const service = serviceWithRegisterResponse({
    message: "Activation email sent",
  });
  const result = await service.register(DRAFT);
  assert.equal(result, null);
});

test("register — returns null when the response is null", async () => {
  const service = serviceWithRegisterResponse(null);
  const result = await service.register(DRAFT);
  assert.equal(result, null);
});

test("register — returns null when the response is not an object", async () => {
  const service = serviceWithRegisterResponse("ok");
  const result = await service.register(DRAFT);
  assert.equal(result, null);
});

test("register — returns null when id is present but not a number", async () => {
  const service = serviceWithRegisterResponse({ id: "42" });
  const result = await service.register(DRAFT);
  assert.equal(result, null);
});
