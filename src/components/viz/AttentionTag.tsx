import type { ReactNode } from 'react';
import { Globe, Clock } from 'lucide-react';

/**
 * Neutral "attention" pill — the de-amber replacement for every
 * public / uncommitted / exposed / pending state.
 *
 * Meaning is carried by a small leading icon (globe = internet-exposed,
 * clock = pending) and the copy, never by a warm color. Slate-600 text on a
 * slate-50 fill with a slate-300 border reads at AA+ contrast without hue.
 */
const ICONS = { globe: Globe, clock: Clock } as const;

export function AttentionTag({ icon, children }: { icon?: 'globe' | 'clock'; children: ReactNode }) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#cbd5e1] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[#475569]">
      {Icon && <Icon size={13} className="text-[#64748b]" aria-hidden="true" />}
      {children}
    </span>
  );
}
