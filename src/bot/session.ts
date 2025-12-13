import type {
  RegistrationDraft,
  RegistrationStep,
} from "../domain/registration/registration.types.js";

export type SessionData = {
  reg?: {
    step: RegistrationStep;
    draft: RegistrationDraft;
  };
};
