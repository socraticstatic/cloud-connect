/**
 * Shared visual language for the Cloud Connect feature views.
 *
 * WHY THIS EXISTS: the six sections were built independently and drifted into
 * ad-hoc color use (loud greens/ambers, a rainbow latency chart with duplicate
 * hues because it colored by cloud). This module centralizes the discipline so
 * it can't drift again:
 *  - Cobalt is the primary accent; gray is structure.
 *  - Semantic colors (green/amber/red) are for SMALL status indicators only,
 *    never large fills or repeated colored body text.
 *  - Charts use one cohesive categorical palette, indexed per SERIES so no two
 *    lines share a hue.
 *
 * SVG/Recharts `stroke`/`fill` props don't resolve Tailwind `*-fw-*` classes
 * (the config extends only text/bg/border), so chart colors are literal hex.
 */

/** Flywheel core tokens as literal hex (for SVG/Recharts). */
export const FW = {
  cobalt: '#0057b8', // primary interactive / brand accent
  cobalt300: '#3374cc',
  cobaltWash: '#e6f0fa',
  ink: '#1d2329', // heading
  body: '#454b52',
  muted: '#686e74', // secondary text / neutral series
  line: '#dcdfe3', // borders
  grid: '#f3f4f6', // chart gridlines
  wash: '#f8fafb', // page/panel wash
  success: '#2d7e24', // AT&T green — status only
  successWash: '#e9f5e7',
  warn: '#475569', // slate-600 — neutral "attention" text (de-amber), status only
  warnWash: '#f8fafc', // slate-50 wash
  danger: '#b42318',
} as const;

/**
 * Cohesive categorical palette for multi-series charts. Distinct but harmonized
 * (cool-leaning, one warm accent), colorblind-considerate. Index per series so
 * lines never collide on a hue — do NOT color chart series by cloud/tenant.
 */
export const SERIES = [
  '#0057b8', // cobalt
  '#009e8e', // teal
  '#7b61ff', // violet
  '#c2426b', // rose (single warm accent — de-amber)
  '#2aa0d8', // sky
  '#3f8f3a', // green
  '#8a5bd6', // plum
  '#5b6b7b', // slate
  '#0e7490', // cyan-700
] as const;

/** Deterministic series color by index (wraps if there are more series). */
export function seriesColor(i: number): string {
  return SERIES[((i % SERIES.length) + SERIES.length) % SERIES.length];
}

/**
 * Two-tone pairing for the recurring "private/committed vs public" comparison —
 * cobalt for the AT&T-controlled series, muted gray for public. Keeps that
 * chart on-brand instead of green-vs-orange.
 */
export const COMPARE = {
  controlled: FW.cobalt,
  controlledWash: 'rgba(0,87,184,0.10)',
  public: FW.muted,
  publicWash: 'rgba(104,110,116,0.10)',
} as const;

/** Semantic status → subtle badge/dot classes (Tailwind, resolve fine on
 * text/bg/border). Use the DOT for inline row status; the BADGE for pills. */
export type StatusTone = 'ok' | 'warn' | 'neutral' | 'info';

export const STATUS_DOT: Record<StatusTone, string> = {
  ok: 'bg-[#2d7e24]',
  warn: 'bg-[#94a3b8]', // slate — neutral attention (de-amber)
  neutral: 'bg-[#bdc2c7]',
  info: 'bg-[#0057b8]',
};

export const STATUS_BADGE: Record<StatusTone, string> = {
  ok: 'bg-[#e9f5e7] text-[#2d7e24]',
  warn: 'bg-[#f8fafc] text-[#475569]', // slate — neutral attention (de-amber)
  neutral: 'bg-fw-wash text-fw-bodyLight',
  info: 'bg-[#e6f0fa] text-[#0057b8]',
};
