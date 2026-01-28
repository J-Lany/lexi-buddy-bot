import type { BotContext } from "../context.js";
import type { NavScreen } from "../session.js";
import type { RenderScreenDeps } from "../screens/types.js";

import { renderHomeScreen } from "../screens/common/home.screen.js";
import { renderProfileScreen } from "../screens/common/profile.screen.js";
import { renderHelpScreen } from "../screens/common/help.screen.js";

import { renderLessonsListScreen } from "../screens/lessons/lessons-list.screen.js";
import { renderLessonScreen } from "../screens/lessons/lesson.screen.js";

import { renderAssignmentIntroScreen } from "../screens/assignments/assignment-intro.screen.js";
import { renderAssignmentQuestionScreen } from "../screens/assignments/assignment-question.screen.js";
import { renderAssignmentDoneScreen } from "../screens/assignments/assignment-done.screen.js";
import { renderAssignmentReviewScreen } from "../screens/assignments/assignment-review.screen.js";

export type RenderDeps = RenderScreenDeps;

export async function renderScreen(
  ctx: BotContext,
  deps: RenderScreenDeps,
  screen: NavScreen,
) {
  await renderHomeScreen(ctx, deps, screen);
  await renderLessonsListScreen(ctx, deps, screen);
  await renderLessonScreen(ctx, deps, screen);

  await renderAssignmentIntroScreen(ctx, deps, screen);
  await renderAssignmentQuestionScreen(ctx, deps, screen);
  await renderAssignmentDoneScreen(ctx, deps, screen);
  await renderAssignmentReviewScreen(ctx, deps, screen);

  await renderProfileScreen(ctx, deps, screen);
  await renderHelpScreen(ctx, deps, screen);
}
