import { StudentAssignmentStatus } from "../student-assignments/student-assignment-status.js";

export type StudentLessonListItem = {
  lessonId: number;
  title: string;
  level?: string | null;
  topic?: string | null;
};

export type LessonAssignmentListItem = {
  assignmentId: number;
  type: string;
  status: StudentAssignmentStatus;
  score?: number | null;
};
