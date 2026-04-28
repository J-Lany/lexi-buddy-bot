# Common
loading = ⌛️ Загрузка…
questions-count = Вопросов: <b>{ $n }</b>
progress = Прогресс: <b>{ $done }/{ $total }</b>
result-percent = Результат: <b>{ $pct }%</b>
nav-home = Главная
nav-lessons = Уроки
nav-help = Помощь
nav-assignment = Задание
nav-review = Разбор

# Home
home-title = 🏠 <b>Меню</b>
home-greeting = Привет 👋
home-greeting-named = Привет, { $name } 👋
home-question = Что хочешь сделать?
home-hint = 💡 Уроки и задания появятся здесь, когда преподаватель их назначит.

# Help
help-title = ❓ <b>Помощь</b>
help-section = <b>Команды</b>
help-commands =
    /start — меню
    /lessons — уроки
    /help — помощь
help-hint = 💡 Кнопка «Меню» рядом с полем ввода — самый быстрый способ.

# Lessons list
lessons-list-title = 📖 <b>Уроки</b>
lessons-list-title-paged = 📖 <b>Уроки • { $page }/{ $pages }</b>
lessons-list-empty = Здесь пока ничего нет.
lessons-list-empty-hint = 💡 Попроси преподавателя назначить урок.
lessons-list-choose = Выбери урок
lessons-list-paging-hint = 💡 Листай список с помощью кнопок ниже.

# Lesson
lesson-empty = В этом уроке пока нет заданий.
lesson-empty-hint = 💡 Если ждёшь задания — уточни у преподавателя.
lesson-choose = Выбери задание
lesson-new = Назначен новый урок
lesson-open = 💡 Открой урок, чтобы увидеть задания

# Assignment intro
assignment-title = 📝 <b>Задание</b>
assignment-vocab-title = <b>Словарь</b>
assignment-vocab-synonyms-label = Синонимы:
assignment-ready = Нажми <b>«🚀 Начать»</b>.
assignment-how-prefix = Как отвечать:
assignment-how-mixed = Иногда выбирай вариант, иногда вводи ответ текстом.
assignment-how-choice = Выбери правильный вариант с помощью кнопок ниже.
assignment-how-text = Введи ответ в сообщении.
assignment-how-fallback = Следуй инструкциям на экране.
assignment-fallback-example-title = Пример
assignment-fallback-example-body =
    <b>Вопрос:</b> What does "break the ice" mean?
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

# Assignment types
type-definition-quiz-title = Что означает выражение?
type-definition-quiz-body = Выбери правильное определение.
type-definition-quiz-example-title = Пример
type-definition-quiz-example-body =
    <b>Фраза:</b> break the ice
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

    💡 <b>Правильный ответ:</b> 🇦 Say something funny to make people feel relaxed
type-definition-quiz-note = { "" }

type-gap-filling-title = Заполни пропуск
type-gap-filling-body = Напиши пропущенное слово или фразу. У тебя <b>три попытки</b>.
type-gap-filling-example-title = Пример
type-gap-filling-example-body =
    I don't <u>_____</u> mango.
    <b>Ответ:</b> like
type-gap-filling-note = { "" }

type-phrase-fail-title = Найди неправильное предложение
type-phrase-fail-body = Три предложения используют одну фразу. В одном она <b>неправильная</b>. Введи номер.
type-phrase-fail-example-title = Пример
type-phrase-fail-example-body =
    <b>Фраза:</b> get up
    1. I <b>get up</b> at 7 a.m.
    2. He <b>get up</b> at 5 a.m. today.
    3. She <b>gets up</b> early every day.

    <b>Ответ:</b> 2
    💡 <b>Правильно:</b> He <b>gets up</b> at 5 a.m. today.
type-phrase-fail-note = 💡 Подсказка: обращай внимание на форму глагола и порядок слов.

type-collocation-check-title = Найди общее слово
type-collocation-check-body = Четыре фразы используют одно слово. Напиши это слово.
type-collocation-check-example-title = Пример
type-collocation-check-example-body =
    1. ____ a decision
    2. ____ a living
    3. ____ progress
    4. ____ a sandwich

    <b>Ответ:</b> <b>make</b>

    <i>Перевод:</i>
    make a decision — принять решение
    make a living — зарабатывать на жизнь
    make progress — делать успехи
    make a sandwich — сделать сэндвич
type-collocation-check-note = { "" }

# Assignment question
question-header = <b>Вопрос { $index }</b> <i>из { $total }</i>
question-not-found = Вопрос не найден. Открой задание заново.
question-text-hint-first = ✍️ <b>Введи ответ</b> в сообщении.
question-text-hint-retry = 🙂 Попробуй снова <i>({ $attempt }/{ $max })</i>.

