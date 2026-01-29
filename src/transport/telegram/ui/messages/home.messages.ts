import { uiMessage } from "../helpers/ui.js";
import { copy } from "../helpers/copy.js";

export function homeMessage(firstName?: string | null) {
  return uiMessage([
    copy.ui.common.title("🏠", copy.ui.home.title),
    "",
    copy.ui.home.greeting(firstName),
    copy.ui.home.question,
    "",
    copy.ui.common.hint(copy.ui.home.hint),
  ]);
}
