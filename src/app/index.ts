import { createContainer } from "./container.js";
import { createBot } from "./bot.js";
import { startInternalHttpServer } from "../transport/internal-http/server.js";
import { TeacherRequestNotificationSender } from "../transport/telegram/notifications/teacher-request.notification.js";
import { setupBotUi } from "../transport/telegram/setup/setup-bot-ui.js";

const container = createContainer();
const bot = createBot(container);

const teacherRequestNotifier = new TeacherRequestNotificationSender(bot);
startInternalHttpServer({ teacherRequestNotifier });

await setupBotUi(bot);
await bot.start();
