import { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type { RegistrationDraft } from "./registration.types.js";

export class RegistrationService {
  constructor(private readonly backend: BackendApiService) {}

  async isRegistered(telegramId: number): Promise<boolean> {
    try {
      const user = await this.backend.getByTelegramId(telegramId);
      return Boolean(user);
    } catch {
      return false;
    }
  }

  async register(draft: RegistrationDraft): Promise<void> {
    await this.backend.registerTelegramStudent(draft);
  }
}
