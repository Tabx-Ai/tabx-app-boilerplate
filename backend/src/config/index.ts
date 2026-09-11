/**
 * Config is parsed ONCE, here, and nowhere else (constitution Article VI §1) — no other
 * file reads process.env. Values arrive by deploy-time injection into the Lambda's
 * environment; locally the dev harness runs on the defaults below.
 *
 * Three files move together, in the same commit, whenever a key is added (Article VI §3):
 * this schema, `.env.example` (the human-readable list), and `manifest.json`'s `env`
 * (the deploy-facing list). A test cross-checks them.
 */
import { z } from 'zod';

/**
 * The environment this app reads. Every key is defaulted so a bare clone runs with no
 * .env at all; a key an app's own spec makes REQUIRED simply drops the `.default(...)`
 * — the failure mode below (loud, naming the key) already handles it.
 */
export const envSchema = z.object({
  /** The app's name, used in responses and logs. Architect's deploy sets it. */
  APP_NAME: z.string().min(1).default('boilerplate-app'),
  /** Which environment this invocation believes it is in. */
  STAGE: z.enum(['dev', 'prod']).default('dev'),
  /**
   * The platform's API base, e.g. `https://tabx.example.com/api` — what the `tabx/` SDK calls
   * (constitution Article XIV). **Optional on purpose:** most apps never call the platform, and
   * a required key would make the SDK mandatory for every clone. Absent, the app boots and
   * answers normally and the SDK's FIRST call fails naming this variable — Article VI §4's
   * optional-integration shape.
   */
  TABX_URL: z.url().optional(),
  /**
   * This app's own Postgres connection string (constitution Article XV) — the platform's
   * Session Pooler shape, scoped to this app's own database. **Optional in this schema**,
   * mirroring `TABX_URL` exactly: every app HAS a schema (the platform provisions one
   * unconditionally), but not every generated app persists anything, so a required key here
   * would make every clone depend on a live Postgres connection just to boot.
   */
  OLTP_URL: z.string().min(1).optional(),
  /**
   * This app's own schema name inside that connection, e.g. `app_<id-without-hyphens>` — the
   * platform derives it and injects it; this app never computes it. Optional for the same
   * reason as `OLTP_URL`; the two arrive together in practice, and the persistence client
   * fails naming whichever is actually missing.
   */
  OLTP_SCHEMA: z.string().min(1).optional(),
});

/** Every key the config module reads — asserted equal to `.env.example` by a test. */
export const ENV_KEYS: readonly string[] = Object.keys(envSchema.shape);

/** Typed, per-concern namespaces — consumers take the namespace, never a raw string key. */
export interface AppConfig {
  app: {
    name: string;
    stage: 'dev' | 'prod';
  };
  /** The platform integration. `url` is `undefined` when this app never calls the platform. */
  tabx: {
    url: string | undefined;
  };
  /**
   * This app's own database (Article XV). Both fields are `undefined` together in practice —
   * they arrive from the same platform injection — but each is read and checked independently,
   * so a partially-set pair still names the actual missing one rather than a generic complaint.
   */
  persistent: {
    url: string | undefined;
    schema: string | undefined;
  };
}

/** Thrown when the environment cannot be parsed; the message NAMES the offending keys. */
export class ConfigError extends Error {
  constructor(readonly keys: string[], detail: string) {
    super(`Configuration invalid — fix these variables: ${keys.join(', ')}. ${detail}`);
    this.name = 'ConfigError';
  }
}

/**
 * Parse an environment against a schema. Exported with the schema injectable so the
 * failure path is testable with a required key; production callers use the defaults.
 */
export function loadConfig(
  env: Record<string, string | undefined> = process.env,
  schema: z.ZodObject = envSchema,
): AppConfig {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? '?')))];
    const detail = parsed.error.issues
      .map((issue) => `${String(issue.path[0] ?? '?')}: ${issue.message}`)
      .join('; ');
    throw new ConfigError(keys, detail);
  }
  const values = parsed.data as z.infer<typeof envSchema>;
  return {
    app: {
      name: values.APP_NAME,
      stage: values.STAGE,
    },
    tabx: {
      url: values.TABX_URL,
    },
    persistent: {
      url: values.OLTP_URL,
      schema: values.OLTP_SCHEMA,
    },
  };
}

let cached: AppConfig | undefined;

/** The cold-start singleton — parsed on first use, held for the invocation's lifetime. */
export function config(): AppConfig {
  cached ??= loadConfig();
  return cached;
}
