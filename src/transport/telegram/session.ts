import type { RegistrationDraft } from "../../domain/registration/registration.types.js";

export type NavScreen =
  | { name: "lessons_list"; page?: number }
  | { name: "lesson"; lessonId: number }
  | { name: "assignment"; assignmentId: number }
  | { name: "profile" }
  | { name: "help" }
  | { name: "home" };

export type SessionData = {
  reg?: {
    draft: RegistrationDraft;
  };

  nav: {
    stack: NavScreen[];
  };

  ui: {
    screenMessageId?: number;
  };
};
