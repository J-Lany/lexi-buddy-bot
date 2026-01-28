export function startNeedRegMessage(firstName: string) {
  return [
    `Привет, ${firstName}! 👋`,
    "",
    "Я помогу получать задания от преподавателя прямо в этом чате.",
    "",
    "Нажми кнопку ниже, чтобы подключиться.",
  ].join("\n");
}

export function startRegisteredNoTeacherMessage() {
  return [
    "Ты уже подключён(а) ✅",
    "",
    "Пока нет активной группы с преподавателем — поэтому уроки ещё не появились.",
    "",
    "Попроси у преподавателя приглашение, и всё появится автоматически 🙂",
  ].join("\n");
}

export function startActiveStudentMessage(firstName: string) {
  return [
    `Привет, ${firstName}! ✅`,
    "",
    "Готово. Уроки и задания доступны в меню.",
  ].join("\n");
}
