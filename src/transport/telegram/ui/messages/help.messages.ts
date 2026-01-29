import { uiMessage } from "../helpers/ui.js";
import { copy } from "../helpers/copy.js";

export function helpMessage() {
  return uiMessage([
    copy.ui.common.title("❓", copy.ui.help.title),
    "",
    copy.ui.common.section(copy.ui.help.section),
    copy.ui.common.list(copy.ui.help.commands),
    "",
    copy.ui.common.hint(copy.ui.help.hint),
  ]);
}
