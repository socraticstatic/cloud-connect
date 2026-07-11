type BgpState = 'established' | 'degraded' | 'down' | 'unknown';

export interface BgpTimelineEntry {
  connectionName: string;
  /** 60 buckets, index 0 = 60 min ago, index 59 = now */
  buckets: BgpState[];
  currentState: BgpState;
}

interface BgpStatusTimelineProps {
  entries: BgpTimelineEntry[];
}

const STATE_COLOR: Record<BgpState, string> = {
  established: 'bg-fw-success',
  degraded:    'bg-amber-400',
  down:        'bg-fw-error',
  unknown:     'bg-fw-neutral',
};

const STATE_LABEL: Record<BgpState, string> = {
  established: 'Established',
  degraded:    'Degraded',
  down:        'Down',
  unknown:     'Unknown',
};

const STATE_BADGE: Record<BgpState, string> = {
  established: 'bg-fw-successLight text-fw-success',
  degraded:    'bg-amber-50 text-amber-700',
  down:        'bg-fw-errorLight text-fw-error',
  unknown:     'bg-fw-neutral text-fw-bodyLight',
};

export function BgpStatusTimeline({ entries }: BgpStatusTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <div className="bg-fw-base rounded-xl border border-fw-secondary p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-figma-sm font-semibold text-fw-heading">BGP Session State</span>
        <span className="text-[10px] text-fw-bodyLight">← 60 min ago · now →</span>
      </div>

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.connectionName} className="flex items-center gap-3">
            {/* Connection name */}
            <span
              className="text-[11px] text-fw-bodyLight w-36 shrink-0 truncate"
              title={entry.connectionName}
            >
              {entry.connectionName}
            </span>

            {/* Timeline bar — 60 buckets */}
            <div className="flex-1 flex gap-px h-4 rounded overflow-hidden">
              {entry.buckets.map((state, i) => (
                <div
                  key={i}
                  className={`flex-1 ${STATE_COLOR[state]}`}
                  title={`${60 - i} min ago: ${STATE_LABEL[state]}`}
                />
              ))}
            </div>

            {/* Current state badge */}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded w-24 text-center shrink-0 ${STATE_BADGE[entry.currentState]}`}
            >
              {STATE_LABEL[entry.currentState]}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-fw-secondary">
        {(['established', 'degraded', 'down'] as BgpState[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${STATE_COLOR[s]}`} />
            <span className="text-[10px] text-fw-bodyLight">{STATE_LABEL[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generate mock BGP timeline entries from a list of connection names.
 * In a real integration this would be replaced with actual BGP state history.
 */
export function generateBgpEntries(connectionNames: string[]): BgpTimelineEntry[] {
  return connectionNames.map((name, idx) => {
    // Simulate: mostly established, with a short degraded blip 10–15 min ago
    const buckets: BgpState[] = Array.from({ length: 60 }, (_, i): BgpState => {
      // Offset each connection slightly so they don't all look identical
      const blipStart = 45 + idx * 3;
      const blipEnd   = blipStart + 4;
      if (i >= blipStart && i < blipEnd) return 'degraded';
      return 'established';
    });

    return {
      connectionName: name,
      buckets,
      currentState: 'established',
    };
  });
}
