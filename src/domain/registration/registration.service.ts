import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type { ConsentedRegistrationDraft } from "./registration.types.js";

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

  /**
   * Returns the newly created user's id when the register response includes
   * one (avoiding a separate lookup in the common case). Returns null when
   * the response doesn't include a usable id — the caller should then fall
   * back to looking the user up by Telegram id.
   *
   * Throwing here means the registration itself failed; a null return means
   * registration succeeded but the id couldn't be confirmed from the response.
   */
  async register(
    draft: ConsentedRegistrationDraft,
  ): Promise<{ id: number } | null> {
    const response: unknown = await this.backend.registerTelegramStudent(draft);

    if (
      response &&
      typeof response === "object" &&
      "id" in response &&
      typeof (response as { id: unknown }).id === "number"
    ) {
      return { id: (response as { id: number }).id };
    }

    return null;
  }
}
