import { InlineKeyboard } from "grammy";
import type { Translator } from "../helpers/copy.js";

export function teacherRequestKeyboard(t: Translator, inviteId: number) {
  return new InlineKeyboard()
    .text(t("kb-accept"), `invite_accept:${inviteId}`)
    .text(t("kb-decline"), `invite_decline:${inviteId}`);
}
