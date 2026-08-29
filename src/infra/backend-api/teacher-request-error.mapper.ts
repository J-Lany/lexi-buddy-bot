import axios from "axios";
import {
  InviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError,
  InviteNotFoundError,
  type BackendErrorResponse,
} from "./backend-api.errors.js";

export function toKnownTeacherRequestError(error: unknown): Error | null {
  if (!axios.isAxiosError<BackendErrorResponse>(error)) return null;

  switch (error.response?.data?.code) {
    case "TEACHER_REQUEST_ALREADY_ACCEPTED":
      return new InviteAlreadyAcceptedError();
    case "TEACHER_REQUEST_ALREADY_DECLINED":
      return new InviteAlreadyDeclinedError();
    case "TEACHER_REQUEST_NOT_FOUND":
      return new InviteNotFoundError();
    default:
      return null;
  }
}
