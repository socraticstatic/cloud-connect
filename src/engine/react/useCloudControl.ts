import { useMemo, useRef, useSyncExternalStore } from 'react';
import { CC } from '../index';
import type { CloudControl, CloudControlEvent } from '../types';

/**
 * Module-level mutation counter.
 *
 * `useSyncExternalStore` requires `getSnapshot` to return a value that is
 * referentially stable between renders unless the underlying store actually
 * changed. A selector like `cc => cc.counts()` returns a brand-new object on
 * every call, so if `getSnapshot` returned `selector(CC)` directly, React
 * would see a "changed" snapshot on every render and throw/loop ("The result
 * of getSnapshot should be cached to avoid an infinite loop").
 *
 * Instead, `getSnapshot` returns this counter (a primitive, trivially
 * stable). It only increments when the engine actually emits a real mutation
 * event (i.e. anything other than a `hits` tick), so React only re-renders
 * when something real happened — never because a selector produced a new
 * object reference for the same underlying state.
 */
let version = 0;

// Registering the same listener object twice (e.g. React invoking subscribe
// again in StrictMode) would double the increments per mutation; a Set of
// wrapped callbacks keyed by the original `cb` avoids that.
const wrappedByCallback = new WeakMap<() => void, (ev?: CloudControlEvent) => void>();

function subscribe(cb: () => void) {
  let wrapped = wrappedByCallback.get(cb);
  if (!wrapped) {
    wrapped = (ev) => {
      if (ev && ev.type === 'hits') return;
      version++;
      cb();
    };
    wrappedByCallback.set(cb, wrapped);
  }
  // The engine's subscribe() returns a real unsubscribe (state.ts), which is
  // what useSyncExternalStore's contract requires here — returning a no-op
  // left every component that ever mounted subscribed for the life of the
  // page. `wrapped` is stable per `cb` via the WeakMap above, so the teardown
  // removes exactly the listener this call registered.
  return CC.subscribe(wrapped);
}

function getSnapshot() {
  return version;
}

/**
 * Subscribes a component to the Cloud Control engine (`window.CC`) and
 * returns the selected slice of state, re-rendering whenever the engine
 * mutates (telemetry `hits` ticks are intentionally excluded).
 *
 * Safe for selectors that return primitives (`cc => cc.counts().attached`)
 * AND selectors that return fresh objects/arrays each call
 * (`cc => cc.counts()`) — see the `version` counter above for why the latter
 * doesn't throw or infinite-loop.
 */
export function useCloudControl<T>(selector: (cc: CloudControl) => T): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const v = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Re-run the selector only when the engine's version actually changes, not
  // on every render — this is what keeps an object-returning selector from
  // producing a "new" value each render even though the store snapshot (v)
  // is stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => selectorRef.current(CC), [v]);
}

/** Returns the engine handle directly, for calling mutations from components. */
export function useCloudControlActions(): CloudControl {
  return CC;
}
