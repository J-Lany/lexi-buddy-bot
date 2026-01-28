import type { BotContext } from "../context.js";
import type { NavScreen } from "../session.js";

function ensureRoot(stack: NavScreen[]) {
  if (stack.length === 0) stack.push({ name: "home" });
}

export function isAssignmentScreenName(name: NavScreen["name"]): boolean {
  return name.startsWith("assignment_");
}

export function isAssignmentScreen(screen: NavScreen): boolean {
  return isAssignmentScreenName(screen.name);
}

function sameScreen(a: NavScreen, b: NavScreen) {
  if (a.name !== b.name) return false;

  if (a.name === "home" && b.name === "home") return true;
  if (a.name === "profile" && b.name === "profile") return true;
  if (a.name === "help" && b.name === "help") return true;

  if (a.name === "lessons_list" && b.name === "lessons_list") {
    return (a.page ?? 0) === (b.page ?? 0);
  }

  if (a.name === "lesson" && b.name === "lesson") {
    return a.lessonId === b.lessonId;
  }

  if (a.name === "assignment_intro" && b.name === "assignment_intro") {
    return a.assignmentId === b.assignmentId;
  }

  if (a.name === "assignment_question" && b.name === "assignment_question") {
    return true;
  }

  if (a.name === "assignment_done" && b.name === "assignment_done") {
    return true;
  }

  if (a.name === "assignment_review" && b.name === "assignment_review") {
    return (a.page ?? 0) === (b.page ?? 0);
  }

  return false;
}

export function navReset(ctx: BotContext, root: NavScreen) {
  ctx.session.nav.stack = [root];
}

export function navPush(ctx: BotContext, screen: NavScreen) {
  const stack = ctx.session.nav.stack;
  ensureRoot(stack);

  const last = stack[stack.length - 1];
  if (last && sameScreen(last, screen)) return;
  stack.push(screen);
}

export function navPop(ctx: BotContext): NavScreen | undefined {
  const stack = ctx.session.nav.stack;
  ensureRoot(stack);

  if (stack.length <= 1) return stack[0];
  stack.pop();
  return stack[stack.length - 1];
}

export function navPeek(ctx: BotContext): NavScreen | undefined {
  const stack = ctx.session.nav.stack;
  ensureRoot(stack);
  return stack[stack.length - 1];
}

export function navReplaceTop(ctx: BotContext, screen: NavScreen) {
  const stack = ctx.session.nav.stack;
  ensureRoot(stack);
  stack[stack.length - 1] = screen;
}
