export function parseNumberLike(value: unknown, fieldName: string): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(n)) {
    throw new Error(`${fieldName} must be a number or numeric string`);
  }

  return n;
}
