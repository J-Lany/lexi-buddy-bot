import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { env } from "../../config/env.js";
import type { RegistrationDraft } from "../../domain/registration/registration.types.js";

export class BackendApiService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.backendBaseUrl,
      timeout: 7000,
    });

    if (env.internalApiToken) {
      this.http.defaults.headers.common["x-internal-token"] =
        env.internalApiToken;
    }
  }

  async getByTelegramId(telegramId: number) {
    try {
      const res = await this.http.get("/auth/by-telegram", {
        params: { telegramId },
      });
      return res.data;
    } catch (e: unknown) {
      const err = e as AxiosError;
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  async registerTelegramStudent(draft: RegistrationDraft) {
    const res = await this.http.post("/auth/register/telegram", {
      telegramId: draft.telegramId,
      username: draft.username ?? null,
      firstName: draft.firstName,
      lastName: draft.lastName,
      level: draft.level,
      ageGroup: draft.ageGroup,
    });
    return res.data;
  }
}
