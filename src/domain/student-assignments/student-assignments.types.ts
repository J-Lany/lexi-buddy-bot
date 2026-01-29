import type {
  InternalStartAssignmentResponseDto,
  SubmitAssignmentRequestDto,
  SubmitAssignmentResponseDto,
} from "../../infra/backend-api/backend-api.types.js";

export type StartedAttempt = InternalStartAssignmentResponseDto;

export type SubmitAttemptInput = SubmitAssignmentRequestDto;

export type SubmitAttemptOutput = SubmitAssignmentResponseDto;
