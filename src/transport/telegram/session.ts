import type { RegistrationDraft } from "../../domain/registration/registration.types.js";

export type SessionData = {
  reg?: {
    draft: RegistrationDraft;
  };
};
