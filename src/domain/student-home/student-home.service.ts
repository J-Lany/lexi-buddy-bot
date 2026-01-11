import type { RegistrationService } from "../registration/registration.service.js";
import type { StartView, TelegramProfile } from "./types.js";

export class StudentHomeService {
  constructor(private readonly registration: RegistrationService) {}

  async getStartView(profile: TelegramProfile): Promise<StartView> {
    const registered = await this.registration.isRegistered(profile.telegramId);

    if (!registered) return { type: "NEED_REG" };

    return { type: "ACTIVE_STUDENT" };
  }
}
