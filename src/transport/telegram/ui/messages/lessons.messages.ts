export function lessonsHeader(count: number) {
  return count > 0
    ? `📖 Твои уроки (${count})`
    : `📖 У тебя пока нет уроков.\n\nПопроси преподавателя назначить тебе урок 🙂`;
}
