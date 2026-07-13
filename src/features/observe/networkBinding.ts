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

// Shape of a routeFlows() row (src/engine/state-routing.ts) — untyped at the
// source (// @ts-nocheck), so we mirror the fields this binding consumes.
interface RoutePath {
  id: string;
  label: string;
  sub?: string;
  attControlled: boolean;
}
interface RouteFlowRow {
  id: string;
  kind?: 'app' | 'c2c';
  label: string;
  gbps: number;
  viaPublic: boolean;
  srcCloud?: string;
  srcRid?: string;
  paths: RoutePath[];
  current: { id: string; label: string; sub?: string; attControlled: boolean; latencyMs: number };
  diverse?: boolean;
}

interface RegionTelemetry {
  key: string;
  name: string;
  attached: boolean;
  throughput: number[];
  latency: number[];
}
interface Telemetry {
  regions: RegionTelemetry[];
  egress: { pub: number; priv: number }[];
}

const SERIES_POINTS = 24;

const FLOW_TABS: FlowTab[] = [
  { id: 'flow', label: 'Flow' },
  { id: 'trend', label: 'Trend' },
  { id: 'throughput', label: 'Throughput' },
  { id: 'latency', label: 'Latency' },
  { id: 'egress', label: 'Egress' },
  { id: 'control', label: 'Control' },
];

const GROUP_BY_OPTIONS: { id: string; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'path', label: 'Path' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'region', label: 'Region' },
  { id: 'control', label: 'Control' },
];

