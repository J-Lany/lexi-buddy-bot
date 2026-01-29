import axios, { type AxiosError } from "axios";
import {
  BackendApiError,
  type BackendErrorResponse,
} from "./backend-api.errors.js";

export function toBackendApiError(
  e: unknown,
  fallbackCode: string,
  fallbackMessage: string,
): BackendApiError {
  if (e instanceof BackendApiError) return e;

  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<BackendErrorResponse>;
    const status = err.response?.status;

    const apiMessage =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      undefined;

    return new BackendApiError(
      apiMessage ?? `${fallbackMessage} (${status ?? "no status"})`,
      status,
      fallbackCode,
    );
  }

  if (e instanceof Error) {
    return new BackendApiError(e.message, undefined, fallbackCode);
  }

  return new BackendApiError(fallbackMessage, undefined, fallbackCode);
}
