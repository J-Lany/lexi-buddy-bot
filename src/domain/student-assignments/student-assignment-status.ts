export function isAssignmentDone(status: string | null): boolean {
  return status === "COMPLETED" || status === "GRADED";
}
