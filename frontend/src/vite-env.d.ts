/// <reference types="vite/client" />

// Types for the virtual module `~react-pages` that vite-plugin-pages generates
// (spec 007 FR-005). Without this reference the import resolves to an implicit
// `any`: strict mode reports nothing, and the route table silently loses every
// guarantee it is supposed to give.
/// <reference types="vite-plugin-pages/client-react" />

// Vite's own `ImportMetaEnv` carries an `any` index signature, so an unknown
// key typechecks as `any` and a typo is invisible. Declaring the variables this
// app actually reads gives `src/config/` a real type to resolve (spec 008
// FR-007) — and anything not listed here is a compile error, which is the point.
interface ImportMetaEnv {
  /**
   * Optional override for the API base URL. Absent in every normal environment:
   * the platform is same-origin. Set it in this project's `.env.local` only — the repo
   * root `.env` is deliberately outside Vite's `envDir`.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
