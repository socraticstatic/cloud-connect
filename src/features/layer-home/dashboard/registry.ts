import { createContext, useContext, type ComponentType } from 'react';
import { Gauge, Target, ClipboardCheck, PiggyBank, Coins, type LucideIcon } from 'lucide-react';
import { EstateFiguresWidget } from './widgets/EstateFiguresWidget';
import { StandingIntentsWidget } from './widgets/StandingIntentsWidget';
import { AssessmentFindingsWidget } from './widgets/AssessmentFindingsWidget';
import { MoneyOnTheTableWidget } from './widgets/MoneyOnTheTableWidget';
import { TokenBudgetsWidget } from './widgets/TokenBudgetsWidget';

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
export const WIDGET_REGISTRY: Record<string, WidgetDef> = {
  'standing-intents': {
    id: 'standing-intents', title: 'Standing intents',
    description: 'Each declared intent, whether it is holding, and the one-click fix.',
    icon: Target, category: 'Govern', surface: 'both', defaultSize: { w: 2, h: 2 },
    component: StandingIntentsWidget,
  },
  'estate-figures': {
    id: 'estate-figures', title: 'Estate at a glance',
    description: 'The four live figures for this layer.',
    icon: Gauge, category: 'Overview', surface: 'both', defaultSize: { w: 1, h: 1 },
    component: EstateFiguresWidget,
  },
  'assessment-findings': {
    id: 'assessment-findings', title: 'What the assessment found',
    description: 'Recoverable spend, security events, invisible share.',
    icon: ClipboardCheck, category: 'Overview', surface: 'both', defaultSize: { w: 1, h: 1 },
    component: AssessmentFindingsWidget,
  },
  'money-on-the-table': {
    id: 'money-on-the-table', title: 'Money on the table',
    description: 'Savings still available, ranked, with a one-click review.',
    icon: PiggyBank, category: 'Cost', surface: 'naas', defaultSize: { w: 1, h: 1 },
    component: MoneyOnTheTableWidget,
  },
  'token-budgets': {
    id: 'token-budgets', title: 'Token budgets',
    description: 'Per-policy token budgets, with Enforce on any draft.',
    icon: Coins, category: 'Govern', surface: 'ai', defaultSize: { w: 1, h: 1 },
    component: TokenBudgetsWidget,
  },
};

/** Widgets valid on `surface`: those tagged for it plus the shared ('both').
 *  The `reg` arg defaults to the real registry; tests pass their own. */
export function widgetsForSurface(
  surface: Surface,
  reg: Record<string, WidgetDef> = WIDGET_REGISTRY,
): WidgetDef[] {
  return Object.values(reg).filter(w => w.surface === surface || w.surface === 'both');
}

/** The default board per surface, as an ordered list of widget ids. */
export const DEFAULT_LAYOUT: Record<Surface, string[]> = {
  naas: ['standing-intents', 'estate-figures', 'money-on-the-table', 'assessment-findings'],
  ai:   ['standing-intents', 'estate-figures', 'token-budgets', 'assessment-findings'],
};

// The active layer, provided by LayerDashboard so surface-aware widgets can read
// it without a data prop.
export const LayerContext = createContext<Surface>('naas');
export const useLayer = (): Surface => useContext(LayerContext);
