import type { Translator } from "../helpers/copy.js";
import { uiMessage } from "../helpers/ui.js";

export function registrationConsentMessage(t: Translator) {
  return uiMessage([t("reg-consent-title"), "", t("reg-consent-text")]);
}
