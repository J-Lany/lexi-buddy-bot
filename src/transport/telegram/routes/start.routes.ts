import type { Bot } from "grammy";
import type { BotContext } from "../context.js";
import type { StudentHomeService } from "../../../domain/student-home/student-home.service.js";

import { startRegistrationKeyboard } from "../ui/keyboards/registration.keyboard.js";
import {
  startActiveStudentMessage,
  startNeedRegMessage,
  startRegisteredNoTeacherMessage,
} from "../ui/messages/start.messages.js";
import { beginNewScreen } from "../helpers/begin-new-screen.js";
import { safeEditScreen } from "../helpers/edit-screen/safe-edit-screen.js";
import type { RoutesDeps } from "./routes.deps.js";
import { goTo } from "../helpers/go-to.js";
import { copy } from "../ui/helpers/copy.js";
import { clearAssignmentRun } from "../helpers/clear-assignment-run.js";

import { logError, logInfo } from "../../../observability/logger.js";
import { setRequestUserId } from "../../../observability/request-context.js";

export function registerStartRoutes(
  bot: Bot<BotContext>,
  deps: RoutesDeps & {
    home: StudentHomeService;
  },
) {
  bot.command("start", async (ctx) => {
    const from = ctx.from;
    if (!from) return;

    try {
      beginNewScreen(ctx);
      delete ctx.session.reg;
      clearAssignmentRun(ctx);
      ctx.session.nav.stack = [{ name: "home" }];
      ctx.session.userId = null;

      const profile = {
        telegramId: from.id,
        username: from.username ?? null,
        firstName: from.first_name,
        lastName: from.last_name ?? null,
      };

      await safeEditScreen(ctx, copy.ui.common.loading);

      const view = await deps.home.getStartView(profile);

      if (view.type === "NEED_REG") {
        ctx.session.userId = null;
        setRequestUserId(null);

        logInfo("start_view_resolved", {
          view: view.type,
        });

        ctx.session.reg = { draft: profile };

        await safeEditScreen(ctx, startNeedRegMessage(profile.firstName), {
          reply_markup: startRegistrationKeyboard(),
        });
        return;
      }

      ctx.session.userId = view.userId;
      setRequestUserId(view.userId);

      logInfo("start_view_resolved", {
        view: view.type,
      });

      if (view.type === "REGISTERED_NO_TEACHER") {
        ctx.session.ui.bannerText = startRegisteredNoTeacherMessage();
        await goTo(
          ctx,
          deps,
          { name: "home" },
          { navMode: "reset", clearAssignmentRun: "always" },
        );
        return;
      }

      ctx.session.ui.bannerText = startActiveStudentMessage(profile.firstName);
      await goTo(
        ctx,
        deps,
        { name: "home" },
        { navMode: "reset", clearAssignmentRun: "always" },
      );
    } catch (e) {
      logError("start_failed", e);
      await safeEditScreen(
        ctx,
        "⚠️ Не удалось открыть стартовый экран. Попробуй позже.",
      );
    }
  });
}
