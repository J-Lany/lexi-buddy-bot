export class InviteAlreadyProcessedError extends Error {
  constructor() {
    super("Invite already processed");
    this.name = "InviteAlreadyProcessedError";
  }
}

export class InviteNotFoundError extends Error {
  constructor() {
    super("Invite not found");
    this.name = "InviteNotFoundError";
  }
}
