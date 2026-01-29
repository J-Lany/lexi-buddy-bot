import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import { copy } from "../../helpers/copy.js";

export function assignmentSubmitErrorMessage(params: {
  details?: string | null;
}) {
  const details = params.details?.trim() || null;

  return uiMessage([
    copy.ui.common.title("⚠️", copy.ui.assignment.submitError.title),
    "",
    copy.ui.assignment.submitError.text,
    "",
    copy.ui.common.hint(copy.ui.assignment.submitError.hint),
    details
      ? `\n<blockquote><i>${copy.ui.assignment.submitError.detailsTitle}</i>\n${escapeHtml(
          details,
        )}</blockquote>`
      : null,
  ]);
}
