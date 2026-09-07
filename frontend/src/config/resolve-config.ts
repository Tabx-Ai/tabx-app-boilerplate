/**
 * The one place the frontend reads its environment — the mirror of the backend's single config
 * module (constitution Article VI). Nothing else in `src/` touches `import.meta.env`, so a
 * setting has one name, one type, and one default.
 *
 * It holds **no credential** (Article VII). The pass token is a runtime artifact owned by
 * `src/api/token.ts`, never configuration.
 */
import { deriveApiBase } from './derive-api-base';

export interface AppConfig {
  /**
   * The origin every backend call is sent to.
   *
   * **Derived from the page's own hostname** (`derive-api-base.ts`): an app served from
   * `<slug>.apps.<apex>` calls `https://<slug>.api.<apex>`, where the platform's proxy turns
   * the request into an invocation envelope. Anywhere else — `localhost` above all — this is
   * **`''`**, a relative base the dev server forwards to the local harness.
   *
   * One transport in both environments, and no build-time switch: the same controller code
   * path runs locally and deployed.
   */
  readonly apiBaseUrl: string;
}

/**
 * `VITE_API_BASE_URL` exists for exactly one case: pointing a locally-run frontend at a
 * deployed proxy. Set it in this project's `.env.local`; the default needs nothing.
 *
 * It replaces `VITE_INVOKE_URL`, which is gone along with the envelope the client used to
 * POST — the platform's proxy builds the envelope from an ordinary request, so the client
 * sends one.
 */
export function resolveConfig(hostname: string = globalThis.location?.hostname ?? ''): AppConfig {
  const override: unknown = import.meta.env.VITE_API_BASE_URL;
  if (typeof override === 'string' && override.length > 0) {
    return { apiBaseUrl: override.replace(/\/+$/, '') };
  }
  return { apiBaseUrl: deriveApiBase(hostname) };
}

export const config: AppConfig = resolveConfig();
