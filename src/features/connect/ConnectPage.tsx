import { PageSection } from '../../components/common/layouts';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { OnrampPanel } from './OnrampPanel';
import { RouteTopology } from './RouteTopology';

export function ConnectPage() {
  const counts = useCloudControl(cc => cc.counts());
  const activeOnramps = useCloudControl(cc => cc.activeOnramps());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Connect"
        description="Connect · on-ramps to the AT&T fabric — attach a circuit to bring clouds onto the private network."
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-figma-base text-fw-body">
          <span className="font-semibold text-fw-heading">{activeOnramps} active</span>
          <span className="text-fw-bodyLight">·</span>
          <span>{counts.attached} / {counts.vpcs} VPCs attached</span>
        </div>

        <OnrampPanel />

        <RouteTopology />

        {/* Task 2.3 mounts the path table here. */}
      </PageSection>
    </div>
  );
}
