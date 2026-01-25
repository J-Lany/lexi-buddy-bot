export enum StudentAssignmentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  GRADED = "GRADED",
}

export function isAssignmentDone(status: StudentAssignmentStatus): boolean {
  return (
    status === StudentAssignmentStatus.COMPLETED ||
    status === StudentAssignmentStatus.GRADED
  );
}
