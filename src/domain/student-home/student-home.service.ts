import type { RegistrationService } from "../registration/registration.service.js";
import type { ProfileService } from "../profile/profile.service.js";
import type { StartView, TelegramProfile } from "./types.js";

export class StudentHomeService {
  constructor(
    private readonly registration: RegistrationService,
    private readonly profile: ProfileService,
  ) {}

  async getStartView(profile: TelegramProfile): Promise<StartView> {
    const user = await this.registration.findByTelegramId(profile.telegramId);
    if (!user) return { type: "NEED_REG" };

    const p = await this.profile.get(profile.telegramId);
    const groupsCount = p.groupsCount ?? 0;

    if (groupsCount <= 0) {
      return { type: "REGISTERED_NO_TEACHER", userId: user.id };
    }

    return { type: "ACTIVE_STUDENT", userId: user.id };
  }
}
