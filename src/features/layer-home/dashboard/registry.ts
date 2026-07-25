import { createContext, useContext, type ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type Surface = 'naas' | 'ai';

export interface LayerWidgetProps { editing?: boolean }

export interface WidgetDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  surface: Surface | 'both';
  defaultSize: { w: 1 | 2; h: 1 | 2 };
  component: ComponentType<LayerWidgetProps>;
}

// Widgets self-register by being spread in here as they are built (Task 8
// assembles the final object). Kept as a plain object so the registry is a
// single, greppable source of truth.
export const WIDGET_REGISTRY: Record<string, WidgetDef> = {};

/** Widgets valid on `surface`: those tagged for it plus the shared ('both').
 *  The `reg` arg defaults to the real registry; tests pass their own. */
export function widgetsForSurface(
  surface: Surface,
  reg: Record<string, WidgetDef> = WIDGET_REGISTRY,
): WidgetDef[] {
  return Object.values(reg).filter(w => w.surface === surface || w.surface === 'both');
}

/** The default board per surface, as an ordered list of widget ids. Filled in
 *  Task 8 once the widgets exist. */
export const DEFAULT_LAYOUT: Record<Surface, string[]> = { naas: [], ai: [] };

// The active layer, provided by LayerDashboard so surface-aware widgets can read
// it without a data prop.
export const LayerContext = createContext<Surface>('naas');
export const useLayer = (): Surface => useContext(LayerContext);
