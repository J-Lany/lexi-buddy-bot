import type { LessonsService } from "../../../domain/lessons/lessons.service.js";
import type { ProfileService } from "../../../domain/profile/profile.service.js";
import type { StudentAssignmentsService } from "../../../domain/student-assignments/student-assignments.service.js";

export type RoutesDeps = {
  lessons: LessonsService;
  profile: ProfileService;
  studentAssignments: StudentAssignmentsService;
};
