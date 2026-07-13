export interface Kpi { key: string; label: string; value: string; unit?: string; sub?: string; }
export interface FlowTab { id: string; label: string; }
export interface SeriesPoint { t: string; v: number; }
export interface RecordRow { id: string; label: string; cells: string[]; tone?: 'ok' | 'warn' | 'bad' | 'muted'; }
export interface BriefingBlock { text: string; emphasis?: 'strong' | 'risk'; }
export interface Briefing { narrative: BriefingBlock[]; actions: { id: string; label: string }[]; followups: string[]; }
export interface ObservabilityBinding {
  layer: 'network' | 'ai';
  title: string;
  columns: string[];                 // records-table headers
  kpis(): Kpi[];
  flowTabs(): FlowTab[];
  flowSeries(tabId: string): SeriesPoint[];
  groupByOptions(): { id: string; label: string }[];
  records(groupBy: string): RecordRow[];
  briefing(): Briefing;
}
