/**
 * The SDK's public SURFACE — six read-only methods, and nothing else (constitution
 * Article XIV).
 *
 * ## What "limited" means, and what it does not
 *
 * **It does mean:** the surface is these six, there is no `request(path)` escape hatch on it,
 * and a seventh method is a deliberate edit to this file that a test notices.
 *
 * **It does not mean the app is confined to them.** The credential is the caller's own session
 * token; any code in this app can call any platform route that person could. The SDK limits
 * what is *easy*, not what is *possible* — the only real boundary would be a scoped token,
 * which is the platform's open question, not this app's.
 *
 * ## Prefer the injected context over `me()`
 *
 * Identity arrives free with every invocation (`context.ts`). `me()` costs a network call and
 * can fail. Use it for fields the context does not carry, or to confirm a session is still
 * live — not as the ordinary way to learn who is calling.
 */
import { clientForInvocation, createClient, type TabxClient } from './client.js';
import {
  namedRefListSchema,
  pageSchema,
  tabxUserSchema,
  usersListQuerySchema,
  type NamedRef,
  type Page,
  type TabxUser,
  type UsersListQuery,
} from './contract.js';

/** The typed surface an app calls. Read-only: no create, no update, no delete. */
export interface Tabx {
  /** The person this invocation is for, as the platform knows them. */
  me(): Promise<TabxUser>;
  users: {
    /** One page of workspace members. No arguments means the first page, unfiltered. */
    list(query?: UsersListQuery): Promise<Page<TabxUser>>;
    /** One member by id. The platform refuses an id outside this workspace. */
    get(id: string): Promise<TabxUser>;
  };
  org: {
    departments(): Promise<NamedRef[]>;
    designations(): Promise<NamedRef[]>;
    subsidiaries(): Promise<NamedRef[]>;
  };
}

/**
 * The paths this SDK calls. Every one is a route the platform already serves — the SDK adds no
 * endpoint, so nothing here can drift ahead of the platform without a 404 saying so.
 */
const PATHS = {
  me: '/v1/me',
  users: '/v1/users',
  departments: '/v1/organization/departments',
  designations: '/v1/organization/designations',
  subsidiaries: '/v1/organization/subsidiaries',
} as const;

/** Build the surface over a client. The client is a parameter so a test needs no module mock. */
export function tabxOver(client: TabxClient): Tabx {
  return {
    me: () => client.get(PATHS.me, tabxUserSchema),
    users: {
      list: (query?: UsersListQuery) => {
        // Parsed on the way OUT too: a bad page number should fail here, naming the field,
        // rather than as an opaque 400 from a service this app does not own.
        const parsed = usersListQuerySchema.parse(query ?? {});
        const search: Record<string, string> = {};
        if (parsed.page !== undefined) search['page'] = String(parsed.page);
        if (parsed.search !== undefined) search['search'] = parsed.search;
        return client.get(PATHS.users, pageSchema(tabxUserSchema), search);
      },
      get: (id: string) => client.get(`${PATHS.users}/${encodeURIComponent(id)}`, tabxUserSchema),
    },
    org: {
      departments: () => client.get(PATHS.departments, namedRefListSchema),
      designations: () => client.get(PATHS.designations, namedRefListSchema),
      subsidiaries: () => client.get(PATHS.subsidiaries, namedRefListSchema),
    },
  };
}

/** The surface bound to one invocation's token. */
export function tabxForToken(token: string): Tabx {
  return tabxOver(createClient(token));
}

/**
 * The surface for one invocation — the whole envelope in, so no caller outside `client.ts`
 * touches the token field (SC-002). This is what `handler.ts` binds.
 */
export function tabxForInvocation(envelope: { token?: string | undefined }): Tabx {
  return tabxOver(clientForInvocation(envelope));
}
