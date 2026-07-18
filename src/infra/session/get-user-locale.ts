import { upstashSessionStorage } from "./upstash-session.storage.js";

export async function getUserLocale(telegramId: number): Promise<string> {
  const session = await upstashSessionStorage.read(String(telegramId));
  return session?.__language_code ?? "en";
}
