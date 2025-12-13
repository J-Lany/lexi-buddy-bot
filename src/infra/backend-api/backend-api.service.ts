import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { env } from "../../config/env.js";
import type { RegistrationDraft } from "../../domain/registration/registration.types.js";
import {
  BackendApiError,
  BackendErrorResponse,
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "./backend-api.errors.js";
import type { BackendErrorResponse } from "./backend-api.errors.js";

export class BackendApiService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.backendBaseUrl,
      timeout: 7000,
    });

    if (env.telegramBotInternalToken) {
      this.http.defaults.headers.common["x-internal-token"] =
        env.telegramBotInternalToken;
    }
  }

  async getByTelegramId(telegramId: number) {
    try {
      const res = await this.http.get("/auth/by-telegram", {
        params: { telegramId },
      });
      return res.data;
    } catch (e: unknown) {
      console.log(e);
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

  async respondToTeacherRequestFromTelegram(params: {
    inviteId: number;
    telegramId: number;
    accept: boolean;
  }) {
    try {
      const res = await this.http.post(
        `/internal/teacher-requests/${params.inviteId}/respond`,
        {
          telegramId: params.telegramId,
          accept: params.accept,
        },
      );
      return res.data;
    } catch (e: unknown) {
      const err = e as AxiosError<BackendErrorResponse>;
      const status = err.response?.status;

      if (status === 409) throw new InviteAlreadyProcessedError();
      if (status === 404) throw new InviteNotFoundError();

      const apiMessage =
        err.response?.data?.message ?? err.response?.data?.error ?? undefined;

      throw new BackendApiError(
        apiMessage ?? `Respond failed (${status ?? "no status"})`,
        status,
        "RESPOND_FAILED",
      );
    }
  }
}
