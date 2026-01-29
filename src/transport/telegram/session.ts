import type { RegistrationDraft } from "../../domain/registration/registration.types.js";
import type { InternalAssignmentDto } from "../../infra/backend-api/backend-api.types.js";
import type { SubmitAttemptDto } from "../../infra/backend-api/backend-api.types.js";

export type NavScreen =
  | { name: "home" }
  | { name: "lessons_list"; page: number }
  | { name: "lesson"; lessonId: number }
  | { name: "assignment_intro"; assignmentId: number }
  | { name: "assignment_question" }
  | { name: "assignment_done" }
  | { name: "assignment_review"; page: number }
  | { name: "profile" }
  | { name: "help" };

export type AssignmentRunState = {
  clientSessionId: string;

  assignmentId: number;
  lessonId: number;

  studentAssignmentId: number;
  attemptNo: number;

  attemptsPolicy: {
    maxAttempts: number;
    showCorrectOnAttempt: number;
    appliesToQuestionTypes: string[];
  } | null;

  assignment: InternalAssignmentDto;

  index: number;
  shownAt: number;

  startInFlight: boolean;
  nextInFlight: boolean;
  submitInFlight: boolean;

  submitted: boolean;

  results: Record<
    number,
    {
      attempts: Array<{
        attempt: number;
        answer: SubmitAttemptDto["answer"];
        isCorrect: boolean;
        responseTimeMs: number | null;
      }>;
    }
  >;

  ui?: {
    feedbackText?: string | null;
    canGoNext?: boolean;
  };
};

export type SessionData = {
  reg?: {
    draft: RegistrationDraft;
  };

  nav: {
    stack: NavScreen[];
  };

  ui: {
    screenMessageId?: number;
    bannerText?: string | null;
    lessonsById?: Record<
      number,
      { title: string; topic: string | null; level: string | null }
    >;
  };

  assignmentRun?: AssignmentRunState | null;

  assignmentLastScore?: number | null;
  assignmentSubmittedAt?: number;

  assignmentSubmitError?: { message: string } | null;
};
