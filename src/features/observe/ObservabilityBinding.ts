export interface Kpi { key: string; label: string; value: string; unit?: string; sub?: string; }
export interface FlowTab { id: string; label: string; }
export interface SeriesPoint { t: string; v: number; }
export interface RecordRow { id: string; label: string; cells: string[]; tone?: 'ok' | 'warn' | 'bad' | 'muted'; }
export interface BriefingBlock { text: string; emphasis?: 'strong' | 'risk'; }
export interface Briefing { narrative: BriefingBlock[]; actions: { id: string; label: string }[]; followups: string[]; }
/** An engine-known instant inside the telemetry window (fraction 0..1). */
export interface TimelineMoment { at: number; key: string; label: string; }
export interface ObservabilityBinding {
  layer: 'network' | 'ai';
  title: string;
  columns: string[];                 // records-table headers
  emptyHint?: string;                // shown in the flow panel when the series is all-zero (e.g. AI at day-zero)
  kpis(): Kpi[];
  flowTabs(): FlowTab[];
  flowSeries(tabId: string): SeriesPoint[];
  groupByOptions(): { id: string; label: string }[];
  records(groupBy: string): RecordRow[];
  briefing(): Briefing;
  /** Markers for the time-machine scrubber. Optional: a binding whose window
   *  carries no engine-known moments simply omits it — the scrubber still
   *  works, markerless. */
  moments?(): TimelineMoment[];
}
