import { StudentAssignmentStatus } from "../../domain/student-assignments/student-assignment-status.js";

export type GetStudentProfileResponse = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  level?: string | null;
  ageGroup?: string | null;
  groupsCount?: number | null;
};

export type GetStudentLessonsResponse = {
  items: Array<{
    lessonId: number;
    title: string;
    level?: string | null;
    topic?: string | null;
    archived?: boolean;
  }>;
};

export type GetLessonAssignmentsResponse = {
  items: Array<{
    assignmentId: number;
    type: string;
    status: StudentAssignmentStatus;
    score?: number | null;
  }>;
};

export type InternalAssignmentQuestionAnswerDto = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type InternalAssignmentQuestionDto = {
  id: number;
  text: string;
  questionType: string;
  explanation: string | null;
  answers: InternalAssignmentQuestionAnswerDto[];
};

export type InternalAssignmentDto = {
  assignmentId: number;
  type: string;
  lesson: {
    lessonId: number;
    title: string;
    level: string | null;
    ageCategory: string | null;
    topic: string | null;
  };
  questions: InternalAssignmentQuestionDto[];
};

export type AttemptsPolicyDto = {
  maxAttempts: number;
  showCorrectOnAttempt: number;
  appliesToQuestionTypes: string[];
};

export type InternalAssignmentPreviewResponseDto = {
  assignment: InternalAssignmentDto;
};

export type InternalStartAssignmentResponseDto = {
  studentAssignmentId: number;
  attemptNo: number;
  status: string;
  attemptsPolicy: AttemptsPolicyDto;
  assignment: InternalAssignmentDto;
};

export type SubmitAttemptDto = {
  attempt: number;
  answer?: unknown;
  isCorrect?: boolean;
  responseTimeMs?: number;
};

export type SubmitQuestionResultDto = {
  questionId: number;
  attempts: SubmitAttemptDto[];
};

export type SubmitAssignmentRequestDto = {
  telegramId: number;
  studentAssignmentId: number;
  clientSessionId?: string;
  results: SubmitQuestionResultDto[];
};

export type SubmitAssignmentResponseDto = {
  ok: boolean;
  studentAssignmentId: number;
  savedAttempts: number;
  score: number | null;
  status: string;
};
