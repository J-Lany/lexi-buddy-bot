export const DEFAULT_WEBSITE_BASE_URL = "https://www.lexi-buddy.com";

/**
 * Empty/undefined uses the default. A set-but-invalid value fails fast at
 * startup rather than silently producing a broken legal-page link later.
 */
export function resolveWebsiteBaseUrl(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") return DEFAULT_WEBSITE_BASE_URL;

  const trimmed = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid WEBSITE_BASE_URL: "${raw}" is not a valid absolute URL`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid WEBSITE_BASE_URL: "${raw}" must use http or https`,
    );
  }

  return trimmed;
}

/** Resolves a legal-page path against the configured base — works with or without a trailing slash on the base. */
export function buildLegalUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}
