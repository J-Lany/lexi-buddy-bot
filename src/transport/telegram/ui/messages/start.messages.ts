export function startNeedRegMessage(firstName: string) {
  return (
    `Привет, ${firstName}! 👋\n\n` +
    `Этот бот нужен, чтобы преподаватель мог:\n` +
    `• найти тебя в системе\n` +
    `• назначать уроки\n` +
    `• отправлять задания прямо сюда\n\n` +
    `Чтобы начать — нажми кнопку ниже 👇`
  );
}

export function startActiveStudentMessage(firstName: string) {
  return (
    `Привет, ${firstName}! ✅\n\n` +
    `Выбирай уроки и выполняй задания прямо здесь 🙂`
  );
}

export function startRegisteredNoTeacherMessage() {
  return (
    `✅ Ты зарегистрирован(а).\n\n` +
    `Пока у тебя нет активного преподавателя/группы.\n` +
    `Попроси у преподавателя приглашение — и задания появятся здесь 🙂`
  );
}
