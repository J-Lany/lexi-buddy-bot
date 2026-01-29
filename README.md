# 🎓 Telegram Student Bot — Architecture & Flow

Telegram-бот для студентов языковой платформы.

Бот — UI-клиент к backend (NestJS + Prisma).

Backend хранит всё состояние обучения.  
Бот отвечает только за:

- навигацию
- UX
- прохождение заданий
- локальный session state

Ментальная модель проекта:

Telegram SPA + Backend API + Assignment Engine

А не “бот с кучей handlers”.

---

## 🖥 Screen mode vs 💬 Chat mode

В боте есть два UX-режима.

### Screen mode (меню)

Используется для:

- Home
- Lessons list
- Lesson
- Profile
- Help

Свойства:

- всегда одно сообщение
- оно редактируется (`safeEditScreen`)
- id хранится в `ctx.session.ui.screenMessageId`
- навигация в `ctx.session.nav.stack`

Эффект:

- ощущение приложения
- чат не засоряется
- поведение как SPA

---

### Chat mode (assignments)

Используется внутри заданий.

Свойства:

- каждый шаг = новое сообщение (`sendChat`)
- ничего не редактируется
- история вопросов и ответов сохраняется

Почему:

- нельзя затирать вопросы
- ответы пользователя остаются в чате
- UX как диалог

---

## 🔄 Переходы между режимами

### Screen → Chat

При старте задания:

- создаётся `assignmentRun`
- сбрасывается `screenMessageId`
- дальше используется только Chat mode

### Chat → Screen

При выходе из задания обязательно:

- `beginNewScreen(ctx)`
- `clearAssignmentRun(ctx)`

Иначе бот попытается редактировать assignment-сообщения.

Это централизовано в `goTo()`.

---

## 🧭 Навигация

Навигация хранится в: ctx.session.nav.stack

Stack никогда не пустой: [{ name: "home" }]

Все переходы выполняются через: goTo(ctx, deps, screen, opts)

`goTo` делает:

1. проверяет, уходим ли из assignment
2. вызывает `ensureScreenMode`
3. чистит assignment при необходимости
4. мутирует nav stack
5. вызывает `renderScreen`

Опции:

- navMode: reset | push | replaceTop
- clearAssignmentRun: always | ifLeavingAssignment | never

Routes не знают деталей навигации — они просто говорят “куда идти”.

---

## 🏗 Архитектура

domain/ — бизнес-смысл (без Telegram)  
application/ — процессы (AssignmentRunFlow)  
infra/ — backend api client

transport/telegram/

- routes
- screens
- helpers
- ui/messages
- ui/keyboards

---

## 🏠 Start flow

StudentHomeService.getStartView() возвращает:

- NEED_REG
- REGISTERED_NO_TEACHER
- ACTIVE_STUDENT

Логика:

- не зарегистрирован → NEED_REG
- groupsCount === 0 → REGISTERED_NO_TEACHER
- иначе → ACTIVE_STUDENT

groupsCount приходит из backend profile.

---

## 📚 Lessons flow

Home  
→ Lessons list  
→ Lesson  
→ Assignment intro

Assignments появляются только если backend их назначил.

---

## 📝 Assignment flow

Весь lifecycle задания живёт в:
application/assignment-run/assignment-run.flow.ts

Он управляет:

- текущим вопросом
- попытками
- feedback
- auto submit
- retry submit
- review

Состояние хранится в:
ctx.session.assignmentRun

Переходы:

- choice — сразу
- text — после correct или maxAttempts

Последний вопрос → auto submit.

---

## 🔁 Submit & Review

maybeAutoSubmitAndNavigate():

- проверяет условия
- вызывает submit
- переводит в assignment_done

Backend submit идемпотентен:

- можно безопасно ретраить
- повторный submit не ломает данные

Review:

- постраничный
- read-only
- только после submit

---

## 🧱 Engineering principles

### Bot = UI layer

Бот — тонкий клиент.

Он отвечает только за:

- навигацию
- UX
- отображение
- ввод пользователя

Вся логика живёт в domain / application / backend.

---

### Domain не знает про Telegram

В domain нет:

- ctx
- grammy
- сообщений
- клавиатур

Там только правила, типы и сервисы.

---

### Один источник истины

- обучение → backend
- навигация → ctx.session.nav
- assignment → ctx.session.assignmentRun

Бот ничего не “вычисляет” — только отображает.

---

### AssignmentRunFlow — единый оркестратор

Routes не:

- считают попытки
- проверяют ответы
- решают submit

Они только прокидывают события.

---

### Маленькие helpers, без магии

Никаких скрытых мутаций ctx и побочных эффектов.  
Каждый helper делает одну вещь.

---

## ✨ UX & Text tone (Apple-style)

Тексты в боте:

- короткие
- дружелюбные
- без канцелярита
- без “произошла ошибка”
- без обвинений пользователя

Примеры:
❌ Произошла ошибка при отправке данных  
✅ Не получилось отправить. Попробуем ещё раз?

❌ Введите корректное значение  
✅ Попробуй ещё раз 🙂

❌ Регистрация не завершена  
✅ Давай закончим регистрацию

Тон:

- спокойный
- поддерживающий
- человечный

Бот говорит как продукт, а не как система.

---
