/**
 * Empty/whitespace-only/undefined all mean "not set" — normalized to
 * `undefined` so callers only ever have to deal with a single "absent" case.
 */
export function normalizeOptionalEnv(
  raw: string | undefined,
): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}
