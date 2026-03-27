import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export type RequestContext = {
  requestId: string;
  updateId: number | null;
  telegramUserId: number | null;
  userId: number | null;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  input: Partial<RequestContext>,
  fn: () => T,
): T {
  const context: RequestContext = {
    requestId: input.requestId ?? randomUUID(),
    updateId: input.updateId ?? null,
    telegramUserId: input.telegramUserId ?? null,
    userId: input.userId ?? null,
  };

  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext | null {
  return storage.getStore() ?? null;
}

export function getRequestId(): string {
  return storage.getStore()?.requestId ?? randomUUID();
}

export function setRequestUserId(userId: number | null) {
  const store = storage.getStore();
  if (!store) return;
  store.userId = userId;
}
