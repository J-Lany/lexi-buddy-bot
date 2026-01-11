import { BackendApiService } from "../infra/backend-api/backend-api.service.js";
import { RegistrationService } from "../domain/registration/registration.service.js";
import { InvitesService } from "../domain/invites/invites.service.js";
import { StudentHomeService } from "../domain/student-home/student-home.service.js";

export function createContainer() {
  const backendApi = new BackendApiService();

  const registrationService = new RegistrationService(backendApi);
  const invitesService = new InvitesService(backendApi);

  const studentHomeService = new StudentHomeService(registrationService);

  return {
    backendApi,
    registrationService,
    invitesService,
    studentHomeService,
  };
}

export type Container = ReturnType<typeof createContainer>;
