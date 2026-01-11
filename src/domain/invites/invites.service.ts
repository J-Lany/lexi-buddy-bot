import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import {
  InviteAlreadyProcessedError as ApiInviteAlreadyProcessedError,
  InviteNotFoundError as ApiInviteNotFoundError,
} from "../../infra/backend-api/backend-api.errors.js";

import {
  InviteAlreadyProcessedError,
  InviteNotFoundError,
} from "./invites.errors.js";

export class InvitesService {
  constructor(private readonly backend: BackendApiService) {}

  async respond(params: {
    inviteId: number;
    telegramId: number;
    accept: boolean;
  }) {
    try {
      return await this.backend.respondToTeacherRequestFromTelegram(params);
    } catch (e: unknown) {
      if (e instanceof ApiInviteAlreadyProcessedError) {
        throw new InviteAlreadyProcessedError();
      }
      if (e instanceof ApiInviteNotFoundError) {
        throw new InviteNotFoundError();
      }
      throw e;
    }
  }
}
