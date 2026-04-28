# Common
loading = ⌛️ Жүктелуде…
questions-count = Сұрақтар: <b>{ $n }</b>
progress = Прогресс: <b>{ $done }/{ $total }</b>
result-percent = Нәтиже: <b>{ $pct }%</b>
nav-home = Басты бет
nav-lessons = Сабақтар
nav-help = Анықтама
nav-assignment = Тапсырма
nav-review = Шолу

# Home
home-title = 🏠 <b>Мәзір</b>
home-greeting = Сәлем 👋
home-greeting-named = Сәлем, { $name } 👋
home-question = Не істегің келеді?
home-hint = 💡 Сабақтар мен тапсырмалар ұстаз тағайындағанда мұнда пайда болады.

# Help
help-title = ❓ <b>Анықтама</b>
help-section = <b>Командалар</b>
help-commands =
    /start — мәзір
    /lessons — сабақтар
    /help — анықтама
help-hint = 💡 Енгізу өрісі жанындағы «Мәзір» түймесі — ең жылдам жол.

# Lessons list
lessons-list-title = 📖 <b>Сабақтар</b>
lessons-list-title-paged = 📖 <b>Сабақтар • { $page }/{ $pages }</b>
lessons-list-empty = Бұл жерде әзірге ештеңе жоқ.
lessons-list-empty-hint = 💡 Ұстазыңнан сабақ тағайындауын сұра.
lessons-list-choose = Сабақты таңда
lessons-list-paging-hint = 💡 Тізімді төмендегі түймелер арқылы аударып көр.

# Lesson
lesson-empty = Бұл сабақта әзірге тапсырмалар жоқ.
lesson-empty-hint = 💡 Тапсырма күтсең — ұстазыңнан сұра.
lesson-choose = Тапсырманы таңда
lesson-new = Жаңа сабақ тағайындалды
lesson-open = 💡 Тапсырмаларды көру үшін сабақты аш

# Assignment intro
assignment-title = 📝 <b>Тапсырма</b>
assignment-vocab-title = <b>Сөздік</b>
assignment-vocab-synonyms-label = Синонимдер:
assignment-ready = <b>«🚀 Бастау»</b> түймесін бас.
assignment-how-prefix = Қалай жауап беру керек:
assignment-how-mixed = Кейде нұсқаны таңда, кейде жауапты тере.
assignment-how-choice = Төмендегі түймелер арқылы дұрыс нұсқаны таңда.
assignment-how-text = Жауабыңды хабарламада жаз.
assignment-how-fallback = Экрандағы нұсқауларды орында.
assignment-fallback-example-title = Мысал
assignment-fallback-example-body =
    <b>Сұрақ:</b> What does "break the ice" mean?
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

# Assignment types
type-definition-quiz-title = Тіркес не білдіреді?
type-definition-quiz-body = Дұрыс анықтаманы таңда.
type-definition-quiz-example-title = Мысал
type-definition-quiz-example-body =
    <b>Тіркес:</b> break the ice
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

    💡 <b>Дұрыс жауап:</b> 🇦 Say something funny to make people feel relaxed
type-definition-quiz-note = { "" }

type-gap-filling-title = Бос орынды толтыр
type-gap-filling-body = Жетіспейтін сөзді немесе тіркесті жаз. Саған <b>үш әрекет</b> берілген.
type-gap-filling-example-title = Мысал
type-gap-filling-example-body =
    I don't <u>_____</u> mango.
    <b>Жауабы:</b> like
type-gap-filling-note = { "" }

type-phrase-fail-title = Қате сөйлемді тап
type-phrase-fail-body = Үш сөйлемде бір тіркес қолданылады. Бірінде ол <b>қате</b>. Нөмірін теріп жаз.
type-phrase-fail-example-title = Мысал
type-phrase-fail-example-body =
    <b>Тіркес:</b> get up
    1. I <b>get up</b> at 7 a.m.
    2. He <b>get up</b> at 5 a.m. today.
    3. She <b>gets up</b> early every day.

    <b>Жауабы:</b> 2
    💡 <b>Дұрысы:</b> He <b>gets up</b> at 5 a.m. today.
type-phrase-fail-note = 💡 Кеңес: етістіктің формасына және сөз тәртібіне назар аудар.

type-collocation-check-title = Ортақ сөзді тап
type-collocation-check-body = Төрт тіркесте бір сөз қолданылады. Сол сөзді жаз.
type-collocation-check-example-title = Мысал
type-collocation-check-example-body =
    1. ____ a decision
    2. ____ a living
    3. ____ progress
    4. ____ a sandwich

    <b>Жауабы:</b> <b>make</b>

    <i>Аудармасы:</i>
    make a decision — шешім қабылдау
    make a living — күн көру
    make progress — ілгерілеу
    make a sandwich — сэндвич жасау
type-collocation-check-note = { "" }

# Assignment question
question-header = <b>Сұрақ { $index }</b> <i>/ { $total }</i>
question-not-found = Сұрақ табылмады. Тапсырманы қайта аш.
question-text-hint-first = ✍️ <b>Жауабыңды</b> хабарламада жаз.
question-text-hint-retry = 🙂 Қайтадан көр <i>({ $attempt }/{ $max })</i>.

