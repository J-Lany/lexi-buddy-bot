import { StudentAssignmentStatus } from "../student-assignments/student-assignment-status.js";

export type StudentLessonListItem = {
  lessonId: number;
  title: string;
  level?: string | null;
  topic?: string | null;
};

export const ASSIGNMENT_TYPE_MAP = {
  definition_quiz: "Definition Quiz",
  gap_filling: "Gap Filling",
  phrase_fail: "Phrase Fail",
  collocation_check: "Collocation Check",
} as const;

export type AssignmentTypes = keyof typeof ASSIGNMENT_TYPE_MAP;

export type LessonAssignmentListItem = {
  assignmentId: number;
  type: AssignmentTypes;
  status: StudentAssignmentStatus;
  score?: number | null;
};
