import { describe, test, expect } from 'vitest';
import { WIDGET_REGISTRY, widgetsForSurface, type WidgetDef } from './registry';

// A throwaway def so the filter has data independent of real widgets.
const def = (id: string, surface: WidgetDef['surface']): WidgetDef => ({
  id, title: id, description: id, icon: (() => null) as unknown as WidgetDef['icon'],
  category: 'test', surface, defaultSize: { w: 1, h: 1 },
  component: () => null,
});

describe('widgetsForSurface', () => {
  test('returns widgets tagged for the surface plus the shared ones, never the other surface', () => {
    const reg: Record<string, WidgetDef> = {
      a: def('a', 'naas'), b: def('b', 'ai'), c: def('c', 'both'),
    };
    const naas = widgetsForSurface('naas', reg).map(w => w.id).sort();
    const ai = widgetsForSurface('ai', reg).map(w => w.id).sort();
    expect(naas).toEqual(['a', 'c']);
    expect(ai).toEqual(['b', 'c']);
  });

  test('the real registry is keyed by each widget id', () => {
    for (const [key, w] of Object.entries(WIDGET_REGISTRY)) expect(w.id).toBe(key);
  });
});
