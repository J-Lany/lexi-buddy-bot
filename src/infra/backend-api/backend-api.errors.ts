export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

export class InviteAlreadyProcessedError extends BackendApiError {
  constructor() {
    super("Invite already processed", 409, "INVITE_ALREADY_PROCESSED");
    this.name = "InviteAlreadyProcessedError";
  }
}

export class InviteNotFoundError extends BackendApiError {
  constructor() {
    super("Invite not found", 404, "INVITE_NOT_FOUND");
    this.name = "InviteNotFoundError";
  }
}

export type BackendErrorResponse = {
  message?: string;
  error?: string;
};
