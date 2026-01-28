import type { StudentProfile } from "../../../../domain/profile/profile.service.js";
import { uiLabel, uiMessage, uiTitle } from "../helpers/ui.js";

export function profileMessage(p: StudentProfile) {
  const name =
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "—";

  const username = p.username ? `@${p.username}` : "—";
  const level = p.level ?? "—";
  const ageGroup = p.ageGroup ?? "—";

  return uiMessage([
    uiTitle("👤", "Профиль"),
    "",
    uiLabel("Имя", name),
    uiLabel("Username", username),
    "",
    uiLabel("Уровень", String(level)),
    uiLabel("Возраст", String(ageGroup)),
  ]);
}
