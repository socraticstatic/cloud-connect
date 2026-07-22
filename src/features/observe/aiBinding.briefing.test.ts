import { describe, it, expect } from 'vitest';
import { CC } from '../../engine';
import { aiBinding } from './aiBinding';

/**
 * The briefing and the Records table render on the same screen, a few hundred
 * pixels apart. Whatever the briefing says about exposure has to be true of
 * the rows the reader can see next to it — in every state the engine reaches,
 * not just the interesting one.
 *
 * The state this exists for: a seeded estate meters nothing, so "share of
 * tokens crossing the public internet" is 0%, and reading that as a posture
 * printed "No AI Fabric traffic currently crosses the public internet — every
 * identity rides a private or governed path" directly beside a table listing
 * all three identities on Public internet.
 */

const briefingText = () =>
  aiBinding(CC)
    .briefing()
    .narrative.map(b => b.text)
    .join(' ');

const publicRouteRows = () =>
  (aiBinding(CC).records('none') as { cells: string[] }[]).filter(r =>
    r.cells.some(c => /public internet/i.test(c)),
  );

describe('AI Fabric briefing', () => {
  it('never claims a clean posture while the table beside it shows public routes', () => {
    const onPublic = publicRouteRows();
    expect(onPublic.length, 'seeded estate should still have public AI routes').toBeGreaterThan(0);

    const text = briefingText();
    expect(text).not.toMatch(/every identity rides a private or governed path/i);
    expect(text).not.toMatch(/No AI Fabric traffic currently crosses the public internet/i);
    // …and it accounts for them by number, from the same records.
    expect(text).toContain(`${onPublic.length} of`);
  });

  it('does not report a "top token consumer" when no identity is consuming', () => {
    const totalTokens = (CC.tokenMeterList() as { today: number }[]).reduce(
      (s, m) => s + m.today,
      0,
    );
    expect(totalTokens, 'this assertion assumes an unlit estate').toBe(0);
    expect(briefingText()).not.toMatch(/top token consumer/i);
    expect(briefingText()).toMatch(/No identity is metering yet/i);
  });

  it('names the largest ceiling by budget, not by whichever row a zero-sort landed on', () => {
    const meters = CC.tokenMeterList() as { tag: string; budget: number }[];
    const largest = meters.slice().sort((a, b) => b.budget - a.budget)[0];
    const text = briefingText();

    // The figure must be the real maximum ceiling in the estate.
    const shownM = /largest ceiling at ([\d.]+)M tokens/.exec(text);
    expect(shownM, `no ceiling figure in briefing: ${text}`).toBeTruthy();
    expect(Number(shownM![1])).toBeCloseTo(largest.budget / 1_000_000, 2);
  });

  /* Once the fabric is lit the briefing switches to the consumption reading.
     Runs last: the engine is a shared singleton and this mutates it. */
  it('switches to the measured reading once tokens are actually metered', () => {
    CC.activateOnramp('nb2');
    (CC._ as { tickTokens: (rng: () => number) => boolean }).tickTokens(() => 0.5);

    const totalTokens = (CC.tokenMeterList() as { today: number }[]).reduce(
      (s, m) => s + m.today,
      0,
    );
    expect(totalTokens).toBeGreaterThan(0);

    const text = briefingText();
    expect(text).toMatch(/top token consumer/i);
    expect(text).not.toMatch(/No identity is metering yet/i);
  });
});
