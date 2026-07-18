import { BackendApiService } from "../infra/backend-api/backend-api.service.js";
import { RegistrationService } from "../domain/registration/registration.service.js";
import { InvitesService } from "../domain/invites/invites.service.js";
import { StudentHomeService } from "../domain/student-home/student-home.service.js";
import { LessonsService } from "../domain/lessons/lessons.service.js";
import { ProfileService } from "../domain/profile/profile.service.js";
import { StudentAssignmentsService } from "../domain/student-assignments/student-assignments.service.js";

export function createContainer() {
  const backendApi = new BackendApiService();

  const registrationService = new RegistrationService(backendApi);
  const invitesService = new InvitesService(backendApi);
  const lessonsService = new LessonsService(backendApi);
  const profileService = new ProfileService(backendApi);
  const studentHomeService = new StudentHomeService(
    registrationService,
    profileService,
  );

  const studentAssignmentsService = new StudentAssignmentsService(backendApi);

  return {
    backendApi,
    registrationService,
    invitesService,
    studentHomeService,
    lessonsService,
    profileService,
    studentAssignmentsService,
  };
}

export type Container = ReturnType<typeof createContainer>;
