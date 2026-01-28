import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { env } from "../../config/env.js";
import type { RegistrationDraft } from "../../domain/registration/registration.types.js";
import {
  BackendApiError,
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "./backend-api.errors.js";
import type { BackendErrorResponse } from "./backend-api.errors.js";
import type {
  GetLessonAssignmentsResponse,
  GetStudentLessonsResponse,
  GetStudentProfileResponse,
  InternalAssignmentPreviewResponseDto,
  InternalStartAssignmentResponseDto,
  SubmitAssignmentRequestDto,
  SubmitAssignmentResponseDto,
} from "./backend-api.types.js";

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

  async getStudentLessons(telegramId: number) {
    const res = await this.http.get("/internal/student/lessons", {
      params: { telegramId },
    });
    return res.data as GetStudentLessonsResponse;
  }

  async getStudentProfile(telegramId: number) {
    const res = await this.http.get("/internal/student/profile", {
      params: { telegramId },
    });
    return res.data as GetStudentProfileResponse;
  }

  async getLessonAssignments(telegramId: number, lessonId: number) {
    const res = await this.http.get("/internal/student/lesson/assignments", {
      params: { telegramId, lessonId },
    });

    return res.data as GetLessonAssignmentsResponse;
  }

  async getAssignmentPreview(telegramId: number, assignmentId: number) {
    const res = await this.http.get("/internal/student/assignment/preview", {
      params: { telegramId, assignmentId },
    });

    return res.data as InternalAssignmentPreviewResponseDto;
  }

  async startAssignmentAttempt(telegramId: number, assignmentId: number) {
    const res = await this.http.post(
      "/internal/student/assignment/start",
      null,
      { params: { telegramId, assignmentId } },
    );

    return res.data as InternalStartAssignmentResponseDto;
  }

  async submitAssignmentAttempt(body: SubmitAssignmentRequestDto) {
    const res = await this.http.post(
      "/internal/student/assignment/submit",
      body,
    );
    return res.data as SubmitAssignmentResponseDto;
  }
}
