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

  /* Minor: the exposure sentence named `externalRow` — the gpt-class row and
     nothing else. With all three identities metering and all three public it
     read "100% of AI Fabric tokens (1.4k) … via Shared Platform Services on
     GPT-class" beside a Records table showing that row carrying about a third
     of them. Name what is actually true. MUTATES: meters every identity. */
  it('attributes public tokens to what is actually public, not to the external row alone', () => {
    const meters = CC.tokenMeterList() as { tag: string }[];
    // Deliberately uneven, and deliberately NOT largest on the gpt-class row,
    // so an attribution that still hardcodes the external model is visible.
    const volumes = [1_183, 1_225, 1_320];
    meters.forEach((m, i) => CC.meterTokens(m.tag, volumes[i]));

    const rows = aiBinding(CC).records('none') as { cells: string[] }[];
    const onPublic = publicRouteRows();
    expect(onPublic.length, 'more than one public identity, or this proves nothing').toBeGreaterThan(1);
    expect(rows.length).toBe(meters.length);

    const routes = CC.modelRoutes() as { app: string; path: string }[];
    const tags = CC.tokenMeterList() as { tag: string; today: number }[];
    const largestPublic = routes
      .map((r, i) => ({ app: r.app, path: r.path, today: tags[i].today }))
      .filter(r => r.path === 'public')
      .sort((a, b) => b.today - a.today)[0];

    const text = briefingText();
    expect(text).toMatch(/still cross the public internet/i);
    // It counts the public identities…
    expect(text).toContain(`across ${onPublic.length} identities`);
    // …and leads with the one actually carrying the most of those tokens.
    expect(text).toContain(largestPublic.app);
    // The old sentence attributed the whole figure to one row with "via".
    expect(text, 'a single-row attribution for a multi-row figure').not.toMatch(
      /still cross the public internet via /i,
    );
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
