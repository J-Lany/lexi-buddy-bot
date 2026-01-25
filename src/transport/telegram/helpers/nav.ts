import type { BotContext } from "../context.js";
import type { NavScreen } from "../session.js";

function sameScreen(a: NavScreen, b: NavScreen) {
  if (a.name !== b.name) return false;

  if (a.name === "lessons_list") return true;
  if (a.name === "lesson" && b.name === "lesson")
    return a.lessonId === b.lessonId;
  if (a.name === "assignment" && b.name === "assignment")
    return a.assignmentId === b.assignmentId;
  if (a.name === "profile" && b.name === "profile") return true;
  if (a.name === "help" && b.name === "help") return true;

  return false;
}

export function navReset(ctx: BotContext, root: NavScreen) {
  ctx.session.nav.stack = [root];
}

export function navPush(ctx: BotContext, screen: NavScreen) {
  const stack = ctx.session.nav.stack;
  const last = stack[stack.length - 1];
  if (last && sameScreen(last, screen)) return;
  stack.push(screen);
}

export function navPop(ctx: BotContext): NavScreen | undefined {
  const stack = ctx.session.nav.stack;
  if (stack.length <= 1) return stack[0];
  stack.pop();
  return stack[stack.length - 1];
}

export function navPeek(ctx: BotContext): NavScreen | undefined {
  const stack = ctx.session.nav.stack;
  return stack[stack.length - 1];
}
