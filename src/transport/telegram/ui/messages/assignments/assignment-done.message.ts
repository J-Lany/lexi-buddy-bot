import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function assignmentDoneMessage(score: number | null) {
  const result =
    score === null
      ? copy.ui.assignment.done.saved
      : copy.ui.common.labels.resultPercent(Math.round(score * 100));

  return uiMessage([
    copy.ui.common.title("✅", copy.ui.assignment.done.title),
    "",
    result,
    "",
    copy.ui.common.hint(copy.ui.assignment.done.hint),
  ]);
}
