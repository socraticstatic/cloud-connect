import type { CloudControl } from '../../engine/types';
import type {
  ObservabilityBinding,
  Kpi,
  FlowTab,
  SeriesPoint,
  RecordRow,
  Briefing,
  BriefingBlock,
} from './ObservabilityBinding';

// Shapes consumed from state-billing.ts / state-console.ts / state-telemetry.ts
// (all // @ts-nocheck at the source) — mirrored here for the fields this
// binding reads.
interface TokenMeter {
  tag: string;
  ready: boolean;
  today: number;
  budget: number;
  pct: number;
}
interface ModelRoute {
  app: string;
  model: string;
  endpoint: string;
  cloud: string | null;
  path: 'private' | 'governed egress' | 'public';
  guardrail: string | null;
}
interface ModelCatalogEntry {
  id: string;
  name: string;
  kind: string;
  endpoint: string;
  cloud: string | null;
  p50: number;
  price: number;
  ready: boolean;
}
interface Decision {
  ts: number;
  allowed: boolean;
  guarded: boolean;
}

// tokenMeterList() and modelRoutes() are both built by iterating the same
// TOKEN_BUDGETS-keyed object in the same order (rd-helion, classified-helion,
// shared-services), so index i of one corresponds to index i of the other.
const TAG_MODEL: Record<string, string> = {
  'rd-helion': 'helion-70b',
  'classified-helion': 'helion-cls-13b',
  'shared-services': 'gpt-class',
};

// decisionLog() records governance outcomes over time but carries no tag/app
// field, so a per-identity request-rate can't be read off it directly. This
// average is a deterministic approximation (prompt length -> token count in
// promptTrace() typically lands in the low hundreds to ~1k) used only to
// shape the Requests flow tab, not the Requests KPI (which reads the real
// decisionLog().length).
const AVG_TOKENS_PER_REQUEST = 800;

interface AiRow {
  tag: string;
  app: string;
  ready: boolean;
  today: number;
  budget: number;
  pct: number;
  model: string;
  modelId: string;
  endpoint: string;
  cloud: string | null;
  path: 'private' | 'governed egress' | 'public';
  guardrail: string | null;
}

const SERIES_POINTS = 24;

const FLOW_TABS: FlowTab[] = [
  { id: 'flow', label: 'Flow' },
  { id: 'trend', label: 'Trend' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'requests', label: 'Requests' },
  { id: 'cost', label: 'Cost' },
  { id: 'ttft', label: 'TTFT' },
];

const GROUP_BY_OPTIONS: { id: string; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'provider', label: 'Provider' },
  { id: 'model', label: 'Model' },
  { id: 'identity', label: 'Identity' },
  { id: 'route', label: 'Route' },
  { id: 'status', label: 'Status' },
];

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

function fmtUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function percentile95(values: number[]): number {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length));
  return sorted[idx];
}

function seriesFromNumbers(values: number[]): SeriesPoint[] {
  return values.map((v, i) => ({ t: `T${i}`, v: Math.round(v * 10) / 10 }));
}

function buildAiRows(cc: CloudControl): AiRow[] {
  const meters = cc.tokenMeterList() as TokenMeter[];
  const routes = cc.modelRoutes() as ModelRoute[];
  return meters.map((m, i) => {
    const r = routes[i];
    return {
      tag: m.tag,
      app: r?.app ?? m.tag,
      ready: m.ready,
      today: m.today,
      budget: m.budget,
      pct: m.pct,
      model: r?.model ?? 'unknown model',
      modelId: TAG_MODEL[m.tag] ?? '',
      endpoint: r?.endpoint ?? '',
      cloud: r?.cloud ?? null,
      path: r?.path ?? 'public',
      guardrail: r?.guardrail ?? null,
    };
  });
}

function routeLabel(path: AiRow['path']): string {
  switch (path) {
    case 'private':
      return 'AT&T private fabric';
    case 'governed egress':
      return 'Governed egress';
    default:
      return 'Public internet';
  }
}

function providerOf(row: AiRow): string {
  if (row.cloud === 'cw') return 'CoreWeave';
  if (row.cloud === 'neb') return 'Nebius';
  return 'OpenAI (external)';
}

