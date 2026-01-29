import { InlineKeyboard } from "grammy";
import { copy } from "../helpers/copy.js";

export function teacherRequestKeyboard(inviteId: number) {
  return new InlineKeyboard()
    .text(copy.kb.invites.accept, `invite_accept:${inviteId}`)
    .text(copy.kb.invites.decline, `invite_decline:${inviteId}`);
}
