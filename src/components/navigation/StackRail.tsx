import { Link, useLocation } from 'react-router-dom';
import { AttIcon } from '../icons/AttIcon';
import type { AttIconName } from '../icons/att-icons';
import { STACK_LAYERS, counterpartPath, type NavLayer } from './navItems';

/** The stack, drawn beside the work: one segment per live layer in elevation
 *  order, with the vision strata (Cloud, Transport & Access) as slim dashed
 *  markers in their true positions. Clicking the other live layer hops to the
 *  SAME verb over there — move vertically, keep your place in the lifecycle.
 *  Desktop only; below 1280px the drawer carries the layer grouping. */

const LAYER_GLYPH: Record<NavLayer['key'], AttIconName> = {
  ai: 'apis',
  naas: 'cloud',
};

/** Vision strata — roadmap markers, not controls. */
function VisionSlot({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      data-testid="vision-slot"
      className="w-full rounded-md border border-dashed border-fw-secondary px-1 py-1 text-center pointer-events-none select-none"
    >
      <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-fw-disabled leading-tight">
        {label}
      </span>
      <span className="block text-[8px] font-medium text-fw-disabled">next</span>
    </div>
  );
}

export function StackRail() {
  const location = useLocation();
  const match = location.pathname.match(/^\/(ai|naas)(\/|$)/);
  if (!match) return null;
  const currentKey = match[1] as NavLayer['key'];

  const segment = (layer: NavLayer) => {
    const isCurrent = layer.key === currentKey;
    const body = (
      <>
        <AttIcon
          name={LAYER_GLYPH[layer.key]}
          className={`h-5 w-5 ${isCurrent ? 'text-fw-link' : 'text-fw-bodyLight'}`}
        />
        <span
          className={`block text-[10px] font-semibold tracking-[-0.01em] leading-tight ${
            isCurrent ? 'text-fw-link' : 'text-fw-body'
          }`}
        >
          {layer.label}
        </span>
      </>
    );
    if (isCurrent) {
      return (
        <div
          key={layer.key}
          aria-current="true"
          title={`${layer.tagline} — you are here`}
          className="w-full rounded-lg border-2 border-fw-active bg-fw-accent px-1 py-2.5 flex flex-col items-center gap-1 text-center"
        >
          {body}
        </div>
      );
    }
    const to = counterpartPath(location.pathname, layer.key);
    const verb = layer.items.find(i => i.to === to)?.label ?? layer.items[0].label;
    return (
      <Link
        key={layer.key}
        to={to}
        title={`${verb}, on the ${layer.label} layer`}
        className="w-full rounded-lg border border-fw-secondary bg-fw-base px-1 py-2.5 flex flex-col items-center gap-1 text-center transition-colors hover:border-fw-active hover:bg-fw-wash"
      >
        {body}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Network stack"
      data-testid="stack-rail"
      className="hidden min-[1280px]:flex sticky top-20 self-start flex-col items-center gap-1.5 w-[72px] flex-shrink-0 ml-3 mt-6"
    >
      {/* Elevation order, top to bottom: AI Fabric · Cloud · NaaS · Transport. */}
      {segment(STACK_LAYERS[0])}
      <VisionSlot label="Cloud" />
      {segment(STACK_LAYERS[1])}
      <VisionSlot label="Transport & Access" />
    </nav>
  );
}
