import type {
  InternalStartAssignmentResponseDto,
  SubmitAssignmentRequestDto,
  SubmitAssignmentResponseDto,
} from "../../infra/backend-api/backend-api.types.js";

export type StartedAttempt = InternalStartAssignmentResponseDto;

export type SubmitAttemptInput = SubmitAssignmentRequestDto;

export type SubmitAttemptOutput = SubmitAssignmentResponseDto;

export type AssignmentPreview = {
  assignmentId: number;
  type?: string | null;
  questionsCount: number;
  lesson?: {
    lessonId: number;
    title: string;
    level?: string | null;
    ageCategory?: string | null;
    topic?: string | null;
  } | null;
};
