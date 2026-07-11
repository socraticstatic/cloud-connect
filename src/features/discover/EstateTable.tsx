import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { ProviderLogo } from '../../components/connection/ProviderLogo';

// Maps engine cloud ids to the provider keys ProviderLogo knows how to render
// a bundled brand mark for. Providers with no bundled SVG (CoreWeave, Nebius)
// fall back to ProviderLogo's own monogram — that's intended, not a gap here.
const PROVIDER_KEY: Record<string, string> = {
  aws: 'aws',
  azure: 'azure',
  gcp: 'google',
  oci: 'oracle',
  cw: 'coreweave',
  neb: 'nebius',
};

/** Finds the (single) inactive on-ramp whose targets reach this cloud/region pair. */
function onrampReaching(
  onramps: { id: string; name: string; type: string; active: boolean; targets: [string, string][] }[],
  cloudId: string,
  regionId: string
) {
  return onramps.find(o => !o.active && o.targets.some(([c, r]) => c === cloudId && r === regionId));
}

export function EstateTable() {
  const clouds = useCloudControl(cc => cc.clouds);
  const regions = useCloudControl(cc => cc.regions);
  const vpcs = useCloudControl(cc => cc.vpcs);
  const onramps = useCloudControl(cc => cc.onramps);
  const actions = useCloudControlActions();

  return (
    <div className="space-y-6">
      {clouds.map(cloud => {
        const cloudRegions = regions[cloud.id] || [];
        return (
          <div key={cloud.id} className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
              <ProviderLogo provider={PROVIDER_KEY[cloud.id] ?? cloud.id} size={22} />
              <span className="font-medium text-fw-heading">{cloud.name}</span>
              <span className="text-figma-xs text-fw-bodyLight">{cloud.workloads} workloads</span>
              <span
                className={`ml-auto text-figma-xs font-medium px-2.5 py-1 rounded-full ${
                  cloud.attached ? 'bg-fw-successLight text-fw-success' : 'bg-fw-neutral text-fw-bodyLight'
                }`}
              >
                {cloud.attached ? 'Attached' : 'Not attached'}
              </span>
            </div>

            <table className="w-full text-figma-sm">
              <thead>
                <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
                  <th className="px-5 py-2 font-medium">Region</th>
                  <th className="px-5 py-2 font-medium">VPCs</th>
                  <th className="px-5 py-2 font-medium">Subnets</th>
                  <th className="px-5 py-2 font-medium">Path</th>
                  <th className="px-5 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fw-secondary">
                {cloudRegions.map(region => {
                  const regionVpcs = vpcs[region.id] || [];
                  const onramp = onrampReaching(onramps, cloud.id, region.id);
                  return (
                    <tr key={region.id} className="align-top">
                      <td className="px-5 py-3">
                        <div className="font-medium text-fw-heading">{region.name}</div>
                        <div className="text-figma-xs text-fw-bodyLight">{region.sub}</div>
                      </td>
                      <td className="px-5 py-3 text-fw-body">
                        {regionVpcs.length}
                        <span className="text-fw-bodyLight">
                          {' '}
                          ({regionVpcs.filter(v => v.attached).length} attached)
                        </span>
                      </td>
                      <td className="px-5 py-3 text-fw-body">{region.subnets}</td>
                      <td className="px-5 py-3">
                        {region.attached ? (
                          <span className="text-fw-success font-medium">Private · attached</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Public internet only</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {!region.attached && onramp && (
                          <button
                            type="button"
                            onClick={() => actions.activateOnramp(onramp.id)}
                            className="inline-flex items-center h-8 px-3 rounded-full text-figma-xs font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
                          >
                            Attach via {onramp.type}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
