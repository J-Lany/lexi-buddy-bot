import { createContainer } from "./container.js";
import { createBot } from "./bot.js";
import { startInternalHttpServer } from "../transport/internal-http/server.js";

const container = createContainer();
const bot = createBot(container);

startInternalHttpServer(bot);

await bot.start();
