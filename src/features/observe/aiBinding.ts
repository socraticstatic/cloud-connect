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
import { aiSpendTotals, fmtTokens, fmtUsd, routeLabel, tagModelMap } from '../ai-fabric/aiSpend';

// Shapes consumed from state-billing.ts / state-console.ts / state-telemetry.ts
// (all // @ts-nocheck at the source) — mirrored here for the fields this
// binding reads.
interface TokenMeter {
  tag: string;
  ready: boolean;
  today: number;
  governed: number;
  ungoverned: number;
  budget: number;
  pct: number;
}
interface ModelRoute {
  tag: string;
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

// modelRoutes() names the tag each route belongs to, so a route is paired with
// its meter by identity rather than by both lists happening to iterate the same
// keys in the same order.
// The tag -> model mapping and the token-money maths now live in
// ai-fabric/aiSpend.ts — imported rather than re-declared, so the Cost KPI
// here and the Cost screen at /ai/cost state the same figure by construction.
// `tagModelMap` derives that mapping from CC.agentList()'s `invoke:*` scopes
// rather than restating knowledge the engine already carries.

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
  /** Of `today`, the tokens that rode the public internet. Booked by the
   *  engine at meter time, so it is not re-derivable from `path`. */
  ungoverned: number;
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

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function percentile95(values: number[]): number {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length));
  return sorted[idx];
}

/**
 * Rounding that cannot turn a real quantity into a zero.
 *
 * The flow panel fires its empty state on `series.every(v === 0)`, so any
 * rounding here is load-bearing: a flat `Math.round(v * 10) / 10` renders a
 * Cost series of a few tenths of a cent as 0.0 at every point, and the panel
 * printed "No token flow yet" directly under a COST tile reading `<$0.01` and
 * a TOKENS tile reading hundreds. One decimal above 1, three significant
 * figures below it — small values stay small and stay non-zero.
 */
function chartValue(v: number): number {
  if (v === 0) return 0;
  return Math.abs(v) >= 1 ? Math.round(v * 10) / 10 : Number(v.toPrecision(3));
}

function seriesFromNumbers(values: number[]): SeriesPoint[] {
  return values.map((v, i) => ({ t: `T${i}`, v: chartValue(v) }));
}

function buildAiRows(cc: CloudControl): AiRow[] {
  const meters = cc.tokenMeterList() as TokenMeter[];
  const routes = cc.modelRoutes() as ModelRoute[];
  const tagModel = tagModelMap(cc);
  return meters.map(m => {
    const r = routes.find(x => x.tag === m.tag);
    return {
      tag: m.tag,
      app: r?.app ?? m.tag,
      ready: m.ready,
      today: m.today,
      ungoverned: m.ungoverned,
      budget: m.budget,
      pct: m.pct,
      model: r?.model ?? 'unknown model',
      modelId: tagModel[m.tag],
      endpoint: r?.endpoint ?? '',
      cloud: r?.cloud ?? null,
      path: r?.path ?? 'public',
      guardrail: r?.guardrail ?? null,
    };
  });
}

/* `routeLabel` is imported from `ai-fabric/aiSpend`, not restated here: the
   /ai/cost table renders the same engine value in its State column, and two
   copies of this switch is how the two tables would come to describe one
   identity's path in two different phrases. */

function providerOf(row: AiRow): string {
  if (row.cloud === 'cw') return 'CoreWeave';
  if (row.cloud === 'neb') return 'Nebius';
  return 'OpenAI (external)';
}

/* The path comes FIRST. `ready` is the engine's meter gate, not a path, and
   leading with it printed "Provisioning" in the Status column of a row whose
   own Route column, one cell to the left, read "Public internet" and whose
   Tokens column read 165. Provisioning is a benign word for an identity that
   is actively spending over the open internet. */
function statusOf(row: AiRow): { label: string; tone: RecordRow['tone'] } {
  if (row.path === 'public') return { label: 'Public · unguarded', tone: 'bad' };
  if (!row.ready) return { label: 'Provisioning', tone: 'warn' };
  if (row.guardrail) return { label: capitalize(row.guardrail), tone: 'warn' };
  return { label: 'Private · allowed', tone: 'ok' };
}

/* Today's tokens, and how many of them were ungoverned — stated in the same
   cell as the total they qualify, because a "Private · allowed" status beside
   a bare token count says nothing about the tokens that rode the internet
   before the endpoint attached. */
function tokenCell(today: number, ungoverned: number): string {
  return ungoverned > 0
    ? `${fmtTokens(today)} · ${fmtTokens(ungoverned)} ungoverned`
    : fmtTokens(today);
}

