export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function joinLines(lines: Array<string | null | undefined>) {
  const text = lines
    .filter((x): x is string => x !== null && x !== undefined)
    .map((x) => String(x))
    .join("\n");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}
