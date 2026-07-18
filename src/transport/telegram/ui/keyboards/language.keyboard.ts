import { InlineKeyboard } from "grammy";
import { SUPPORTED_LOCALES } from "../../../../i18n/index.js";
import type { Translator } from "../helpers/copy.js";

const LOCALE_LABELS: Record<string, string> = {
  en: "🇬🇧 English",
  ru: "🇷🇺 Русский",
  kz: "🇰🇿 Қазақша",
  es: "🇪🇸 Español",
};

export function languageKeyboard(t: Translator, currentLocale: string) {
  const kb = new InlineKeyboard();

  for (const locale of SUPPORTED_LOCALES) {
    const label = LOCALE_LABELS[locale] ?? locale;
    const active = locale === currentLocale ? " ✓" : "";
    kb.text(`${label}${active}`, `lang_set:${locale}`).row();
  }

  kb.text(t("kb-back"), "nav:back");

  return kb;
}
