import { useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { PageSection } from '../../components/common/layouts';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { FlowBar } from '../../components/flow/FlowBar';
import { OnrampPanel } from './OnrampPanel';
import { AttachTypes } from './AttachTypes';
import { RouteTopology } from './RouteTopology';

export function ConnectPage() {
  const counts = useCloudControl(cc => cc.counts());
  const activeOnramps = useCloudControl(cc => cc.activeOnramps());
  const { search } = useLocation();
  const fromDiscover = new URLSearchParams(search).get('from') === 'discover';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Connect"
        description="Connect · on-ramps to the AT&T fabric — attach a circuit to bring clouds onto the private network."
      >
        <FlowBar cta={{ label: 'Govern these paths', to: '/govern' }} />

        {fromDiscover && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-figma-sm text-[#475569]"
          >
            <Globe size={14} className="shrink-0 text-[#64748b]" aria-hidden="true" />
            Attaching the workloads flagged on Discover — pick an on-ramp below.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-figma-base text-fw-body">
          <span className="font-semibold text-fw-heading">{activeOnramps} active</span>
          <span className="text-fw-bodyLight">·</span>
          <span>{counts.attached} / {counts.vpcs} VPCs attached</span>
        </div>

        <AttachTypes />

        <OnrampPanel />

        <RouteTopology />
      </PageSection>
    </div>
  );
}