function cellsFor(row: AiRow): string[] {
  const status = statusOf(row);
  return [
    row.app,
    tokenCell(row.today, row.ungoverned),
    row.model,
    routeLabel(row.path),
    status.label,
  ];
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
  const tagModel = tagModelMap(cc);
  const priceOfTag = (tag: string) => catalog.find(m => m.id === tagModel[tag])?.price ?? 0;

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
      const modelIds = Array.from(new Set(Object.values(tagModel)));
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
      const ungoverned = list.reduce((s, r) => s + r.ungoverned, 0);
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
          tokenCell(tokens, ungoverned),
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

  // Tokens, cost and savings come from the one shared derivation the /ai/cost
  // screen also reads — same meters, same catalog prices, same sum.
  const spend = aiSpendTotals(cc);
  const totalTokens = spend.tokensToday;
  const costActual = spend.spendToday;
  const savings = spend.savings;

  // TTFT: no selector exposes an aggregate "time to first token" metric.
  // Derive it the same way Task 2 derived P95 latency — from an already
  // deterministic, seeded per-model series (modelLatencySeries), taking the
  // P95 across all ready models' full series. No Date.now/Math.random.
  const readyModelIds = Array.from(new Set(rows.filter(r => r.ready).map(r => r.modelId).filter(Boolean)));
  const ttftPoints = readyModelIds.flatMap(id => cc.modelLatencySeries(id, SERIES_POINTS) as number[]);
  const ttft = percentile95(ttftPoints.length ? ttftPoints : catalog.map(m => m.p50));

  /* The bucket gets a tile of its own. It is the one number on this screen a
     reader cannot reconstruct from the others — Tokens is the total, Cost is
     the money, and the Route column is about the next request, not the ones
     already metered. Stated, it is an observability figure; inferred, it was
     the source of four contradictory sentences. */
  return [
    { key: 'tokens', label: 'Tokens', value: fmtTokens(totalTokens), sub: '/today' },
    {
      key: 'ungoverned',
      label: 'Ungoverned',
      value: fmtTokens(spend.ungovernedTokensToday),
      sub: 'public internet',
    },
    { key: 'requests', label: 'Requests', value: String(decisions.length) },
    { key: 'cost', label: 'Cost', value: fmtUsd(costActual), sub: '/today' },
    { key: 'ttft', label: 'TTFT', value: String(Math.round(ttft)), unit: 'ms' },
    { key: 'savings', label: 'Savings', value: fmtUsd(savings), sub: '/today' },
  ];
}

