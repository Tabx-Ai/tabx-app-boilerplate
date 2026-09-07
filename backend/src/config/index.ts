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
});

/** Every key the config module reads — asserted equal to `.env.example` by a test. */
export const ENV_KEYS: readonly string[] = Object.keys(envSchema.shape);

/** Typed, per-concern namespaces — consumers take the namespace, never a raw string key. */
export interface AppConfig {
  app: {
    name: string;
    stage: 'dev' | 'prod';
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
  };
}

let cached: AppConfig | undefined;

/** The cold-start singleton — parsed on first use, held for the invocation's lifetime. */
export function config(): AppConfig {
  cached ??= loadConfig();
  return cached;
}
