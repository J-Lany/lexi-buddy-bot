import { InlineKeyboard } from "grammy";

export function teacherRequestKeyboard(inviteId: number) {
  return new InlineKeyboard()
    .text("✅ Принять", `invite_accept:${inviteId}`)
    .text("❌ Отклонить", `invite_decline:${inviteId}`);
}