function statusOf(row: AiRow): { label: string; tone: RecordRow['tone'] } {
  if (!row.ready) return { label: 'Provisioning', tone: 'warn' };
  if (row.path === 'public') return { label: 'Public · unguarded', tone: 'bad' };
  if (row.guardrail) return { label: capitalize(row.guardrail), tone: 'warn' };
  return { label: 'Private · allowed', tone: 'ok' };
}

function cellsFor(row: AiRow): string[] {
  const status = statusOf(row);
  return [row.app, fmtTokens(row.today), row.model, routeLabel(row.path), status.label];
}

function groupKey(row: AiRow, groupBy: string): string {
  switch (groupBy) {
    case 'provider':
      return providerOf(row);
    case 'model':
      return row.model;
    case 'identity':
      return row.app;
    case 'route':
      return routeLabel(row.path);
    case 'status':
      return statusOf(row).label;
    default:
      return 'All identities';
  }
}

function buildFlowSeries(cc: CloudControl, tab: string): SeriesPoint[] {
  const meters = cc.tokenMeterList() as TokenMeter[];
  const tags = meters.map(m => m.tag);
  const seriesByTag = tags.map(tag => cc.tokenSeries(tag, SERIES_POINTS) as number[]);
  const sumAt = (i: number) => seriesByTag.reduce((s, arr) => s + (arr[i] ?? 0), 0);
  const catalog = cc.modelCatalog() as ModelCatalogEntry[];
  const priceOfTag = (tag: string) => catalog.find(m => m.id === TAG_MODEL[tag])?.price ?? 0;

  switch (tab) {
    case 'requests': {
      const pts = Array.from({ length: SERIES_POINTS }, (_, i) => sumAt(i) / AVG_TOKENS_PER_REQUEST);
      return seriesFromNumbers(pts);
    }
    case 'cost': {
      const pts = Array.from({ length: SERIES_POINTS }, (_, i) =>
        tags.reduce((s, tag, idx) => s + ((seriesByTag[idx][i] ?? 0) / 1_000_000) * priceOfTag(tag), 0)
      );
      return seriesFromNumbers(pts);
    }
    case 'ttft': {
      const modelIds = Array.from(new Set(Object.values(TAG_MODEL)));
      const latSeries = modelIds.map(id => cc.modelLatencySeries(id, SERIES_POINTS) as number[]);
      const pts = Array.from({ length: SERIES_POINTS }, (_, i) => {
        const vals = latSeries.map(arr => arr[i]).filter((v): v is number => typeof v === 'number');
        return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      });
      return seriesFromNumbers(pts);
    }
    case 'flow':
    case 'trend':
    case 'tokens':
    default: {
      const pts = Array.from({ length: SERIES_POINTS }, (_, i) => sumAt(i));
      return seriesFromNumbers(pts);
    }
  }
}

function buildRecords(cc: CloudControl, groupBy: string): RecordRow[] {
  const rows = buildAiRows(cc);

  if (groupBy === 'none') {
    return rows.map(r => ({ id: r.tag, label: r.app, cells: cellsFor(r), tone: statusOf(r).tone }));
  }

  const groups = new Map<string, AiRow[]>();
  rows.forEach(r => {
    const key = groupKey(r, groupBy);
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  });

  return Array.from(groups.entries())
    .map(([key, list]) => {
      const tokens = list.reduce((s, r) => s + r.today, 0);
      const models = Array.from(new Set(list.map(r => r.model)));
      const routes = Array.from(new Set(list.map(r => routeLabel(r.path))));
      const statuses = Array.from(new Set(list.map(r => statusOf(r).label)));
      const label = `${key} (${list.length})`;
      const anyBad = list.some(r => statusOf(r).tone === 'bad');
      const allOk = list.every(r => statusOf(r).tone === 'ok');
      return {
        id: 'grp-' + key,
        label,
        cells: [
          label,
          fmtTokens(tokens),
          models.length === 1 ? models[0] : 'Mixed',
          routes.length === 1 ? routes[0] : 'Mixed',
          statuses.length === 1 ? statuses[0] : 'Mixed',
        ],
        tone: (anyBad ? 'bad' : allOk ? 'ok' : 'warn') as RecordRow['tone'],
        _tokens: tokens,
      };
    })
    .sort((a, b) => b._tokens - a._tokens)
    .map(({ _tokens, ...row }) => row);
}

