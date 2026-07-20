import { describe, it, expect } from 'vitest';
import { CC } from './index';

type Ev = { type?: string } | undefined;
const bag = () => (CC as unknown as { _: { emit: (ev: Ev) => void; listeners: unknown[] } })._;

/* F2. CC.subscribe was append-only: it pushed onto the listener array and
   returned nothing, so every component that ever mounted stayed subscribed for
   the lifetime of the page. useSyncExternalStore's contract requires the
   subscribe callback to return an unsubscribe function; a no-op satisfied the
   type checker and leaked in practice. */
describe('CC.subscribe teardown', () => {
  it('returns a function that removes the listener', () => {
    const seen: Ev[] = [];
    const un = CC.subscribe(ev => { seen.push(ev); });
    expect(typeof un).toBe('function');

    bag().emit({ type: 'policy' });
    expect(seen.length).toBe(1);

    un();
    bag().emit({ type: 'policy' });
    expect(seen.length).toBe(1);
  });

  it('does not grow the listener array across subscribe/unsubscribe cycles', () => {
    const before = bag().listeners.length;
    for (let i = 0; i < 5; i++) CC.subscribe(() => {})();
    expect(bag().listeners.length).toBe(before);
  });

  it('unsubscribing during an emit still delivers to the remaining listeners', () => {
    // emit() iterating the live array would skip the next listener when one
    // splices itself out mid-iteration.
    const seen: string[] = [];
    const unA = CC.subscribe(() => { seen.push('a'); unA(); });
    const unB = CC.subscribe(() => { seen.push('b'); });
    bag().emit({ type: 'policy' });
    expect(seen).toEqual(['a', 'b']);
    unB();
  });
});