function fmtDollars(n: number): string {
  return `$${(n / 1000).toFixed(1)}k`;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
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

function buildFlowSeries(cc: CloudControl, tab: string): SeriesPoint[] {
  const tel = cc.telemetry(SERIES_POINTS) as Telemetry;
  const regions = tel.regions ?? [];
  const egress = tel.egress ?? [];

  switch (tab) {
    case 'latency': {
      const avgs = Array.from({ length: SERIES_POINTS }, (_, i) => {
        const vals = regions.map(r => r.latency[i]).filter((v): v is number => typeof v === 'number');
        return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      });
      return seriesFromNumbers(avgs);
    }
    case 'egress': {
      return seriesFromNumbers(egress.map(e => e.pub + e.priv));
    }
    case 'control': {
      return seriesFromNumbers(egress.map(e => (e.pub + e.priv ? (e.priv / (e.pub + e.priv)) * 100 : 0)));
    }
    case 'flow':
    case 'trend':
    case 'throughput':
    default: {
      const sums = Array.from({ length: SERIES_POINTS }, (_, i) =>
        regions.reduce((s, r) => s + (r.throughput[i] ?? 0), 0)
      );
      return seriesFromNumbers(sums);
    }
  }
}

function toneFor(row: RouteFlowRow): RecordRow['tone'] {
  if (row.current.attControlled) return row.diverse ? 'ok' : 'warn';
  return 'bad';
}

function pathLabel(row: RouteFlowRow): string {
  return row.current.attControlled ? row.current.sub ?? 'AT&T mid-mile' : 'Public internet';
}

function controlLabel(row: RouteFlowRow): string {
  return row.current.attControlled ? 'Controlled' : 'Uncontrolled';
}

function cellsFor(row: RouteFlowRow): string[] {
  return [row.label, row.gbps.toFixed(1), `${Math.round(row.current.latencyMs)}ms`, pathLabel(row), controlLabel(row)];
}

function groupKey(row: RouteFlowRow, groupBy: string): string {
  switch (groupBy) {
    case 'path':
      return row.current.attControlled ? 'Private (AT&T)' : 'Public internet';
    case 'cloud':
      return row.srcCloud ?? (row.kind === 'c2c' ? 'Cloud-to-cloud' : 'Unknown cloud');
    case 'region':
      return row.srcRid ?? (row.kind === 'c2c' ? 'Backbone' : 'Unknown region');
    case 'control':
      return controlLabel(row);
    default:
      return 'All flows';
  }
}

function buildRecords(cc: CloudControl, groupBy: string): RecordRow[] {
  const rows = cc.routeFlows() as RouteFlowRow[];

  if (groupBy === 'none') {
    return rows.map(r => ({ id: r.id, label: r.label, cells: cellsFor(r), tone: toneFor(r) }));
  }

  const groups = new Map<string, RouteFlowRow[]>();
  rows.forEach(r => {
    const key = groupKey(r, groupBy);
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  });

  return Array.from(groups.entries())
    .map(([key, list]) => {
      const gbps = list.reduce((s, r) => s + r.gbps, 0);
      const latSorted = list.map(r => r.current.latencyMs).sort((a, b) => a - b);
      const latMed = latSorted[Math.floor(latSorted.length / 2)] ?? 0;
      const allControlled = list.every(r => r.current.attControlled);
      const anyControlled = list.some(r => r.current.attControlled);
      const label = `${key} (${list.length})`;
      return {
        id: 'grp-' + key,
        label,
        cells: [
          label,
          gbps.toFixed(1),
          `${Math.round(latMed)}ms`,
          allControlled ? 'Private (AT&T)' : anyControlled ? 'Mixed' : 'Public internet',
          allControlled ? 'Controlled' : anyControlled ? 'Mixed' : 'Uncontrolled',
        ],
        tone: (allControlled ? 'ok' : anyControlled ? 'warn' : 'bad') as RecordRow['tone'],
        _gbps: gbps,
      };
    })
    .sort((a, b) => b._gbps - a._gbps)
    .map(({ _gbps, ...row }) => row);
}

function buildKpis(cc: CloudControl): Kpi[] {
  const rk = cc.routingKpis();
  const eg = cc.egress();
  const rows = cc.routeFlows() as RouteFlowRow[];
  const p95 = percentile95(rows.map(r => r.current.latencyMs));

  return [
    { key: 'throughput', label: 'Throughput', value: rk.totalGbps.toFixed(1), unit: 'Gbps' },
    { key: 'p95-latency', label: 'P95 Latency', value: String(Math.round(p95)), unit: 'ms' },
    { key: 'egress', label: 'Egress', value: fmtDollars(eg.total), sub: '/mo' },
    { key: 'under-control', label: 'Under Control', value: String(rk.pctUnderControl), unit: '%' },
    { key: 'savings', label: 'Savings', value: fmtDollars(eg.savings), sub: '/mo' },
  ];
}

function buildBriefing(cc: CloudControl): Briefing {
  const rk = cc.routingKpis();
  const rows = cc.routeFlows() as RouteFlowRow[];
  const total = rows.reduce((s, r) => s + r.gbps, 0) || 1;
  const publicGbps = rows.filter(r => !r.current.attControlled).reduce((s, r) => s + r.gbps, 0);
  const pctPublic = Math.round((publicGbps / total) * 100);
  const summary = stripTags(String(cc.obsSummary()));

  const narrative: BriefingBlock[] = [
    {
      text: `${rk.pctUnderControl}% of network traffic (${rk.controlledGbps} of ${rk.totalGbps} Gbps) rides the AT&T-controlled path.`,
      emphasis: 'strong',
    },
    {
      text: `${pctPublic}% of flows (${publicGbps.toFixed(1)} Gbps) still cross the public internet, exposed to congestion and higher egress rates.`,
      emphasis: 'risk',
    },
    { text: summary },
  ];

  return {
    narrative,
    actions: [
      { id: 'show-public', label: 'Show public flows' },
      { id: 'steer-worst', label: 'Steer worst offender' },
      { id: 'review-diversity', label: 'Review path diversity' },
    ],
    followups: [
      'Which flow would save the most by steering to AT&T mid-mile?',
      'What is driving the public egress spend?',
      'Are any controlled flows single-homed (no failover)?',
    ],
  };
}

export function networkBinding(cc: CloudControl): ObservabilityBinding {
  return {
    layer: 'network',
    title: 'Network Observability',
    columns: ['Flow', 'Gbps', 'Latency', 'Path', 'Control'],
    kpis: () => buildKpis(cc),
    flowTabs: () => FLOW_TABS,
    flowSeries: (tabId: string) => buildFlowSeries(cc, tabId),
    groupByOptions: () => GROUP_BY_OPTIONS,
    records: (groupBy: string) => buildRecords(cc, groupBy),
    briefing: () => buildBriefing(cc),
  };
}
