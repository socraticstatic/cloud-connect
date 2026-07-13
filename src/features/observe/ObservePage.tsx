import { useCloudControl } from '../../engine/react/useCloudControl';
import { ObservabilityShell } from './ObservabilityShell';
import { networkBinding } from './networkBinding';
import { EventStream } from './EventStream';

export function ObservePage() {
  const binding = useCloudControl(networkBinding);

  // The shell provides its own "Network Observability" header; no outer
  // PageSection title (that was a redundant second heading). EventStream
  // (live engine feed) sits below, aligned to the shell's padding.
  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-4">
      <ObservabilityShell binding={binding} />
      <div className="px-6">
        <EventStream />
      </div>
    </div>
  );
}
