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
  | { name: "help" };

export type AssignmentRunState = {
  clientSessionId: string;

  assignmentId: number;
  lessonId: number;
  attemptId: number;

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
  userId?: number | null | undefined;

  reg?:
    | {
        draft: RegistrationDraft;
      }
    | undefined;

  nav: {
    stack: NavScreen[];
  };

  ui: {
    screenMessageId?: number | undefined;
    bannerText?: string | null | undefined;
    lessonsById?:
      | Record<
          number,
          {
            title: string;
            targetLanguage: string;
            nativeLanguage: string;
            topic: string | null;
            level: string | null;
          }
        >
      | undefined;
  };

  assignmentRun?: AssignmentRunState | null | undefined;

  assignmentLastScore?: number | null | undefined;
  assignmentSubmittedAt?: number | undefined;

  assignmentSubmitError?: { message: string } | null | undefined;
};
