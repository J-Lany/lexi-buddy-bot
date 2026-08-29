export class InviteAlreadyAcceptedError extends Error {
  constructor() {
    super("Teacher request already accepted");
    this.name = "InviteAlreadyAcceptedError";
  }
}

export class InviteAlreadyDeclinedError extends Error {
  constructor() {
    super("Teacher request already declined");
    this.name = "InviteAlreadyDeclinedError";
  }
}

export class InviteNotFoundError extends Error {
  constructor() {
    super("Invite not found");
    this.name = "InviteNotFoundError";
  }
}
