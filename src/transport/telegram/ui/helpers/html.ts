export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function joinLines(lines: Array<string | null | undefined>) {
  return lines
    .filter((x): x is string => Boolean(x && x.trim() !== ""))
    .join("\n");
}
