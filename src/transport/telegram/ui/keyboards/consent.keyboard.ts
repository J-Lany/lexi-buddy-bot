import { InlineKeyboard } from "grammy";
import type { Translator } from "../helpers/copy.js";

export function registrationConsentKeyboard(
  t: Translator,
  legalUrls: { privacy: string; terms: string },
) {
  return new InlineKeyboard()
    .url(t("kb-consent-privacy"), legalUrls.privacy)
    .row()
    .url(t("kb-consent-terms"), legalUrls.terms)
    .row()
    .text(t("kb-consent-continue"), "reg_consent_continue");
}

/**
 * Shown when registration itself already succeeded but we couldn't yet
 * confirm the account. Deliberately reuses the "reg_consent_continue"
 * callback — the handler is registrationCompleted-aware and will only retry
 * the lookup, never call the register endpoint again.
 */
export function lookupRetryKeyboard(t: Translator) {
  return new InlineKeyboard().text(
    t("kb-lookup-retry"),
    "reg_consent_continue",
  );
}
