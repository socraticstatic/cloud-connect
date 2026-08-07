/** The one visualization palette (Flywheel hex, SVG-attribute form — fill/
 *  stroke cannot reach Tailwind's fw-* classes). Color carries exactly one
 *  meaning app-wide: cobalt = on the AT&T fabric, slate = public internet,
 *  green = resilient/success. Everything else is ink. */
export const VIZ_HEX = {
  cobalt: '#0057b8',
  cobaltSoft: '#7aa6d6',
  green: '#2d7e24',
  slate: '#94a3b8',
  slateInk: '#475569',
  ink: '#1d2329',
  inkSoft: '#475569',
  wash: '#f8fafb',
  line: '#dcdfe3',
  band: '#eef4fb',
  bandStroke: '#c7ddf5',
  skyCursor: '#009FDB',
} as const;
