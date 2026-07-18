# Common
loading = ⌛️ Loading…
questions-count = Questions: <b>{ $n }</b>
progress = Progress: <b>{ $done }/{ $total }</b>
result-percent = Result: <b>{ $pct }%</b>
nav-home = Home
nav-lessons = Lessons
nav-help = Help
nav-assignment = Task
nav-review = Review

# Home
home-title = 🏠 <b>Menu</b>
home-greeting = Hello 👋
home-greeting-named = Hi, { $name } 👋
home-question = What would you like to do?
home-hint = 💡 Lessons and tasks will appear here when your teacher assigns them.

# Help
help-title = ❓ <b>Help</b>
help-section = <b>Commands</b>
help-commands =
    /start — menu
    /lessons — lessons
    /help — help
help-hint = 💡 The Menu button near the input field is the fastest way.

# Lessons list
lessons-list-title = 📖 <b>Lessons</b>
lessons-list-title-paged = 📖 <b>Lessons • { $page }/{ $pages }</b>
lessons-list-empty = Nothing here yet.
lessons-list-empty-hint = 💡 Ask your teacher to assign a lesson.
lessons-list-choose = Choose a lesson
lessons-list-paging-hint = 💡 You can scroll the list using the buttons below.

# Lesson
lesson-materials-label = 🔗 <b>Materials</b>
lesson-empty = There are no tasks in this lesson yet.
lesson-empty-hint = 💡 If you expect tasks, ask your teacher.
lesson-choose = Choose a task
lesson-new = A new lesson has been assigned
lesson-open = 💡 Open the lesson to see the tasks

# Assignment intro
assignment-title = 📝 <b>Task</b>
assignment-teacher-comment-title = Teacher's comment
assignment-vocab-title = <b>Vocabulary</b>
assignment-vocab-synonyms-label = Synonyms:
assignment-ready = Press <b>"🚀 Start"</b>.
assignment-how-prefix = How to answer:
assignment-how-mixed = Sometimes choose an option, sometimes type your answer.
assignment-how-choice = Choose the correct option using the buttons below.
assignment-how-text = Type your answer in a message.
assignment-how-fallback = Follow the instructions on the screen.
assignment-fallback-example-title = Example
assignment-fallback-example-body =
    <b>Question:</b> What does "break the ice" mean?
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

# Assignment types
type-definition-quiz-title = What does the phrase mean?
type-definition-quiz-body = Choose the correct definition.
type-definition-quiz-example-title = Example
type-definition-quiz-example-body =
    <b>Phrase:</b> break the ice
    🇦 Say something funny to make people feel relaxed
    🇧 Literally break something
    🇨 Freeze water

    💡 <b>Correct answer:</b> 🇦 Say something funny to make people feel relaxed
type-definition-quiz-note = { "" }

type-gap-filling-title = Fill in the gap
type-gap-filling-body = Write the missing word or phrase. You have <b>three attempts</b>.
type-gap-filling-example-title = Example
type-gap-filling-example-body =
    I don't <u>_____</u> mango.
    <b>Answer:</b> like
type-gap-filling-note = { "" }

type-phrase-fail-title = Find the incorrect sentence
type-phrase-fail-body = Three sentences use the same phrase. In one sentence it is <b>incorrect</b>. Type the number.
type-phrase-fail-example-title = Example
type-phrase-fail-example-body =
    <b>Phrase:</b> get up
    1. I <b>get up</b> at 7 a.m.
    2. He <b>get up</b> at 5 a.m. today.
    3. She <b>gets up</b> early every day.

    <b>Answer:</b> 2
    💡 <b>Correct:</b> He <b>gets up</b> at 5 a.m. today.
type-phrase-fail-note = 💡 Tip: look at the verb form and word order.

type-collocation-check-title = Find the common word
type-collocation-check-body = Four phrases use the same word. Write that word.
type-collocation-check-example-title = Example
type-collocation-check-example-body =
    1. ____ a decision
    2. ____ a living
    3. ____ progress
    4. ____ a sandwich

    <b>Answer:</b> <b>make</b>

    <i>Translation:</i>
    make a decision — принять решение
    make a living — зарабатывать на жизнь
    make progress — делать успехи
    make a sandwich — сделать сэндвич
type-collocation-check-note = { "" }

# Assignment question
question-header = <b>Question { $index }</b> <i>of { $total }</i>
question-not-found = Question not found. Please open the task again.
question-text-hint-first = ✍️ <b>Type your answer</b> in a message.
question-text-hint-retry = 🙂 Try again <i>({ $attempt }/{ $max })</i>.

