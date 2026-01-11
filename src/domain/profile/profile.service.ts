import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";

export type StudentProfile = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  level?: string | null;
  ageGroup?: string | null;
  groupsCount?: number | null;
};

export class ProfileService {
  constructor(private readonly backend: BackendApiService) {}

  async get(telegramId: number): Promise<StudentProfile> {
    return await this.backend.getStudentProfile(telegramId);
  }
}
