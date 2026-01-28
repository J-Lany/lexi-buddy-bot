export type StartView =
  | { type: "NEED_REG" }
  | { type: "REGISTERED_NO_TEACHER" }
  | { type: "ACTIVE_STUDENT" };

export type TelegramProfile = {
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
};