# Assignment feedback
feedback-correct = 🌟 <b>Өте жақсы.</b>
feedback-wrong-choice = 🙂 <b>Дерлік.</b>
feedback-wrong-try-again = 🙂 <b>Дерлік.</b> Қайтадан көр <i>({ $attempt }/{ $max })</i>.
feedback-wrong-no-more = ⏳ <b>Әрекеттер таусылды.</b> <i>({ $attempt }/{ $max })</i>.
feedback-correct-answer = 💡 Дұрыс жауап: <b>{ $answer }</b>
feedback-explanation-title = 💡 <b>Түсіндірме</b>

# Assignment done
done-title = ✅ <b>Дайын</b>
done-saved = Жауаптарың сақталды.
done-hint = 💡 Әр сұрақты қадамдап қарап шыға аласың.

# Submit error
submit-error-title = ⚠️ <b>Жауаптарды жіберу мүмкін болмады</b>
submit-error-text = Жалғастыру үшін <b>«Қайта жіберу»</b> түймесін бас.
submit-error-hint = 💡 Қате қайталанса — тапсырманы аяқта. Жауаптар чатта қалады.
submit-error-details = Мәліметтер

# Review
review-title = 🔎 Шолу
review-unavailable = Шолу жауаптарды жібергеннен кейін қол жетімді.
review-question-label = Сұрақ
review-yours-label = Сенің жауабың
review-correct-label = Дұрыс жауап
review-explanation-title = 💡 <b>Түсіндірме</b>
session-not-found = Тапсырма сессиясы табылмады. Тапсырманы қайта аш.

# Start screens
start-need-reg-title = <b>👋 Сәлем, { $firstName }!</b>
start-need-reg-text = Мұнда ұстазыңнан тапсырмалар аласың.
start-need-reg-hint = 💡 Қосылу үшін «Қосылу» түймесін бас.
start-no-teacher-title = ✨ <b>Тіркеу аяқталды.</b>
start-no-teacher-text = Бұл бот ұстазыңмен бірге жұмыс істейді, бірақ сені әлі қоспады.
start-no-teacher-hint = 💡 Ұстаз сені қосқаннан кейін мұнда сабақтар пайда болады.
start-active-title = <b>🌟 Сәлем, { $firstName }!</b>
start-active-text = Сабақтарың мен тапсырмаларың мәзірде қол жетімді.

# Registration
reg-cancel-ok = Жарайды. Кейін қайта көргің келсе — /start басыңыз.
reg-in-progress =
    Қосылу үдерісіндесің.
    Төмендегі түймені бас немесе тоқтату үшін /cancel теріп жаз.
reg-success =
    🎉 Дайын.

    Енді ұстаз сені таба алады және сабақтар тағайындай алады.
reg-failed = Қосылу кезінде бірдеңе дұрыс болмады.
reg-reason-prefix = Себеп:
reg-try-again = /start — қайтадан көру
reg-callback-ok = Жарайды
reg-cancel-short = Жарайды. Ойың өзгерсе — /start теріп жаз.
reg-restore-failed = ⚠️ Тіркеуді қалпына келтіру мүмкін болмады. /start қайта бас.

# Invites
invite-in-flight = Бір секунд…
invite-accepted =
    🎉 Сұраныс қабылданды.

    Ұстаз енді саған тапсырмалар тағайындай алады.
invite-declined = Жарайды. Сұраныс қабылданбады.
invite-err-cannot-identify = Пайдаланушыны анықтау мүмкін болмады.
invite-err-already-processed = ✅ Бұл сұраныс бұрыннан өңделген.
invite-err-not-found = 😕 Сұраныс табылмады.
invite-err-process-failed = Сұранысты өңдеу мүмкін болмады.
invite-err-reason-prefix = Себеп:

# Notifications
notif-teacher-request-title = 👩‍🏫 <b>Ұстаздың сұранысы</b>
notif-teacher-fallback-name = Ұстаз
notif-teacher-request-body = <b>{ $teacherName }</b> сені студент ретінде қосқысы келеді.
notif-teacher-message-prefix = 💬
notif-teacher-hint = 💡 Төмендегі түймелер арқылы іс-әрекет таңда.
notif-lesson-new = Жаңа сабақ тағайындалды
notif-lesson-open-hint = 💡 Тапсырмаларды көру үшін сабақты аш

# Keyboard labels
kb-back = 🔙 Артқа
kb-menu = 🏠 Мәзір
kb-back-to-lessons = 🔙 Сабақтар
kb-open-lesson = 🔎 Сабақты аш
kb-my-lessons = 📖 Менің сабақтарым
kb-help = ❓ Анықтама
kb-join = ✨ Қосылу
kb-not-now = Қазір емес
kb-accept = Қабылдау
kb-decline = Бас тарту
kb-begin = 🚀 Бастау
kb-retry-submit = Қайта жіберу
kb-finish = 🏁 Аяқтау
kb-to-lesson = 📚 Сабақ тапсырмалары
kb-review = 🔎 Жауаптарды шолу
kb-lessons-prev = ⬅️ Алдыңғы
kb-lessons-next = Келесі ➡️
kb-review-prev = ◀︎
kb-review-next = ▶︎
kb-review-to-lesson = 📚 Сабақ тапсырмалары
kb-review-finish = 🏁 Аяқтау

# Language selection
lang-title = 🌐 <b>Тіл</b>
lang-choose = Интерфейс тілін таңда:
lang-changed = ✅ Тіл өзгертілді.
kb-lang = 🌐 Тіл

# Errors
error-generic = ⚠️ Бірдеңе дұрыс болмады. Кейінірек қайталап көр.
stale-assignment = Экран ескірді. Тапсырманы қайта аш.
already-starting = Іске қосылуда…
