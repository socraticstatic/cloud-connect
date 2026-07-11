import { AlertTriangle } from 'lucide-react';
import { PageSection } from '../../components/common/layouts';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { EstateTable } from './EstateTable';

export function DiscoverPage() {
  const counts = useCloudControl(cc => cc.counts());
  const publicVpcs = useCloudControl(cc => cc.publicVpcs());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Discover"
        description="The estate the ported Cloud Control engine has found — clouds, regions, and VPCs, live."
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-figma-base text-fw-body">
          <span className="font-semibold text-fw-heading">{counts.clouds} clouds</span>
          <span className="text-fw-bodyLight">·</span>
          <span>{counts.regions} regions</span>
          <span className="text-fw-bodyLight">·</span>
          <span>{counts.vpcs} VPCs</span>
          <span className="text-fw-bodyLight">·</span>
          <span>
            {counts.attached} / {counts.vpcs} attached
          </span>
        </div>

        {publicVpcs > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-fw-secondary bg-fw-wash px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-[#d98a00] shrink-0 mt-0.5" />
            <p className="text-figma-sm text-fw-body">
              <span className="font-semibold text-fw-heading">
                {publicVpcs} of {counts.vpcs} VPCs
              </span>{' '}
              are reachable only over public internet — no private on-ramp attached yet.
            </p>
          </div>
        )}
      </PageSection>

      <EstateTable />
    </div>
  );
}
