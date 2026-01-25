import type { StudentProfile } from "../../../../domain/profile/profile.service.js";

export function profileMessage(p: StudentProfile) {
  const name =
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "—";

  const username = p.username ? `@${p.username}` : "—";
  const level = p.level ?? "—";
  const ageGroup = p.ageGroup ?? "—";

  return [
    "👤 Профиль",
    "",
    `🧑 ${name}`,
    "",
    `🔗 ${username}`,
    "",
    `📚 Уровень · ${level}`,
    `🎯 Возраст · ${ageGroup}`,
  ].join("\n");
}
