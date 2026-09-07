/**
 * Browser APIs jsdom does not implement, in a form a test can DRIVE (spec 011
 * T025).
 *
 * `setup.ts` installs these once per worker. The difference from the stubs that
 * were already there is control: the home page's behaviour depends on what
 * `matchMedia` answers and on when `IntersectionObserver` fires, so a fixed stub
 * can only ever exercise one of the two branches.
 *
 * The mutable state lives HERE rather than in `setup.ts` because a test cannot
 * safely import the setup file — importing a module that vitest also loads through
 * `setupFiles` risks a second evaluation and a second, unrelated copy of this
 * state. Both this module and `setup.ts` reach the same instance through the
 * ordinary module graph.
 *
 * Call `resetBrowserStubs()` in an `afterEach`, or the reduced-motion flag set by
 * one test silently changes the meaning of the next.
 */

// --------------------------------------------------------------- reduced motion

let reducedMotion = false;

/** Make `prefers-reduced-motion: reduce` match (or stop matching). */
export function setReducedMotion(value: boolean): void {
  reducedMotion = value;
}

// --------------------------------------------------- IntersectionObserver control

type StubbedObserver = {
  callback: IntersectionObserverCallback;
  instance: IntersectionObserver;
  targets: Element[];
};

const observers: StubbedObserver[] = [];

/**
 * Drive the scrollspy: declare which section ids are currently in view.
 *
 * Reports only the targets an observer actually watches, and only those named in
 * `updates` — which mirrors the real API, where a callback receives the entries
 * that CHANGED rather than the full set. A hook that recomputed its answer purely
 * from `entries` would pass against a stub that always sent everything and then
 * fail in a browser.
 */
export function triggerIntersection(updates: readonly { id: string; isIntersecting: boolean }[]): void {
  for (const observer of observers) {
    const entries = updates
      .map((update) => {
        const target = observer.targets.find((element) => element.id === update.id);
        if (!target) return null;

        return {
          target,
          isIntersecting: update.isIntersecting,
          intersectionRatio: update.isIntersecting ? 1 : 0,
          time: 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
        } as unknown as IntersectionObserverEntry;
      })
      .filter((entry): entry is IntersectionObserverEntry => entry !== null);

    if (entries.length > 0) observer.callback(entries, observer.instance);
  }
}

// ------------------------------------------------------------ EventSource control

/**
 * The live run stream's transport (spec 098), in a form a test can drive: `emit` delivers a
 * frame to whatever `onmessage` the hook installed, and `closed` records the hook closing it
 * on a terminal event. jsdom has no EventSource at all, so unlike `matchMedia` this is not
 * replacing a weak implementation — without it the hook throws on construction.
 */
export class StubEventSource {
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;

  constructor(readonly url: string) {
    eventSources.push(this);
  }

  emit(data: unknown): void {
    this.onmessage?.({
      data: typeof data === 'string' ? data : JSON.stringify(data),
    } as MessageEvent<string>);
  }

  close(): void {
    this.closed = true;
  }
}

const eventSources: StubEventSource[] = [];

/** Every EventSource constructed since the last reset, in construction order. */
export function openEventSources(): readonly StubEventSource[] {
  return eventSources;
}

// ------------------------------------------------------------------- installation

/** Install every stub onto the global object. Called once by `setup.ts`. */
export function installBrowserStubs(): void {
  // Always defined, never guarded: unlike the other shims this one has to answer
  // differently per test, so an existing definition must be replaced.
  Object.defineProperty(globalThis, 'matchMedia', {
    value: (query: string): MediaQueryList =>
      ({
        matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
    configurable: true,
    writable: true,
  });

  class StubIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: readonly number[] = [];

    #entry: StubbedObserver;

    constructor(callback: IntersectionObserverCallback) {
      this.#entry = { callback, instance: this, targets: [] };
      observers.push(this.#entry);
    }

    observe(target: Element): void {
      this.#entry.targets.push(target);
    }

    unobserve(target: Element): void {
      this.#entry.targets = this.#entry.targets.filter((element) => element !== target);
    }

    disconnect(): void {
      this.#entry.targets = [];
      const index = observers.indexOf(this.#entry);
      if (index !== -1) observers.splice(index, 1);
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: StubIntersectionObserver,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, 'EventSource', {
    value: StubEventSource,
    configurable: true,
    writable: true,
  });
}

/** Clear per-test state. Belongs in an `afterEach`. */
export function resetBrowserStubs(): void {
  reducedMotion = false;
  observers.length = 0;
  eventSources.length = 0;
}