# Assignment feedback
feedback-correct = 🌟 <b>Nice work.</b>
feedback-wrong-choice = 🙂 <b>Almost.</b>
feedback-wrong-try-again = 🙂 <b>Almost.</b> Try again <i>({ $attempt }/{ $max })</i>.
feedback-wrong-no-more = ⏳ <b>No more tries for this question.</b> <i>({ $attempt }/{ $max })</i>.
feedback-correct-answer = 💡 The correct answer: <b>{ $answer }</b>
feedback-explanation-title = 💡 <b>Explanation</b>

# Assignment done
done-title = ✅ <b>Done</b>
done-saved = Your answers are saved.
done-hint = 💡 You can review each question step by step.

# Submit error
submit-error-title = ⚠️ <b>We couldn't send your answers</b>
submit-error-text = Press <b>"Retry submit"</b> to continue.
submit-error-hint = 💡 If the error continues — finish the task. Your answers stay in the chat.
submit-error-details = Details

# Review
review-title = 🔎 Review
review-unavailable = Review is available after submitting answers.
review-question-label = Question
review-yours-label = Your answer
review-correct-label = Correct answer
review-explanation-title = 💡 <b>Explanation</b>
session-not-found = Task session not found. Please open the task again.

# Start screens
start-need-reg-title = <b>👋 Hi, { $firstName }!</b>
start-need-reg-text = You will receive tasks from your teacher here.
start-need-reg-hint = 💡 Press "Join" to connect.
start-no-teacher-title = ✨ <b>Registration complete.</b>
start-no-teacher-text = This bot works together with your teacher, but you have not been added yet.
start-no-teacher-hint = 💡 After your teacher connects you, lessons will appear here.
start-active-title = <b>🌟 Hi, { $firstName }!</b>
start-active-text = Your lessons and tasks are available in the menu.

# Registration
reg-cancel-ok = Ok. If you want to try again later, type /start.
reg-in-progress =
    You are in the connection process.
    Press the button below or /cancel to stop.
reg-success =
    🎉 Done.

    Now your teacher can find you and assign lessons.
reg-failed = Something went wrong while connecting. Please try again — tap Continue below.
reg-callback-ok = Ok
reg-cancel-short = Ok. If you change your mind — type /start.
reg-restore-failed = ⚠️ Could not restore registration. Press /start again.
reg-lookup-failed = We connected your account, but couldn't confirm it yet. Please tap Continue to try again.
reg-consent-title = <b>Before you continue</b>
reg-consent-text = By continuing to use the Lexi Buddy bot, you agree to the Privacy Policy and accept the Terms of Service.

# Invites
invite-in-flight = Just a moment…
invite-accepted =
    🎉 Request accepted.

    Your teacher can now assign tasks to you.
invite-declined = Ok. Request declined.
invite-err-cannot-identify = Could not identify the user.
invite-err-already-processed = ✅ This request has already been processed.
invite-err-not-found = 😕 Request not found.
invite-err-process-failed = We couldn't process the request.
invite-err-reason-prefix = Reason:

# Notifications
notif-teacher-request-title = 👩‍🏫 <b>Teacher request</b>
notif-teacher-fallback-name = Teacher
notif-teacher-request-body = <b>{ $teacherName }</b> wants to add you as a student.
notif-teacher-message-prefix = 💬
notif-teacher-hint = 💡 Choose an action using the buttons below.
notif-lesson-new = A new lesson has been assigned
notif-lesson-open-hint = 💡 Open the lesson to see the tasks

# Keyboard labels
kb-back = 🔙 Back
kb-menu = 🏠 Menu
kb-back-to-lessons = 🔙 Lessons
kb-open-lesson = 🔎 Open lesson
kb-my-lessons = 📖 My lessons
kb-help = ❓ Help
kb-join = ✨ Join
kb-not-now = Not now
kb-consent-privacy = 📄 Privacy Policy
kb-consent-terms = 📄 Terms of Service
kb-consent-continue = Continue
kb-lookup-retry = Try again
kb-accept = Accept
kb-decline = Decline
kb-begin = 🚀 Start
kb-retry-submit = Retry submit
kb-finish = 🏁 Finish
kb-to-lesson = 📚 Lesson tasks
kb-review = 🔎 Review answers
kb-lessons-prev = ⬅️ Prev
kb-lessons-next = Next ➡️
kb-review-prev = ◀︎
kb-review-next = ▶︎
kb-review-to-lesson = 📚 Lesson tasks
kb-review-finish = 🏁 Finish

# Language selection
lang-title = 🌐 <b>Language</b>
lang-choose = Choose your interface language:
lang-changed = ✅ Language changed.
kb-lang = 🌐 Language

# Errors
error-generic = ⚠️ Something went wrong. Please try again later.
stale-assignment = The screen is outdated. Please open the task again.
already-starting = Already starting…
