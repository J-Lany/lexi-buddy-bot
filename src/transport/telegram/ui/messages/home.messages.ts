export function homeMessage(firstName?: string | null) {
  const name = firstName?.trim();

  const greeting = name ? `Привет, ${name} 👋` : "Привет 👋";

  return [greeting, "", "Что хочешь сделать?"].join("\n");
}
