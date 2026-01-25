export function homeMessage(firstName?: string | null) {
  const name = firstName?.trim() || "🙂";

  return [`Привет, ${name}! ✅`, "", "Выбирай, что хочешь открыть:"].join("\n");
}
