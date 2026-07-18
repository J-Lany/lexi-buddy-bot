import { escapeHtml, joinLines } from "./html.js";

export function uiTitle(icon: string, title: string) {
  return `<b>${icon} ${escapeHtml(title)}</b>`;
}

export function uiMeta(items: Array<string | null | undefined>) {
  const clean = items.map((x) => (x ? x.trim() : "")).filter(Boolean);
  return clean.length ? `<i>${clean.map(escapeHtml).join(" • ")}</i>` : "";
}

export function uiLabel(label: string, value: string | null | undefined) {
  const v = value?.trim() ? escapeHtml(value.trim()) : "—";
  return `${escapeHtml(label)}: <b>${v}</b>`;
}

export function uiSection(title: string) {
  return `<b>${escapeHtml(title)}</b>`;
}

export function uiList(items: string[]) {
  return items.map((x) => `• ${escapeHtml(x)}`).join("\n");
}

export function uiQuote(title: string, body: string) {
  return `<blockquote><i>${escapeHtml(title)}</i>\n${body}</blockquote>`;
}

export function uiHint(text: string) {
  return `💡 ${escapeHtml(text)}`;
}

export function uiMessage(lines: Array<string | null | undefined>) {
  return joinLines(lines);
}
