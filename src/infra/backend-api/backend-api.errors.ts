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

export class InviteAlreadyAcceptedError extends BackendApiError {
  constructor() {
    super(
      "Teacher request already accepted",
      409,
      "TEACHER_REQUEST_ALREADY_ACCEPTED",
    );
    this.name = "InviteAlreadyAcceptedError";
  }
}

export class InviteAlreadyDeclinedError extends BackendApiError {
  constructor() {
    super(
      "Teacher request already declined",
      409,
      "TEACHER_REQUEST_ALREADY_DECLINED",
    );
    this.name = "InviteAlreadyDeclinedError";
  }
}

export class InviteNotFoundError extends BackendApiError {
  constructor() {
    super("Invite not found", 404, "TEACHER_REQUEST_NOT_FOUND");
    this.name = "InviteNotFoundError";
  }
}

export type BackendErrorResponse = {
  code?: string;
  requestId?: string;
  message?: string;
  error?: string;
};
