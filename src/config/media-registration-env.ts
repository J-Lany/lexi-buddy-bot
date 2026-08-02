const ADMIN_ID_PATTERN = /^\d+$/;

/** Only the literal string "true" (case-insensitive, after trim) enables the
 * feature — every other value, including unset, defaults to disabled. */
export function parseMediaRegistrationEnabled(
  raw: string | undefined,
): boolean {
  return raw?.trim().toLowerCase() === "true";
}

export type ParsedAdminIds = {
  ids: Set<number>;
  invalidEntries: string[];
};

/**
 * CSV of Telegram user IDs. Each entry must match /^\d+$/ before being
 * parsed — this rejects "1e3", "+123", "123.0", negatives, and "0" at the
 * string level, so Number() never has a chance to coerce something
 * unintended into a plausible-looking ID. Number.isSafeInteger is a second,
 * belt-and-suspenders check against precision loss.
 */
export function parseAdminIds(raw: string | undefined): ParsedAdminIds {
  if (!raw) return { ids: new Set(), invalidEntries: [] };

  const ids = new Set<number>();
  const invalidEntries: string[] = [];

  for (const rawEntry of raw.split(",")) {
    const entry = rawEntry.trim();
    if (!entry) continue;

    const id = Number(entry);
    if (ADMIN_ID_PATTERN.test(entry) && Number.isSafeInteger(id) && id > 0) {
      ids.add(id);
    } else {
      invalidEntries.push(entry);
    }
  }

  return { ids, invalidEntries };
}
