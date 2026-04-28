export type GetStudentProfileResponse = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  level: string | null;
  ageGroup: string | null;
  groupsCount: number;
};

export type GetStudentLessonsResponse = {
  items: Array<{
    lessonId: number;
    title: string;
    targetLanguage: string;
    nativeLanguage: string;
    level: string | null;
    topic: string | null;
  }>;
};

export type GetLessonAssignmentsResponse = {
  items: Array<{
    assignmentId: number;
    type: string;
    status: string | null;
    score: number | null;
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

export type AssignmentVocabItemDto = {
  term: string;
  translation?: string | null;
  synonyms?: string[] | null;
};

export type InternalAssignmentDto = {
  assignmentId: number;
  type: string;
  lesson: {
    lessonId: number;
    title: string;
    targetLanguage: string;
    nativeLanguage: string;
    instructionLanguage: string;
    level: string | null;
    ageCategory: string | null;
    topic: string | null;
  };
  questions: InternalAssignmentQuestionDto[];
  vocab: AssignmentVocabItemDto[];
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
  attemptId: number;
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
  attemptId: number;
  clientSessionId?: string;
  results: SubmitQuestionResultDto[];
};

export type SubmitAssignmentResponseDto = {
  ok: true;
  attemptId: number;
  savedAttempts: number;
  score: number | null;
  status: string;
};
