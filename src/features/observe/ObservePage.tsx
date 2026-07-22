import { useCloudControl } from '../../engine/react/useCloudControl';
import { FlowBar } from '../../components/flow/FlowBar';
import { ObservabilityShell } from './ObservabilityShell';
import { networkBinding } from './networkBinding';
import { EventStream } from './EventStream';
import { PathTable } from '../connect/PathTable';

export function ObservePage() {
  const binding = useCloudControl(networkBinding);

  // The shell provides its own "Network Observability" header; the FlowBar sits
  // as the top band (aligned to the shell's px-6 padding), then EventStream
  // (live engine feed) sits below.
  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-4">
      <div className="px-6 pt-6">
        <FlowBar cta={{ label: 'See the savings', to: '/naas/cost' }} />
      </div>
      <ObservabilityShell binding={binding} />
      {/* Paths — the steerable flow table (routeFlows / steerFlow / routingFailover),
          relocated here from Connect. Governing individual paths is an observability
          concern; Connect stays focused on fabric attach. */}
      <section className="px-6 space-y-2" aria-labelledby="observe-paths-heading">
        <h2 id="observe-paths-heading" className="text-figma-lg font-semibold text-fw-heading">Paths</h2>
        <PathTable />
      </section>
      <div className="px-6">
        <EventStream />
      </div>
    </div>
  );
}
