import { useState } from 'react';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { ATTACH_TYPES, activeAttachTypeId } from './attachCatalog';

interface Onramp {
  type: string;
  active: boolean;
}

/**
 * The five Phase-1 attach types, rendered as selectable cards in the Connect
 * attach area. The card matching the active on-ramps' mechanism is pre-selected
 * and badged "Active"; picking another is a local, non-mutating intent (the
 * actual attach happens on an on-ramp below). Cobalt for the selected/active
 * accent, neutral slate for the rest — zero warm tones.
 */
export function AttachTypes() {
  const onramps = useCloudControl(cc => cc.onramps) as Onramp[];
  // `activeId` is recomputed live from the engine every render, so the "Active"
  // badge follows real on-ramp state. Selection is the user's local intent:
  // null until they pick a card, so before any pick it tracks `activeId` live
  // (never frozen at mount). Once they choose, their choice sticks.
  const activeId = activeAttachTypeId(onramps);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? activeId;
  const setSelected = setPicked;

  return (
    <section aria-label="Attach types" data-tour="connect-attach-types" className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-figma-sm font-semibold text-fw-heading">Attach type</h3>
        <span className="text-figma-xs text-fw-bodyLight">
          Five ways to bring a cloud onto the AT&amp;T fabric
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ATTACH_TYPES.map(t => {
          const isSelected = selected === t.id;
          const isActive = activeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(t.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                isSelected
                  ? 'border-[#0057b8] bg-[#0057b8]/[0.04] ring-1 ring-[#0057b8]'
                  : 'border-fw-secondary bg-fw-base hover:bg-fw-wash'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-medium text-figma-sm ${
                    isSelected ? 'text-[#0057b8]' : 'text-fw-heading'
                  }`}
                >
                  {t.label}
                </span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full bg-[#0057b8] shrink-0"
                  />
                )}
                {isActive && (
                  <span className="ml-auto inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-fw-successLight text-fw-success shrink-0">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-1 text-figma-xs text-fw-bodyLight">{t.desc}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
