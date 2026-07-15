import { useCloudControl } from '../../engine/react/useCloudControl';
import { FlowBar } from '../../components/flow/FlowBar';
import { ObservabilityShell } from './ObservabilityShell';
import { networkBinding } from './networkBinding';
import { EventStream } from './EventStream';

export function ObservePage() {
  const binding = useCloudControl(networkBinding);

  // The shell provides its own "Network Observability" header; the FlowBar sits
  // as the top band (aligned to the shell's px-6 padding), then EventStream
  // (live engine feed) sits below.
  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-4">
      <div className="px-6 pt-6">
        <FlowBar cta={{ label: 'See the savings', to: '/cost' }} />
      </div>
      <ObservabilityShell binding={binding} />
      <div className="px-6">
        <EventStream />
      </div>
    </div>
  );
}
