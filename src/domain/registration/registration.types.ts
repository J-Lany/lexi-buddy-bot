export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type AgeGroup = "UNDER_18" | "BETWEEN_18_35" | "OVER_35";

export const RegistrationStep = {
  ASK_AGE_GROUP: "ASK_AGE_GROUP",
} as const;

export type RegistrationStep =
  (typeof RegistrationStep)[keyof typeof RegistrationStep];

export type RegistrationDraft = {
  telegramId: number;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
  level?: Level;
  ageGroup?: AgeGroup;
};

export function isAgeGroup(v: string): v is AgeGroup {
  return v === "UNDER_18" || v === "BETWEEN_18_35" || v === "OVER_35";
}
