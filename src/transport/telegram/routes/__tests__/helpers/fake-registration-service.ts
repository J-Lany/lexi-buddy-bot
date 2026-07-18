import type { ConsentedRegistrationDraft } from "../../../../../domain/registration/registration.types.js";
import type { RegistrationService } from "../../../../../domain/registration/registration.service.js";

type FakeUser = { id: number } & Record<string, unknown>;

export function createFakeRegistrationService(
  options: {
    registerImpl?: (
      draft: ConsentedRegistrationDraft,
    ) => Promise<{ id: number } | null>;
    findByTelegramIdImpl?: (telegramId: number) => Promise<FakeUser | null>;
  } = {},
) {
  const registerCalls: ConsentedRegistrationDraft[] = [];
  const findByTelegramIdCalls: number[] = [];

  const register = async (draft: ConsentedRegistrationDraft) => {
    registerCalls.push(draft);
    if (options.registerImpl) return options.registerImpl(draft);
    return { id: 42 };
  };

  const findByTelegramId = async (telegramId: number) => {
    findByTelegramIdCalls.push(telegramId);
    if (options.findByTelegramIdImpl)
      return options.findByTelegramIdImpl(telegramId);
    return { id: 42 };
  };

  const isRegistered = async (telegramId: number) => {
    return Boolean(await findByTelegramId(telegramId));
  };

  const regService = { register, findByTelegramId, isRegistered };

  return {
    regService: regService as unknown as RegistrationService,
    registerCalls,
    findByTelegramIdCalls,
  };
}
