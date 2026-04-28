import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type {
  LessonAssignmentListItem,
  StudentLessonListItem,
} from "./lessons.types.js";

export class LessonsService {
  constructor(private readonly backend: BackendApiService) {}

  async listForStudent(telegramId: number): Promise<StudentLessonListItem[]> {
    const res = await this.backend.getStudentLessons(telegramId);
    return (res.items ?? []).map((x) => ({
      lessonId: x.lessonId,
      title: x.title,
      targetLanguage: x.targetLanguage,
      nativeLanguage: x.nativeLanguage,
      level: x.level ?? null,
      topic: x.topic ?? null,
    }));
  }

  async listAssignmentsForStudent(
    telegramId: number,
    lessonId: number,
  ): Promise<LessonAssignmentListItem[]> {
    const res = await this.backend.getLessonAssignments(telegramId, lessonId);
    return res.items ?? [];
  }
}
