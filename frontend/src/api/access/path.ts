/**
 * The paths the `access` domain serves — this app's own backend, not the platform's.
 *
 * **Policies live in the app**, so the answer to *what may I do here* comes from the app's
 * backend. The platform's reserved session path answers *who am I*, which is a different
 * question with a different owner.
 */
export const accessPaths = {
  /** Every declared policy's answer for the caller, in one request. */
  get: '/access',
} as const;
