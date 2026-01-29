import axios, { type AxiosInstance } from "axios";
import { env } from "../../config/env.js";
import type { RegistrationDraft } from "../../domain/registration/registration.types.js";

import {
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

import { toBackendApiError } from "./backend-api.error-mapper.js";

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
      if (axios.isAxiosError(e) && e.response?.status === 404) return null;
      throw toBackendApiError(
        e,
        "GET_BY_TELEGRAM_FAILED",
        "Failed to get user",
      );
    }
  }

  async registerTelegramStudent(draft: RegistrationDraft) {
    try {
      const res = await this.http.post("/auth/register/telegram", {
        telegramId: draft.telegramId,
        username: draft.username ?? null,
        firstName: draft.firstName,
        lastName: draft.lastName,
      });
      return res.data;
    } catch (e: unknown) {
      throw toBackendApiError(e, "REGISTER_FAILED", "Registration failed");
    }
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
      if (axios.isAxiosError<BackendErrorResponse>(e)) {
        const status = e.response?.status;

        if (status === 409) throw new InviteAlreadyProcessedError();
        if (status === 404) throw new InviteNotFoundError();
      }

      throw toBackendApiError(e, "RESPOND_FAILED", "Respond failed");
    }
  }

  async getStudentLessons(telegramId: number) {
    try {
      const res = await this.http.get("/internal/student/lessons", {
        params: { telegramId },
      });
      return res.data as GetStudentLessonsResponse;
    } catch (e: unknown) {
      throw toBackendApiError(e, "LESSONS_FAILED", "Failed to load lessons");
    }
  }

  async getStudentProfile(telegramId: number) {
    try {
      const res = await this.http.get("/internal/student/profile", {
        params: { telegramId },
      });
      return res.data as GetStudentProfileResponse;
    } catch (e: unknown) {
      throw toBackendApiError(e, "PROFILE_FAILED", "Failed to load profile");
    }
  }

  async getLessonAssignments(telegramId: number, lessonId: number) {
    try {
      const res = await this.http.get("/internal/student/lesson/assignments", {
        params: { telegramId, lessonId },
      });

      return res.data as GetLessonAssignmentsResponse;
    } catch (e: unknown) {
      throw toBackendApiError(
        e,
        "LESSON_ASSIGNMENTS_FAILED",
        "Failed to load lesson assignments",
      );
    }
  }

  async getAssignmentPreview(telegramId: number, assignmentId: number) {
    try {
      const res = await this.http.get("/internal/student/assignment/preview", {
        params: { telegramId, assignmentId },
      });

      return res.data as InternalAssignmentPreviewResponseDto;
    } catch (e: unknown) {
      throw toBackendApiError(
        e,
        "ASSIGNMENT_PREVIEW_FAILED",
        "Failed to load assignment preview",
      );
    }
  }

  async startAssignmentAttempt(telegramId: number, assignmentId: number) {
    try {
      const res = await this.http.post(
        "/internal/student/assignment/start",
        null,
        { params: { telegramId, assignmentId } },
      );

      return res.data as InternalStartAssignmentResponseDto;
    } catch (e: unknown) {
      throw toBackendApiError(
        e,
        "ASSIGNMENT_START_FAILED",
        "Failed to start assignment",
      );
    }
  }

  async submitAssignmentAttempt(body: SubmitAssignmentRequestDto) {
    try {
      const res = await this.http.post(
        "/internal/student/assignment/submit",
        body,
      );
      return res.data as SubmitAssignmentResponseDto;
    } catch (e: unknown) {
      throw toBackendApiError(e, "SUBMIT_FAILED", "Submit failed");
    }
  }
}
