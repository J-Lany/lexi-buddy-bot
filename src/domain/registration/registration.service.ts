import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type { RegistrationDraft } from "./registration.types.js";

export type RegisteredTelegramUser = Exclude<
  Awaited<ReturnType<BackendApiService["getByTelegramId"]>>,
  null
>;

export class RegistrationService {
  constructor(private readonly backend: BackendApiService) {}

  async findByTelegramId(
    telegramId: number,
  ): Promise<RegisteredTelegramUser | null> {
    return await this.backend.getByTelegramId(telegramId);
  }

  async isRegistered(telegramId: number): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return Boolean(user);
  }

  async register(draft: RegistrationDraft): Promise<void> {
    await this.backend.registerTelegramStudent(draft);
  }
}
