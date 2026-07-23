import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { STACK_LAYERS, type NavLayer } from '../../components/navigation/navItems';

/**
 * The stack, as Discover's front door: everything AT&T runs, drawn in
 * elevation order. Live layers open their four verbs; vision strata are
 * labeled as such — Cloud deep-links to where cloud attach lives today
 * (NaaS · Connect), Transport & Access names its media and links nowhere,
 * because there is nothing real to open yet.
 */

function LiveBand({ layer }: { layer: NavLayer }) {
  return (
    <div
      data-testid={`stack-band-${layer.key}`}
      className="rounded-xl border border-fw-secondary bg-fw-base px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="min-w-0">
        <p className="text-figma-base font-bold text-fw-heading tracking-[-0.02em]">{layer.label}</p>
        <p className="text-figma-sm text-fw-bodyLight">{layer.blurb}</p>
      </div>
      <div className="mt-2 sm:mt-0 flex flex-wrap items-center gap-1.5 flex-shrink-0">
        {layer.items.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="inline-flex items-center gap-1.5 rounded-full border border-fw-secondary bg-fw-wash px-3 py-1.5 text-figma-sm font-medium text-fw-body hover:border-fw-active hover:text-fw-link transition-colors"
          >
            <AttIcon name={item.icon} className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StackPanel() {
  const [ai, naas] = STACK_LAYERS;
  return (
    <section
      aria-label="The network stack"
      data-testid="stack-panel"
      className="rounded-2xl border border-fw-secondary bg-fw-base p-4 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div>
          <h2 className="text-figma-base font-bold text-fw-heading tracking-[-0.02em]">The stack</h2>
          <p className="text-figma-sm text-fw-bodyLight">
            Pick the layer you work on. The four verbs are the same on every one.
          </p>
        </div>
        <Link
          to="/stack"
          className="inline-flex items-center gap-1 text-figma-sm font-medium text-fw-link hover:underline whitespace-nowrap"
        >
          Why it's organized this way <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-1.5">
        <LiveBand layer={ai} />

        {/* Cloud — a vision stratum, but its work has a real home today. */}
        <div
          data-testid="stack-band-cloud"
          className="rounded-xl border border-dashed border-fw-secondary bg-fw-wash/50 px-4 py-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <p className="text-figma-base font-bold text-fw-bodyLight tracking-[-0.02em]">
              Cloud
              <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.08em] text-fw-bodyLight">
                its own layer, next
              </span>
            </p>
            <p className="text-figma-sm text-fw-bodyLight">
              On-ramps, managed VPC, Equinix attach, L3 to neoclouds.
            </p>
          </div>
          <Link
            to="/naas/connect"
            className="mt-2 sm:mt-0 inline-flex items-center gap-1 text-figma-sm font-medium text-fw-link hover:underline whitespace-nowrap flex-shrink-0"
          >
            Cloud attach lives in NaaS · Connect today <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <LiveBand layer={naas} />

        {/* Transport & Access — media are siblings, not layers of each other. */}
        <div
          data-testid="stack-band-transport"
          className="rounded-xl border border-dashed border-fw-secondary bg-fw-wash/50 px-4 py-2.5"
        >
          <p className="text-figma-base font-bold text-fw-bodyLight tracking-[-0.02em]">
            Transport &amp; Access
            <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.08em] text-fw-bodyLight">
              vision
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {['Fiber', 'Dark fiber', 'Wireless · 5G · FirstNet', 'Satellite'].map(m => (
              <span
                key={m}
                className="rounded-full border border-dashed border-fw-secondary px-3 py-1 text-figma-sm font-medium text-fw-bodyLight select-none"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
