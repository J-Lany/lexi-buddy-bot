import { uiMessage } from "../../helpers/ui.js";
import type { Translator } from "../../helpers/copy.js";

export function assignmentDoneMessage(t: Translator, score: number | null) {
  const result =
    score === null
      ? t("done-saved")
      : t("result-percent", { pct: Math.round(score * 100) });

  return uiMessage([t("done-title"), "", result, "", t("done-hint")]);
}