function buildBriefing(cc: CloudControl): Briefing {
  const rows = buildAiRows(cc);
  const meteredTokens = rows.reduce((s, r) => s + r.today, 0);
  const totalTokens = meteredTokens || 1; // divisor guard only
  const top = rows.slice().sort((a, b) => b.today - a.today)[0];
  const publicRows = rows.filter(r => r.path === 'public');

  /* Exposure is a MEASURED bucket, not an inference from the current route.
   *
   * This used to sum `today` over the rows whose route is public right now,
   * which reclassifies history every time an endpoint attaches: after the
   * tour's Connect beat every route is governed, the sum went to zero, and the
   * briefing printed "No AI Fabric traffic currently crosses the public
   * internet" over a total most of which had already crossed it. The engine
   * now books each token into `governed` or `ungoverned` at meter time, which
   * is the only moment the fact is knowable. */
  const ungovernedRows = rows.filter(r => r.ungoverned > 0);
  const ungovernedTokens = ungovernedRows.reduce((s, r) => s + r.ungoverned, 0);
  const rawPct = Math.round((ungovernedTokens / totalTokens) * 100);
  /* A non-zero quantity must never be introduced by a share that rounds to
     zero — "0% … crossed the public internet" beside a non-zero figure is the
     same contradiction in smaller type. */
  const pctPublic = ungovernedTokens > 0 && rawPct === 0 ? '<1%' : `${rawPct}%`;

  /* Three states, not two.
   *
   * On a seeded estate nothing has metered yet, and a share-of-traffic reading
   * of that is 0% public, which used to print "No AI Fabric traffic currently
   * crosses the public internet — every identity rides a private or governed
   * path" directly beside a Records table listing all three identities on
   * Public internet.
   *
   * Zero traffic is its own state and says so: nothing is metered YET, and the
   * routes those identities will use the moment they start are public. */
  const nothingMetered = meteredTokens === 0;
  const publicCount = publicRows.length;

  /* Name what actually rode the internet.
   *
   * The old sentence named the gpt-class row and nothing else, attributing
   * 100% of the tokens to a row carrying about a third of them — beside a
   * Records table showing the split. Attribution is now sorted by the very
   * quantity being claimed, `ungoverned`, over the rows that carry any of it. */
  const topUngoverned = ungovernedRows.slice().sort((a, b) => b.ungoverned - a.ungoverned)[0];
  const attribution = !topUngoverned
    ? ''
    : ungovernedRows.length === 1
      ? ` via ${topUngoverned.app} on ${topUngoverned.model}`
      : ` across ${ungovernedRows.length} identities, led by ${topUngoverned.app} on ${topUngoverned.model} at ${fmtTokens(topUngoverned.ungoverned)}`;

  /* Where the NEXT request goes is a separate clause, in a separate tense,
     because the two genuinely differ after an attach: nothing routes public
     any more, and a third of today's tokens still went that way. */
  const forward =
    publicCount > 0
      ? ` ${publicCount} of ${rows.length} identities are still routed over the public internet, so that continues until they are attached.`
      : ` Every identity now routes to an attached endpoint, so nothing further leaves that way.`;

  const exposure = nothingMetered
    ? publicCount > 0
      ? `No tokens are metered yet, so nothing has crossed a path today — but ${publicCount} of ${rows.length} identities are still routed over the public internet, which is the path they take the moment they start.`
      : 'No tokens are metered yet. Every identity is already on a private or governed route, so the first request will not cross the public internet.'
    : ungovernedTokens > 0
      /* "exposed to external providers" was true only of the gpt-class row.
         `helion-70b` is self-hosted on CoreWeave — its ungoverned tokens rode
         an unscreened path to the operator's own GPUs, which is a different
         exposure and not an external provider. The clause now says what is
         true of every row it can name. */
      ? `${pctPublic} of today's AI Fabric tokens (${fmtTokens(ungovernedTokens)}) were metered over the public internet${attribution}, unguardrailed and outside the fabric's control.${forward}`
      : 'Every token metered today rode a private or governed path — none of it crossed the public internet.';

  /* With every meter at zero, sorting by consumption picks an arbitrary row —
     so a "largest" claim in that state has to be sorted by the thing it
     actually names. */
  const topByBudget = rows.slice().sort((a, b) => b.budget - a.budget)[0];

  const narrative: BriefingBlock[] = [
    {
      text: nothingMetered
        ? `No identity is metering yet. ${topByBudget.app} carries the largest ceiling at ${fmtTokens(topByBudget.budget)} tokens, routed to ${topByBudget.model} over ${routeLabel(topByBudget.path)}.`
        : `${top.app} is the top token consumer at ${fmtTokens(top.today)} tokens today (${top.pct}% of its ${fmtTokens(top.budget)} budget), routed to ${top.model} over ${routeLabel(top.path)}.`,
      emphasis: 'strong',
    },
    { text: exposure, emphasis: 'risk' },
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

/**
 * What the flow panel says when its series is flat zero.
 *
 * This is a constant again, and that is the point. It used to need a second
 * branch — "today's 1.4k tokens are live agent requests, and the fabric charts
 * them as a trend once a GPU substrate is attached" — because `tokenSeries()`
 * charted zero for any identity the engine did not consider meter-ready while
 * the TOKENS tile 40px above counted its live spend. A sentence explaining why
 * the chart disagrees with the tile beside it is a workaround, not a fix.
 *
 * `tokenSeries()` now tails on the live meter whatever the readiness gate says
 * (`state-telemetry.ts`), and `chartValue()` above stops a sub-dollar Cost
 * series rounding every point to zero, so the panel is empty in exactly one
 * state: nothing has been metered. In that state this sentence is just true.
 */
const EMPTY_HINT = 'No token flow yet — attach a GPU substrate in Connect to light up the fabric.';

export function aiBinding(cc: CloudControl): ObservabilityBinding {
  return {
    layer: 'ai',
    title: 'AI Fabric Observability',
    columns: ['Identity', 'Tokens', 'Model', 'Route', 'Status'],
    emptyHint: EMPTY_HINT,
    kpis: () => buildKpis(cc),
    flowTabs: () => FLOW_TABS,
    flowSeries: (tabId: string) => buildFlowSeries(cc, tabId),
    groupByOptions: () => GROUP_BY_OPTIONS,
    records: (groupBy: string) => buildRecords(cc, groupBy),
    briefing: () => buildBriefing(cc),
  };
}
