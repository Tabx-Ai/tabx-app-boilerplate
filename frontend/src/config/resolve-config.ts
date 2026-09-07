/**
 * The one place the frontend reads its environment — the mirror of the backend's single
 * config module (constitution Article VI). Nothing else in `src/` touches
 * `import.meta.env`, so a setting has one name, one type, and one default.
 *
 * It holds **no credential** (Article VII). The pass token is a runtime artifact owned by
 * `src/api/token.ts`, never configuration.
 */
export interface AppConfig {
  /**
   * The path (or absolute URL) the client POSTs every request envelope to — the platform
   * proxy's invoke endpoint. Relative by default so the SPA is origin-agnostic: locally
   * Vite forwards /invoke to the dev harness; deployed, the platform routes it.
   */
  readonly invokeUrl: string;
}

export const DEFAULT_INVOKE_URL = '/invoke';

/**
 * `VITE_INVOKE_URL` exists for exactly one case: pointing a local frontend at a proxy that
 * is somewhere else. Set it in `frontend/.env.local`; the default needs nothing.
 */
export function resolveConfig(): AppConfig {
  const raw: unknown = import.meta.env.VITE_INVOKE_URL ?? DEFAULT_INVOKE_URL;
  const invokeUrl = (typeof raw === 'string' && raw.length > 0 ? raw : DEFAULT_INVOKE_URL).replace(
    /\/+$/,
    '',
  );
  return { invokeUrl: invokeUrl.length > 0 ? invokeUrl : DEFAULT_INVOKE_URL };
}

export const config: AppConfig = resolveConfig();
