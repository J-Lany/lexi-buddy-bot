import { env } from "./env.js";
import { buildLegalUrl } from "./website-base-url.js";

export const legalUrls = {
  privacy: buildLegalUrl(env.websiteBaseUrl, "/privacy"),
  terms: buildLegalUrl(env.websiteBaseUrl, "/terms"),
};
