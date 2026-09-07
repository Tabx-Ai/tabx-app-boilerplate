// Vitest setup, loaded before every suite (spec 007 FR-014).
//
// jest-dom's matchers are what let a test say `toBeInTheDocument()` instead of
// asserting on a node reference — assertions read as what a user would see,
// which is the only thing a route test is really about.
import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Spec 056 FR-002. One `asyncUtilTimeout` for the project, and the reasoning
// recorded ONCE — this line previously existed in six separate suites.
//
// Testing-library gives `findBy*` 1000ms. A product route in this frontend
// renders through a session gate, a section shell and one or two queries before
// anything is findable, and that is most of the 1000ms before the test's own
// work starts. Six suites hit it independently and each fixed it locally:
// organization-home (five parallel count queries), designations (a 300ms
// debounce plus a settling request), policies (~1.4s of gate + shell + two
// queries), rate-limits, ai-models and monitoring/traces.
//
// What this is NOT: a slow test, or a real defect. Every one of those suites
// passed ALONE and failed under load — the shape that gets a test called flaky
// and deleted instead of fixed.
//
// 5s is headroom, not a mask. Nothing here should take a second; a suite that
// approaches this has genuinely regressed. The ceiling above it lives in
// `vite.config.ts` (`testTimeout`), and must stay a MULTIPLE of this number —
// equal is the bug, because the test is then killed before the wait can name
// what it wanted.
// ---------------------------------------------------------------------------
configure({ asyncUtilTimeout: 5_000 });

import { installBrowserStubs, resetBrowserStubs } from './browser-stubs';

// Unmount between tests, BY HAND. Testing Library auto-registers this only when
// a global `afterEach` exists, and this project runs with `globals: false` (tests
// import what they use). Without it every render stacks up in the same document
// and queries start failing with "found multiple elements" — a failure that reads
// like a bug in the component and is a bug in the setup.
afterEach(cleanup);
// The theme reset that used to live here went with ThemeProvider (spec 010):
// nothing writes a theme to localStorage or to <html>'s class list any more, so
// there is nothing for a test to leak into the next one.

// ---------------------------------------------------------------------------
// Browser APIs jsdom does not give us, and one it loses to Node.
//
// These shims outlived the ThemeProvider that first needed them, and they stay:
// shadcn's `sidebar` reads `window.matchMedia` through its use-mobile hook, and
// a component reaching for `localStorage` is a matter of time. Both are missing
// here for DIFFERENT reasons, and both fail as `x is not a function` rather than
// as anything that names the environment:
//
//  - `localStorage`: Node >= 22 ships its own Web Storage global, which shadows
//    jsdom's and is inert unless node was started with `--localstorage-file`
//    (hence the warning vitest prints). So the global exists, and every method
//    on it is undefined — a shape no feature detection would guess at.
//  - `matchMedia`: jsdom has never implemented it.
// ---------------------------------------------------------------------------

if (typeof globalThis.localStorage?.getItem !== 'function') {
  const store = new Map<string, string>();

  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}

// Radix's ScrollArea, Select and Command all measure themselves. jsdom has no
// ResizeObserver at all, so importing any of them into a test throws
// `ResizeObserver is not defined` before a single assertion runs — a failure
// that names nothing about the component under test.
if (typeof globalThis.ResizeObserver !== 'function') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    configurable: true,
    writable: true,
  });
}

// cmdk's Command list scrolls its selected item into view on mount. jsdom
// implements no scrolling at all, so the method is simply absent.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

// `matchMedia` and `IntersectionObserver` moved into ./browser-stubs (spec 011
// T025). Both are still missing for the reasons above; what changed is that the
// home page's behaviour DEPENDS on their answers — smooth scroll versus auto,
// which section is active — so a stub with a fixed return can only ever exercise
// one branch. The versions there are drivable, and `resetBrowserStubs` below stops
// one test's setting from leaking into the next.
installBrowserStubs();
afterEach(resetBrowserStubs);
