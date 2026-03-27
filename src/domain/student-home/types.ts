export type StartView =
  | { type: "NEED_REG" }
  | { type: "REGISTERED_NO_TEACHER"; userId: number }
  | { type: "ACTIVE_STUDENT"; userId: number };

export type TelegramProfile = {
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
};
