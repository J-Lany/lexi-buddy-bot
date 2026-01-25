import { StudentAssignmentStatus } from "../../domain/student-assignments/student-assignment-status.js";

export type GetStudentProfileResponse = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  level?: string | null;
  ageGroup?: string | null;
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
