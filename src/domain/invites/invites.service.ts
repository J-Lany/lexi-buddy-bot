import type { BackendApiService } from "../../infra/backend-api/backend-api.service.js";
import {
  InviteAlreadyAcceptedError as ApiInviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError as ApiInviteAlreadyDeclinedError,
  InviteNotFoundError as ApiInviteNotFoundError,
} from "../../infra/backend-api/backend-api.errors.js";

import {
  InviteAlreadyAcceptedError,
  InviteAlreadyDeclinedError,
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
      if (e instanceof ApiInviteAlreadyAcceptedError) {
        throw new InviteAlreadyAcceptedError();
      }
      if (e instanceof ApiInviteAlreadyDeclinedError) {
        throw new InviteAlreadyDeclinedError();
      }
      if (e instanceof ApiInviteNotFoundError) {
        throw new InviteNotFoundError();
      }
      throw e;
    }
  }
}
