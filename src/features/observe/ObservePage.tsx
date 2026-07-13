import { PageSection } from '../../components/common/layouts';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { ObservabilityShell } from './ObservabilityShell';
import { networkBinding } from './networkBinding';
import { EventStream } from './EventStream';

export function ObservePage() {
  const binding = useCloudControl(networkBinding);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Observe"
        description="Observe · telemetry & egress — per-region latency, egress spend, and the live event feed from the engine."
      >
        <ObservabilityShell binding={binding} />

        <EventStream />
      </PageSection>
    </div>
  );
}
