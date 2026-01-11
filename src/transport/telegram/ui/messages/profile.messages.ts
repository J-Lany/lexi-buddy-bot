import type { StudentProfile } from "../../../../domain/profile/profile.service.js";

export function profileMessage(p: StudentProfile) {
  const name =
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim() || "—";
  const username = p.username ? `@${p.username}` : "—";

  const lines = [
    `👤 Профиль`,
    ``,
    `Имя: ${name}`,
    `Username: ${username}`,
    `Уровень: ${p.level ?? "—"}`,
    `Возрастная группа: ${p.ageGroup ?? "—"}`,
  ];

  return lines.join("\n");
}
