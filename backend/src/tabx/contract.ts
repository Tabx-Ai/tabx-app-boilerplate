/**
 * The SDK's contract — the shapes the platform answers with, as SCHEMAS (constitution
 * Article XIV).
 *
 * **A response is parsed, never asserted.** `as TabxUser` on a `fetch` result is a promise the
 * compiler believes and the runtime does not: a field the platform renamed becomes `undefined`
 * three layers away, in someone's page, with no error naming the cause. Parsing moves that
 * failure to the boundary and names the field.
 *
 * These are deliberately NARROWER than the platform's own contracts. This app is not entitled
 * to the platform's internals, and a schema that copied them would break every time one moved.
 * Only the fields the six methods promise are declared, and unknown keys are dropped.
 */
import { z } from 'zod';

/** A thing with an id and a name — a department, a designation, a subsidiary, a role. */
export const namedRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export type NamedRef = z.infer<typeof namedRefSchema>;

/**
 * A workspace member as this app sees them.
 *
 * `department`, `designation` and `subsidiary` are always present on a member (the platform's
 * own columns are NOT NULL); `role` and `manager` may be absent — access is granted rather than
 * assumed, and not everyone reports to someone.
 */
export const tabxUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().min(1),
  department: namedRefSchema,
  designation: namedRefSchema,
  subsidiary: namedRefSchema,
  role: namedRefSchema.nullable().default(null),
  manager: namedRefSchema.extend({ email: z.string().min(1) }).nullable().default(null),
});

export type TabxUser = z.infer<typeof tabxUserSchema>;

/**
 * The platform's page envelope. `page` is 1-based; `total` is the whole matching set, not this
 * page's length — which is what a caller needs to decide whether to ask for another.
 */
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** The query `users.list` accepts. Both fields optional: no arguments means the first page. */
export const usersListQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  search: z.string().min(1).optional(),
});

export type UsersListQuery = z.infer<typeof usersListQuerySchema>;

/** The list endpoints answer a bare array — no envelope, because there is no paging. */
export const namedRefListSchema = z.array(namedRefSchema);
