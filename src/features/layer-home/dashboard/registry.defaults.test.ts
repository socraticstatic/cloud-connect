import { describe, test, expect } from 'vitest';
import { WIDGET_REGISTRY, DEFAULT_LAYOUT, widgetsForSurface, type Surface } from './registry';

describe('default layouts', () => {
  test.each(['naas', 'ai'] as Surface[])('every %s default widget exists and is valid for the surface', (surface) => {
    const valid = new Set(widgetsForSurface(surface).map(w => w.id));
    expect(DEFAULT_LAYOUT[surface].length).toBeGreaterThanOrEqual(3);
    for (const id of DEFAULT_LAYOUT[surface]) {
      expect(WIDGET_REGISTRY[id], `${id} missing from registry`).toBeDefined();
      expect(valid.has(id), `${id} is not valid on ${surface}`).toBe(true);
    }
  });

  /* The board opens on the layer's own actionable widget, which always states a
     figure, and Standing intents comes second. Standing intents renders its
     empty state until somebody declares one, so leading with it opened the home
     page on a blank slate while everything below it already had numbers. Both
     assertions are here so a future reshuffle has to face that decision rather
     than undo it by accident. */
  test('each board leads with its actionable widget, and Standing intents follows', () => {
    expect(DEFAULT_LAYOUT.naas[0]).toBe('money-on-the-table');
    expect(DEFAULT_LAYOUT.ai[0]).toBe('token-budgets');
    expect(DEFAULT_LAYOUT.naas[1]).toBe('standing-intents');
    expect(DEFAULT_LAYOUT.ai[1]).toBe('standing-intents');
  });

  test('Standing intents is still on both boards, not dropped', () => {
    expect(DEFAULT_LAYOUT.naas).toContain('standing-intents');
    expect(DEFAULT_LAYOUT.ai).toContain('standing-intents');
  });
});
