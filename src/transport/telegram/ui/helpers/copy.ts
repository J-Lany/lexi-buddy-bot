import { escapeHtml } from "./html.js";

const h = (s: string) => escapeHtml(s);

export const copy = {
  ui: {
    common: {
      loading: "⌛️ Loading…",

      title: (icon: string, text: string) => `<b>${icon} ${h(text)}</b>`,
      hint: (text: string) => `💡 ${h(text)}`,

      section: (text: string) => `<b>${h(text)}</b>`,
      list: (items: readonly string[]) =>
        items.map((x) => `• ${h(x)}`).join("\n"),

      quote: (title: string, bodyHtml: string) =>
        `<blockquote expandable><i>${h(title)}</i>\n${bodyHtml}</blockquote>`,

      labels: {
        questionsCount: (n: number) => `Questions: <b>${n}</b>`,
        progress: (done: number, total: number) =>
          `Progress: <b>${done}/${total}</b>`,
        resultPercent: (pct: number) => `Result: <b>${pct}%</b>`,
      },

      text: {
        menu: "Home",
        lessons: "Lessons",
        profile: "Profile",
        help: "Help",
        assignment: "Task",
        review: "Review",
      },
    },

    home: {
      title: "Menu",
      greeting: (name?: string | null) => {
        const n = name?.trim();
        return n ? `Hi, ${h(n)} 👋` : "Hello 👋";
      },
      question: "What would you like to do?",
      hint: "Lessons and tasks will appear here when your teacher assigns them.",
    },

    help: {
      title: "Help",
      section: "Commands",
      commands: [
        "/start — menu",
        "/lessons — lessons",
        "/profile — profile",
        "/help — help",
      ],
      hint: "The Menu button near the input field is the fastest way.",
    },

    profile: {
      title: "Profile",
      labels: {
        name: "Name",
        username: "Username",
        level: "Level",
        age: "Age",
      },
    },

    lessons: {
      list: {
        title: (page: number, pages: number) =>
          pages > 1 ? `Lessons • ${page + 1}/${pages}` : "Lessons",

        emptyText: "Nothing here yet.",
        emptyHint: "Ask your teacher to assign a lesson.",

        choose: "Choose a lesson",
        pagingHint: "You can scroll the list using the buttons below.",
      },

      lesson: {
        emptyText: "There are no tasks in this lesson yet.",
        emptyHint: "If you expect tasks, ask your teacher.",
        chooseAssignment: "Choose a task",
        newLesson: "A new lesson has been assigned",
        openLesson: "Open the lesson to see the tasks",
      },
    },

    assignment: {
      title: "Task",

      intro: {
        ready: "Press <b>“🚀 Start”</b>.",

        howToAnswer: {
          mixed: "Sometimes choose an option, sometimes type your answer.",
          choice: "Choose the correct option using the buttons below.",
          text: "Type your answer in a message.",
          fallback: "Follow the instructions on the screen.",
        },

        byType: {
          definition_quiz: {
            title: "What does the phrase mean?",
            body: "Choose the correct definition.",
            exampleTitle: "Example",
            exampleBodyHtml: [
              `<b>Phrase:</b> break the ice`,
              `🇦 Say something funny to make people feel relaxed`,
              `🇧 Literally break something`,
              `🇨 Freeze water`,
              ``,
              `💡 <b>Correct answer:</b> 🇦 Say something funny to make people feel relaxed`,
            ].join("\n"),
          },

          gap_filling: {
            title: "Fill in the gap",
            body: "Write the missing word or phrase. You have <b>three attempts</b>.",
            exampleTitle: "Example",
            exampleBodyHtml: [
              `I don't <u>_____</u> mango.`,
              `<b>Answer:</b> like`,
            ].join("\n"),
          },

          phrase_fail: {
            title: "Find the incorrect sentence",
            body: "Three sentences use the same phrase. In one sentence it is <b>incorrect</b>. Type the number.",
            exampleTitle: "Example",
            exampleBodyHtml: [
              `<b>Phrase:</b> get up`,
              `1. I <b>get up</b> at 7 a.m.`,
              `2. He <b>get up</b> at 5 a.m. today.`,
              `3. She <b>gets up</b> early every day.`,
              ``,
              `<b>Answer:</b> 2`,
              `💡 <b>Correct:</b> He <b>gets up</b> at 5 a.m. today.`,
            ].join("\n"),
            note: "Tip: look at the verb form and word order.",
          },

          collocation_check: {
            title: "Find the common word",
            body: "Four phrases use the same word. Write that word.",
            exampleTitle: "Example",
            exampleBodyHtml: [
              `1. ____ a decision`,
              `2. ____ a living`,
              `3. ____ progress`,
              `4. ____ a sandwich`,
              ``,
              `<b>Answer:</b> <b>make</b>`,
              ``,
              `<i>Translation:</i>`,
              `make a decision — принять решение`,
              `make a living — зарабатывать на жизнь`,
              `make progress — делать успехи`,
              `make a sandwich — сделать сэндвич`,
            ].join("\n"),
          },
        } as const,

        fallbackExampleTitle: "Example",
        fallbackExampleBodyHtml: [
          `<b>Question:</b> What does “break the ice” mean?`,
          `🇦 Say something funny to make people feel relaxed`,
          `🇧 Literally break something`,
          `🇨 Freeze water`,
        ].join("\n"),
      },

      question: {
        header: (index: number, total: number) =>
          `<b>Question ${index}</b> <i>of ${total}</i>`,
        questionNotFound: "Question not found. Please open the task again.",
        textHintFirst: "✍️ <b>Type your answer</b> in a message.",
        textHintRetry: (attempt: number, max: number) =>
          `🙂 Try again <i>(${attempt}/${max})</i>.`,
      },

      feedback: {
        correct: "🌟 <b>Nice work.</b>",
        wrongChoice: "🙂 <b>Almost.</b>",

        wrongTryAgain: (attempt: number, max: number) =>
          `🙂 <b>Almost.</b> Try again <i>(${attempt}/${max})</i>.`,

        wrongNoMoreText: (attempt: number, max: number) =>
          `⏳ <b>No more tries for this question.</b> <i>(${attempt}/${max})</i>.`,

        correctAnswer: (answerText: string) =>
          `💡 The correct answer: <b>${h(answerText)}</b>`,

        explanationTitle: "💡 <b>Explanation</b>",
      },

      done: {
        title: "Done",
        saved: "Your answers are saved.",
        hint: "You can review each question step by step.",
      },

      submitError: {
        title: "We couldn’t send your answers",
        text: "Press <b>“Retry submit”</b> to continue.",
        hint: "If the error continues — finish the task. Your answers stay in the chat.",
        detailsTitle: "Details",
      },

      review: {
        title: "🔎 Review",
        unavailable: "Review is available after submitting answers.",
        blocks: {
          q: "Question",
          yours: "Your answer",
          correct: "Correct answer",
          explanationTitle: "💡 <b>Explanation</b>",
        },
      },

      sessionNotFound: "Task session not found. Please open the task again.",
    },

    start: {
      needReg: {
        title: (firstName: string) => `<b>👋 Hi, ${h(firstName)}!</b>`,
        text: "You will receive tasks from your teacher here.",
        hint: "Press “Join” to connect.",
      },

      registeredNoTeacher: {
        title: "Registration complete.",
        text: "This bot works together with your teacher, but you have not been added yet.",
        hint: "After your teacher connects you, lessons will appear here.",
      },

      activeStudent: {
        title: (firstName: string) => `<b>🌟 Hi, ${h(firstName)}!</b>`,
        text: "Your lessons and tasks are available in the menu.",
      },
    },

    registration: {
      cancelOk: "Ok. If you want to try again later, type /start.",
      inProgress:
        "You are in the connection process.\nPress the button below or /cancel to stop.",
      success: "🎉 Done.\n\nNow your teacher can find you and assign lessons.",
      failed: "Something went wrong while connecting.",
      reasonPrefix: "Reason:",
      tryAgain: "/start — try again",
      callbackOk: "Ok",
      cancelShort: "Ok. If you change your mind — type /start.",
    },

    invites: {
      errors: {
        cannotIdentifyUser: "Could not identify the user.",
        alreadyProcessed: "This request has already been processed.",
        notFound: "Request not found.",
        processFailed: "We couldn’t process the request.",
        reasonPrefix: "Reason:",
      },
      inFlight: "Just a moment…",
      accepted:
        "🎉 Request accepted.\n\nYour teacher can now assign tasks to you.",
      declined: "Ok. Request declined.",
    },

    notifications: {
      teacherRequest: {
        title: "Teacher request",
        teacherFallbackName: "Teacher",
        body: (teacherNameHtml: string) =>
          `<b>${teacherNameHtml}</b> wants to add you as a student.`,
        messagePrefix: "💬",
        hint: "Choose an action using the buttons below.",
      },
    },
  },

  kb: {
    nav: {
      back: "🔙 Back",
      menu: "🏠 Menu",
      backToLessons: "🔙 Lessons",
      openLesson: "🔎 Open lesson",
    },

    main: {
      lessons: "📖 My lessons",
      profile: "👤 Profile",
      help: "❓ Help",
    },

    reg: {
      join: "✨ Join",
      notNow: "Not now",
    },

    invites: {
      accept: "Accept",
      decline: "Decline",
    },

    assignment: {
      begin: "🚀 Start",
      retrySubmit: "Retry submit",
      finish: "🏁 Finish",
      toLesson: "📚 Lesson tasks",
      review: "🔎 Review answers",
    },

    lessonsPaging: {
      prev: "⬅️ Prev",
      next: "Next ➡️",
    },

    reviewPaging: {
      prev: "◀︎",
      next: "▶︎",
      toLesson: "📚 Lesson tasks",
      finish: "🏁 Finish",
    },
  },
} as const;

export type AssignmentTypeKey = keyof typeof copy.ui.assignment.intro.byType;
