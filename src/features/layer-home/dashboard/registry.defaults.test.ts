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

  test('the flagship Standing Intents leads both boards', () => {
    expect(DEFAULT_LAYOUT.naas[0]).toBe('standing-intents');
    expect(DEFAULT_LAYOUT.ai[0]).toBe('standing-intents');
  });
});
