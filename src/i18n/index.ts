import { I18n } from "@grammyjs/i18n";
import type { I18nFlavor, TranslateFunction } from "@grammyjs/i18n";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type { I18nFlavor };
export type Translator = TranslateFunction;

export const SUPPORTED_LOCALES = ["en", "ru", "kz", "es"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, "../../locales");

export const i18n = new I18n({
  defaultLocale: "en",
  useSession: true,
  directory: localesDir,
});
