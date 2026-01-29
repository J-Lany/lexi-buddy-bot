import type { StudentProfile } from "../../../../domain/profile/profile.service.js";
import { uiLabel, uiMessage } from "../helpers/ui.js";
import { copy } from "../helpers/copy.js";

export function profileMessage(p: StudentProfile) {
  const name =
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "—";

  const username = p.username ? `@${p.username}` : "—";
  const level = p.level ?? "—";
  const ageGroup = p.ageGroup ?? "—";

  return uiMessage([
    copy.ui.common.title("👤", copy.ui.profile.title),
    "",
    uiLabel(copy.ui.profile.labels.name, name),
    uiLabel(copy.ui.profile.labels.username, username),
    "",
    uiLabel(copy.ui.profile.labels.level, String(level)),
    uiLabel(copy.ui.profile.labels.age, String(ageGroup)),
  ]);
}
