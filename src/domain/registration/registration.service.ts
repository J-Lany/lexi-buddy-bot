import { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type { RegistrationDraft } from "./registration.types.js";

export class RegistrationService {
  constructor(private readonly backend: BackendApiService) {}

  async isRegistered(telegramId: number): Promise<boolean> {
    const user = await this.backend.getByTelegramId(telegramId);
    return Boolean(user);
  }

  async register(draft: RegistrationDraft): Promise<void> {
    await this.backend.registerTelegramStudent(draft);
  }
}
