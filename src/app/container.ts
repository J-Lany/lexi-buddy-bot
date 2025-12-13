import { BackendApiService } from "../infra/backend-api/backend-api.service.js";
import { RegistrationService } from "../domain/registration/registration.service.js";

export function createContainer() {
  const backendApi = new BackendApiService();
  const registrationService = new RegistrationService(backendApi);

  return {
    backendApi,
    registrationService,
  };
}

export type Container = ReturnType<typeof createContainer>;
