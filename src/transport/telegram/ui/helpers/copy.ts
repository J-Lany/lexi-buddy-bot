import { escapeHtml } from "./html.js";

const h = (s: string) => escapeHtml(s);

/**
 * UI Copy — единый источник истины.
 *
 * Правила:
 * - Любая динамика экранируется здесь.
 * - UI (HTML) и KB (plain text) разделены.
 * - Один термин = одно действие (никаких “Домой” рядом с “Меню”).
 * - Без определения рода (“Готов(а)”) — формулировки нейтральные.
 */
export const copy = {
  ui: {
    common: {
      loading: "⌛️ Загружаю…",

      title: (icon: string, text: string) => `<b>${icon} ${h(text)}</b>`,
      hint: (text: string) => `💡 ${h(text)}`,

      section: (text: string) => `<b>${h(text)}</b>`,
      list: (items: readonly string[]) =>
        items.map((x) => `• ${h(x)}`).join("\n"),

      quote: (title: string, bodyHtml: string) =>
        `<blockquote expandable><i>${h(title)}</i>\n${bodyHtml}</blockquote>`,

      labels: {
        questionsCount: (n: number) => `Вопросов: <b>${n}</b>`,
        progress: (done: number, total: number) =>
          `Прогресс: <b>${done}/${total}</b>`,
        resultPercent: (pct: number) => `Результат: <b>${pct}%</b>`,
      },

      text: {
        menu: "Главная",
        lessons: "Уроки",
        profile: "Профиль",
        help: "Помощь",
        assignment: "Задание",
        review: "Разбор",
      },
    },

    home: {
      title: "Меню",
      greeting: (name?: string | null) => {
        const n = name?.trim();
        return n ? `Привет, ${h(n)} 👋` : "Привет привет👋";
      },
      question: "Что хочешь сделать?",
      hint: "Уроки и задания появятся здесь, когда преподаватель их назначит.",
    },

    help: {
      title: "Помощь",
      section: "Команды",
      commands: [
        "/start — меню",
        "/lessons — уроки",
        "/profile — профиль",
        "/help — помощь",
      ],
      hint: "Кнопка Menu рядом с полем ввода — самый быстрый путь.",
    },

    profile: {
      title: "Профиль",
      labels: {
        name: "Имя",
        username: "Юзернейм",
        level: "Уровень",
        age: "Возраст",
      },
    },

    lessons: {
      list: {
        title: (page: number, pages: number) =>
          pages > 1 ? `Уроки • ${page + 1}/${pages}` : "Уроки",

        emptyText: "Пока тут пусто.",
        emptyHint: "Попроси преподавателя назначить урок.",

        choose: "Выбери урок",
        pagingHint: "Можно пролистать список кнопками ниже.",
      },

      lesson: {
        emptyText: "В этом уроке пока нет заданий.",
        emptyHint: "Если ожидаешь задания — уточни у преподавателя.",
        chooseAssignment: "Выбери задание",
        newLesson: "Назначен новый урок",
        openLesson: "Открой урок, чтобы посмотреть задания",
      },
    },

    assignment: {
      title: "Задание",

      intro: {
        ready: "Нажми <b>«🚀 Начать»</b>.",

        howToAnswer: {
          mixed: "Где-то выбери вариант, где-то — напиши ответ.",
          choice: "Выбирай вариант кнопками ниже.",
          text: "Напиши ответ сообщением.",
          fallback: "Следуй подсказкам на экране.",
        },

        byType: {
          definition_quiz: {
            title: "Что значит фраза",
            body: "Выбери правильное определение.",
            exampleTitle: "Пример",
            exampleBodyHtml: [
              `<b>Фраза:</b> break the ice`,
              `🇦 Say something funny to make people feel relaxed`,
              `🇧 Literally break something`,
              `🇨 Freeze water`,
              ``,
              `✅ <b>Правильный ответ:</b> 🇦 Say something funny to make people feel relaxed`,
            ].join("\n"),
          },

          gap_filling: {
            title: "Вставь пропуск",
            body: "Впиши слово или фразу. На каждое предложение — <b>три попытки</b>.",
            exampleTitle: "Пример",
            exampleBodyHtml: [
              `I don't <u>_____</u> mango.`,
              `<b>Ответ:</b> like`,
            ].join("\n"),
          },

          phrase_fail: {
            title: "Найди неверное предложение",
            body: "Три предложения с одной фразой. В одном она использована <b>неправильно</b>. Напиши номер.",
            exampleTitle: "Пример",
            exampleBodyHtml: [
              `<b>Фраза:</b> get up`,
              `1. I <b>get up</b> at 7 a.m.`,
              `2. He <b>get up</b> at 5 a.m. today.`,
              `3. She <b>gets up</b> early every day.`,
              ``,
              `<b>Ответ:</b> 2`,
              `✅ <b>Правильно:</b> He <b>gets up</b> at 5 a.m. today.`,
            ].join("\n"),
            note: "Подсказка: обрати внимание на форму глагола и порядок слов.",
          },

          collocation_check: {
            title: "Найди общее слово",
            body: "Четыре словосочетания с одним словом. Напиши это слово.",
            exampleTitle: "Пример",
            exampleBodyHtml: [
              `1. ____ a decision`,
              `2. ____ a living`,
              `3. ____ progress`,
              `4. ____ a sandwich`,
              ``,
              `<b>Ответ:</b> <b>make</b>`,
              ``,
              `<i>Перевод:</i>`,
              `make a decision — принять решение`,
              `make a living — зарабатывать на жизнь`,
              `make progress — делать успехи`,
              `make a sandwich — сделать сэндвич`,
            ].join("\n"),
          },
        } as const,

        fallbackExampleTitle: "Пример",
        fallbackExampleBodyHtml: [
          `<b>Вопрос:</b> What does “break the ice” mean?`,
          `🇦 Say something funny to make people feel relaxed`,
          `🇧 Literally break something`,
          `🇨 Freeze water`,
        ].join("\n"),
      },

      question: {
        header: (index: number, total: number) =>
          `<b>Вопрос ${index}</b> <i>из ${total}</i>`,
        questionNotFound: "Вопрос не найден. Открой задание заново.",
        textHintFirst: "✍️ <b>Напиши ответ</b> сообщением.",
        textHintRetry: (attempt: number, max: number) =>
          `✍️ Попробуй ещё раз <i>(${attempt}/${max})</i>.`,
      },

      feedback: {
        correct: "✨ <b>Верно.</b>",
        wrongChoice: "🙂 <b>Не совсем.</b>",

        wrongTryAgain: (attempt: number, max: number) =>
          `🙂 <b>Не совсем.</b> Попробуй ещё раз <i>(${attempt}/${max})</i>.`,

        wrongNoMoreText: (attempt: number, max: number) =>
          `⏳ <b>Больше попыток нет.</b> <i>(${attempt}/${max})</i>.`,

        correctAnswer: (answerText: string) =>
          `🔎 Правильный ответ: <b>${h(answerText)}</b>`,

        explanationTitle: "💡 <b>Пояснение</b>",
      },

      done: {
        title: "Готово",
        saved: "Ответы сохранены.",
        hint: "Хочешь — разберём ответы по шагам.",
      },

      submitError: {
        title: "Не удалось отправить ответы",
        text: "Нажми <b>«Повторить отправку»</b> — и продолжим.",
        hint: "Если ошибка повторяется — заверши. Ответы останутся в чате.",
        detailsTitle: "Детали",
      },

      review: {
        title: "🔎 Разбор",
        unavailable: "Разбор доступен после отправки ответов.",
        blocks: {
          q: "Вопрос",
          yours: "Твой ответ",
          correct: "Правильный ответ",
          explanationTitle: "🧠 <b>Пояснение</b>",
        },
      },
      sessionNotFound: "Сессия задания не найдена. Открой задание заново.",
    },

    start: {
      needReg: {
        title: (firstName: string) => `<b>👋 Привет, ${h(firstName)}!</b>`,
        text: "Я помогу получать задания от преподавателя прямо в этом чате.",
        hint: "Нажми «Присоединиться», чтобы подключиться.",
      },

      registeredNoTeacher: {
        title: "Регистрация завершена.",
        text: "Этот бот работает вместе с преподавателем, сейчас тебя ещё не добавили.",
        hint: "После подключения преподаватель сможет назначать здесь уроки.",
      },

      activeStudent: {
        title: (firstName: string) => `<b>✅ Привет, ${h(firstName)}!</b>`,
        text: "Уроки и задания доступны в меню.",
      },
    },

    registration: {
      cancelOk: "Ок. Если захочешь снова — напиши /start.",
      inProgress:
        "Ты в процессе подключения.\nНажми кнопку ниже или /cancel, чтобы отменить.",
      success:
        "✅ Готово.\n\nТеперь преподаватель сможет найти тебя и назначить уроки.",
      failed: "⚠️ Не получилось подключиться.",
      reasonPrefix: "Причина:",
      tryAgain: "/start — попробовать снова",
      callbackOk: "Ок",
      cancelShort: "Ок. Если передумаешь — напиши /start.",
    },
    invites: {
      errors: {
        cannotIdentifyUser: "Не удалось определить пользователя.",
        alreadyProcessed: "Этот запрос уже обработан.",
        notFound: "Запрос не найден.",
        processFailed: "⚠️ Не получилось обработать запрос.",
        reasonPrefix: "Причина:",
      },
      inFlight: "Минутку…",
      accepted:
        "✔ Запрос принят.\n\nТеперь преподаватель сможет назначать тебе задания.",
      declined: "Ок. Запрос отклонён.",
    },
    notifications: {
      teacherRequest: {
        title: "Запрос от преподавателя",
        teacherFallbackName: "Преподаватель",
        body: (teacherNameHtml: string) =>
          `<b>${teacherNameHtml}</b> хочет добавить тебя как студента.`,
        messagePrefix: "💬",
        hint: "Выбери действие кнопками ниже.",
      },
    },
  },

  kb: {
    nav: {
      back: "🔙️ Назад",
      menu: "🏠 Меню",
      backToLessons: "🔙️ К урокам",
      openLesson: "🔎 Посмотреть урок",
    },

    main: {
      lessons: "📖 Мои уроки",
      profile: "👤 Профиль",
      help: "❓ Помощь",
    },

    reg: {
      join: "✨ Присоединиться",
      notNow: "❌ Не сейчас",
    },

    invites: {
      accept: "✅ Принять",
      decline: "❌ Отклонить",
    },

    assignment: {
      begin: "🚀 Начать",
      retrySubmit: "🔄 Повторить отправку",
      finish: "🏁 Завершить",
      toLesson: "📚 К заданиям урока",
      review: "🔎 Разобрать ответы",
    },

    lessonsPaging: {
      prev: "⬅️ Пред.",
      next: "След. ➡️",
    },

    reviewPaging: {
      prev: "◀︎",
      next: "▶︎",
      toLesson: "📚 К заданиям урока",
      finish: "🏁 Завершить",
    },
  },
} as const;

export type AssignmentTypeKey = keyof typeof copy.ui.assignment.intro.byType;