# Assignment feedback
feedback-correct = 🌟 <b>Отлично.</b>
feedback-wrong-choice = 🙂 <b>Почти.</b>
feedback-wrong-try-again = 🙂 <b>Почти.</b> Попробуй снова <i>({ $attempt }/{ $max })</i>.
feedback-wrong-no-more = ⏳ <b>Попытки закончились.</b> <i>({ $attempt }/{ $max })</i>.
feedback-correct-answer = 💡 Правильный ответ: <b>{ $answer }</b>
feedback-explanation-title = 💡 <b>Объяснение</b>

# Assignment done
done-title = ✅ <b>Готово</b>
done-saved = Твои ответы сохранены.
done-hint = 💡 Можешь разобрать каждый вопрос пошагово.

# Submit error
submit-error-title = ⚠️ <b>Не удалось отправить ответы</b>
submit-error-text = Нажми <b>«Отправить снова»</b>, чтобы продолжить.
submit-error-hint = 💡 Если ошибка повторяется — заверши задание. Ответы остаются в чате.
submit-error-details = Детали

# Review
review-title = 🔎 Разбор
review-unavailable = Разбор доступен после отправки ответов.
review-question-label = Вопрос
review-yours-label = Твой ответ
review-correct-label = Правильный ответ
review-explanation-title = 💡 <b>Объяснение</b>
session-not-found = Сессия задания не найдена. Открой задание заново.

# Start screens
start-need-reg-title = <b>👋 Привет, { $firstName }!</b>
start-need-reg-text = Здесь ты будешь получать задания от преподавателя.
start-need-reg-hint = 💡 Нажми «Присоединиться», чтобы подключиться.
start-no-teacher-title = ✨ <b>Регистрация завершена.</b>
start-no-teacher-text = Этот бот работает вместе с преподавателем, но тебя ещё не добавили.
start-no-teacher-hint = 💡 Как только преподаватель подключит тебя, уроки появятся здесь.
start-active-title = <b>🌟 Привет, { $firstName }!</b>
start-active-text = Твои уроки и задания доступны в меню.

# Registration
reg-cancel-ok = Хорошо. Если захочешь попробовать позже — нажми /start.
reg-in-progress =
    Ты в процессе подключения.
    Нажми кнопку ниже или /cancel, чтобы отменить.
reg-success =
    🎉 Готово.

    Теперь преподаватель может найти тебя и назначить уроки.
reg-failed = Что-то пошло не так при подключении.
reg-reason-prefix = Причина:
reg-try-again = /start — попробовать снова
reg-callback-ok = Хорошо
reg-cancel-short = Хорошо. Если передумаешь — нажми /start.
reg-restore-failed = ⚠️ Не удалось восстановить регистрацию. Нажми /start ещё раз.

# Invites
invite-in-flight = Секунду…
invite-accepted =
    🎉 Запрос принят.

    Преподаватель теперь может назначать тебе задания.
invite-declined = Хорошо. Запрос отклонён.
invite-err-cannot-identify = Не удалось определить пользователя.
invite-err-already-processed = ✅ Этот запрос уже был обработан.
invite-err-not-found = 😕 Запрос не найден.
invite-err-process-failed = Не удалось обработать запрос.
invite-err-reason-prefix = Причина:

# Notifications
notif-teacher-request-title = 👩‍🏫 <b>Запрос от преподавателя</b>
notif-teacher-fallback-name = Преподаватель
notif-teacher-request-body = <b>{ $teacherName }</b> хочет добавить тебя как студента.
notif-teacher-message-prefix = 💬
notif-teacher-hint = 💡 Выбери действие с помощью кнопок ниже.
notif-lesson-new = Назначен новый урок
notif-lesson-open-hint = 💡 Открой урок, чтобы увидеть задания

# Keyboard labels
kb-back = 🔙 Назад
kb-menu = 🏠 Меню
kb-back-to-lessons = 🔙 Уроки
kb-open-lesson = 🔎 Открыть урок
kb-my-lessons = 📖 Мои уроки
kb-help = ❓ Помощь
kb-join = ✨ Присоединиться
kb-not-now = Не сейчас
kb-accept = Принять
kb-decline = Отклонить
kb-begin = 🚀 Начать
kb-retry-submit = Отправить снова
kb-finish = 🏁 Завершить
kb-to-lesson = 📚 Задания урока
kb-review = 🔎 Разобрать ответы
kb-lessons-prev = ⬅️ Назад
kb-lessons-next = Вперёд ➡️
kb-review-prev = ◀︎
kb-review-next = ▶︎
kb-review-to-lesson = 📚 Задания урока
kb-review-finish = 🏁 Завершить

# Language selection
lang-title = 🌐 <b>Язык</b>
lang-choose = Выбери язык интерфейса:
lang-changed = ✅ Язык изменён.
kb-lang = 🌐 Язык

# Errors
error-generic = ⚠️ Что-то пошло не так. Попробуй позже.
stale-assignment = Экран устарел. Открой задание заново.
already-starting = Уже запускаю…
