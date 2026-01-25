import type { RegistrationDraft } from "../../domain/registration/registration.types.js";

export type NavScreen =
  | { name: "lessons_list" }
  | { name: "lesson"; lessonId: number }
  | { name: "assignment"; assignmentId: number }
  | { name: "profile" }
  | { name: "help" };

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
