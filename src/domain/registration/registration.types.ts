export type RegistrationDraft = {
  telegramId: number;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
};

// Keep in sync with the backend's expected consent version for Telegram registration.
export const BOT_CONSENT_VERSION = 1;

/**
 * A RegistrationDraft is only allowed to reach the backend once these fields
 * are attached — and they must come from an explicit consent decision (the
 * user tapping Continue on the consent screen), never assumed by default.
 */
export type ConsentedRegistrationDraft = RegistrationDraft & {
  consentAccepted: true;
  consentVersion: number;
};
