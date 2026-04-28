import { escapeHtml } from "../../helpers/html.js";
import { uiMessage } from "../../helpers/ui.js";
import type { Translator } from "../../helpers/copy.js";

export function assignmentSubmitErrorMessage(
  t: Translator,
  params: {
    details?: string | null;
  },
) {
  const details = params.details?.trim() || null;

  return uiMessage([
    t("submit-error-title"),
    "",
    t("submit-error-text"),
    "",
    t("submit-error-hint"),
    details
      ? `\n<blockquote><i>${t("submit-error-details")}</i>\n${escapeHtml(
          details,
        )}</blockquote>`
      : null,
  ]);
}
