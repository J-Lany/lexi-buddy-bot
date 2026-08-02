export function getEditErrorKind(
  err: unknown,
): "not_modified" | "not_editable" | "other" {
  const e = err as { description?: string; message?: string };
  const msg = `${e?.description ?? ""} ${e?.message ?? ""}`.toLowerCase();

  if (msg.includes("message is not modified")) return "not_modified";

  if (
    msg.includes("message to edit not found") ||
    msg.includes("can't be edited") ||
    msg.includes("message can't be edited") ||
    msg.includes("there is no text in the message to edit")
  ) {
    return "not_editable";
  }

  return "other";
}
