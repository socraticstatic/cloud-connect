import { useState } from 'react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { AttIcon } from '../../components/icons/AttIcon';

interface Onramp {
  id: string;
  name: string;
  type: string;
  sub: string;
  ic: string;
  active: boolean;
  planned?: boolean;
  targets: [string, string][];
}

/** Marks NetBond/Direct Connect/ExpressRoute variants with the ethernet
 * glyph (dedicated circuit) and everything else with the cloud glyph. */
function markFor(onramp: Onramp): 'cloud' | 'ethernet' {
  return /netbond|direct connect|expressroute/i.test(onramp.type) ? 'ethernet' : 'cloud';
}

function targetSummary(targets: [string, string][]): string {
  const clouds = Array.from(new Set(targets.map(([c]) => c.toUpperCase())));
  return `Reaches ${targets.length} region${targets.length === 1 ? '' : 's'} across ${clouds.join(', ')}`;
}

export function OnrampPanel() {
  const onramps = useCloudControl(cc => cc.onramps) as Onramp[];
  const actions = useCloudControlActions();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {onramps.map(onramp => {
        const preview = expanded === onramp.id && !onramp.active ? actions.previewOnramp(onramp.id) : null;
        return (
          <div
            key={onramp.id}
            className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                  onramp.active ? 'bg-fw-successLight text-fw-success' : 'bg-fw-neutral text-fw-bodyLight'
                }`}
              >
                <AttIcon name={markFor(onramp)} className="w-4 h-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="font-medium text-fw-heading">{onramp.name}</div>
                <div className="text-figma-xs text-fw-bodyLight">{onramp.sub}</div>
                <div className="text-figma-xs text-fw-bodyLight">{targetSummary(onramp.targets)}</div>
              </div>

              {onramp.active ? (
                <span className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-successLight text-fw-success shrink-0">
                  Active · provisioned
                </span>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === onramp.id ? null : onramp.id)}
                    className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.activateOnramp(onramp.id)}
                    className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
                  >
                    Attach
                  </button>
                </div>
              )}
            </div>

            {preview && (
              <div className="px-5 py-3 border-t border-fw-secondary bg-fw-wash/60 text-figma-xs text-fw-bodyLight">
                Attaching would move posture to{' '}
                <span className="font-medium text-fw-heading">{preview.posture}</span>, leaving{' '}
                <span className="font-medium text-fw-heading">{preview.pub}</span> VPC
                {preview.pub === 1 ? '' : 's'} public and{' '}
                <span className="font-medium text-fw-heading">{preview.violations}</span> policy violation
                {preview.violations === 1 ? '' : 's'} open. Non-mutating preview — nothing changes until you attach.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
