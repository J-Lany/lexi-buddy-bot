export enum StudentAssignmentStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  GRADED = "GRADED",
}

export function isAssignmentDone(status: StudentAssignmentStatus): boolean {
  return (
    status === StudentAssignmentStatus.COMPLETED ||
    status === StudentAssignmentStatus.GRADED
  );
}
