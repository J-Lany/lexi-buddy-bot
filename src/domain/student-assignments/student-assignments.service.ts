import { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import type { InternalAssignmentDto } from "../../infra/backend-api/backend-api.types.js";
import type {
  StartedAttempt,
  SubmitAttemptInput,
  SubmitAttemptOutput,
} from "./student-assignments.types.js";

export class StudentAssignmentsService {
  constructor(private readonly api: BackendApiService) {}

  async preview(
    telegramId: number,
    assignmentId: number,
  ): Promise<InternalAssignmentDto> {
    const res = await this.api.getAssignmentPreview(telegramId, assignmentId);
    return res.assignment;
  }

  start(telegramId: number, assignmentId: number): Promise<StartedAttempt> {
    return this.api.startAssignmentAttempt(telegramId, assignmentId);
  }

  submit(input: SubmitAttemptInput): Promise<SubmitAttemptOutput> {
    return this.api.submitAssignmentAttempt(input);
  }
}
