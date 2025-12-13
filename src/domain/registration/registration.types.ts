export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type AgeGroup = "UNDER_18" | "BETWEEN_18_35" | "OVER_35";

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
