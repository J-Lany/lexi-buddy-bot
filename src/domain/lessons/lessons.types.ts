export type StudentLessonListItem = {
  lessonId: number;
  title: string;
  targetLanguage: string;
  nativeLanguage: string;
  level: string | null;
  topic: string | null;
};

export type LessonAssignmentListItem = {
  assignmentId: number;
  type: string;
  status: string | null;
  score: number | null;
};
