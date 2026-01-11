import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";

export type StudentLessonListItem = {
  lessonId: number;
  title: string;
  level?: string | null;
  topic?: string | null;
};

export class LessonsService {
  constructor(private readonly backend: BackendApiService) {}

  async listForStudent(telegramId: number): Promise<StudentLessonListItem[]> {
    const res = await this.backend.getStudentLessons(telegramId);
    return (res.items ?? []).map((x) => ({
      lessonId: x.lessonId,
      title: x.title,
      level: x.level ?? null,
      topic: x.topic ?? null,
    }));
  }
}