function buildKpis(cc: CloudControl): Kpi[] {
  const rows = buildAiRows(cc);
  const catalog = cc.modelCatalog() as ModelCatalogEntry[];
  const decisions = cc.decisionLog() as Decision[];

  const totalTokens = rows.reduce((s, r) => s + r.today, 0);

  const priceOf = (modelId: string) => catalog.find(m => m.id === modelId)?.price ?? 0;
  const gptPrice = priceOf('gpt-class');
  let costActual = 0;
  let costIfGpt = 0;
  rows.forEach(r => {
    costActual += (r.today / 1_000_000) * priceOf(r.modelId);
    costIfGpt += (r.today / 1_000_000) * gptPrice;
  });
  const savings = Math.max(0, costIfGpt - costActual);

  // TTFT: no selector exposes an aggregate "time to first token" metric.
  // Derive it the same way Task 2 derived P95 latency — from an already
  // deterministic, seeded per-model series (modelLatencySeries), taking the
  // P95 across all ready models' full series. No Date.now/Math.random.
  const readyModelIds = Array.from(new Set(rows.filter(r => r.ready).map(r => r.modelId).filter(Boolean)));
  const ttftPoints = readyModelIds.flatMap(id => cc.modelLatencySeries(id, SERIES_POINTS) as number[]);
  const ttft = percentile95(ttftPoints.length ? ttftPoints : catalog.map(m => m.p50));

  return [
    { key: 'tokens', label: 'Tokens', value: fmtTokens(totalTokens), sub: '/today' },
    { key: 'requests', label: 'Requests', value: String(decisions.length) },
    { key: 'cost', label: 'Cost', value: fmtUsd(costActual), sub: '/today' },
    { key: 'ttft', label: 'TTFT', value: String(Math.round(ttft)), unit: 'ms' },
    { key: 'savings', label: 'Savings', value: fmtUsd(savings), sub: '/today' },
  ];
}

function buildBriefing(cc: CloudControl): Briefing {
  const rows = buildAiRows(cc);
  const totalTokens = rows.reduce((s, r) => s + r.today, 0) || 1;
  const top = rows.slice().sort((a, b) => b.today - a.today)[0];
  const publicTokens = rows.filter(r => r.path === 'public').reduce((s, r) => s + r.today, 0);
  const pctPublic = Math.round((publicTokens / totalTokens) * 100);
  const externalRow = rows.find(r => r.modelId === 'gpt-class');

  const narrative: BriefingBlock[] = [
    {
      text: `${top.app} is the top token consumer at ${fmtTokens(top.today)} tokens today (${top.pct}% of its ${fmtTokens(top.budget)} budget), routed to ${top.model} over ${routeLabel(top.path)}.`,
      emphasis: 'strong',
    },
    {
      text:
        pctPublic > 0
          ? `${pctPublic}% of AI Fabric tokens (${fmtTokens(publicTokens)}) still cross the public internet${externalRow ? ` via ${externalRow.app} on ${externalRow.model}` : ''}, unguardrailed and exposed to external providers.`
          : 'No AI Fabric traffic currently crosses the public internet — every identity rides a private or governed path.',
      emphasis: 'risk',
    },
  ];

  return {
    narrative,
    actions: [
      { id: 'show-internet', label: 'Show internet traffic' },
      { id: 'show-top-identity', label: 'Show top identity' },
      { id: 'review-guardrails', label: 'Review guardrail coverage' },
    ],
    followups: [
      'Which identity is closest to its token budget?',
      'What would it cost to move Shared Platform Services off the public internet?',
      'Are any agents issuing requests without an enforced token policy?',
    ],
  };
}

export function aiBinding(cc: CloudControl): ObservabilityBinding {
  return {
    layer: 'ai',
    title: 'AI Fabric Observability',
    columns: ['Identity', 'Tokens', 'Model', 'Route', 'Status'],
    kpis: () => buildKpis(cc),
    flowTabs: () => FLOW_TABS,
    flowSeries: (tabId: string) => buildFlowSeries(cc, tabId),
    groupByOptions: () => GROUP_BY_OPTIONS,
    records: (groupBy: string) => buildRecords(cc, groupBy),
    briefing: () => buildBriefing(cc),
  };
}
