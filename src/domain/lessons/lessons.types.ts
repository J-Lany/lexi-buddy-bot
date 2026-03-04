import { StudentAssignmentStatus } from "../student-assignments/student-assignment-status.js";
import type { AssignmentTypes } from "../../infra/backend-api/backend-api.types.js";

export type StudentLessonListItem = {
  lessonId: number;
  title: string;
  level?: string | null;
  topic?: string | null;
};

export type LessonAssignmentListItem = {
  assignmentId: number;
  type: AssignmentTypes;
  status: StudentAssignmentStatus;
  score?: number | null;
};
