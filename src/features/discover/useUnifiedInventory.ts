import { useCloudControl } from '../../engine/react/useCloudControl';
import type { CloudControl } from '../../engine/types';

export interface NetworkFacet {
  onrampId: string | null;
  onrampName: string | null;
  attached: boolean;
  workloads: number;
  path: 'private' | 'public';
}

export interface AiFacet {
  status: 'connected' | 'pending';
  provider: string;
  models: { id: string; name: string; ready: boolean }[];
  readyCount: number;
}

export interface InventoryRow {
  key: string;
  name: string;
  /** `id` maps to a <ProviderLogo> brand mark (aws/azure/gcp/oci/cw/neb);
   *  AI-only providers have no mark id and fall back to a monogram tile. */
  mark: { id: string | null; color: string; label: string };
  network: NetworkFacet | null;
  ai: AiFacet | null;
}

type Model = { id: string; name: string; endpoint: string; cloud: string | null; ready: boolean };

export function buildInventory(cc: CloudControl): InventoryRow[] {
  const clouds = cc.clouds as { id: string; name: string; color: string; mk: string; workloads: number; attached: boolean }[];
  const onramps = cc.onramps as { id: string; name: string; targets: [string, string][]; active: boolean }[];
  const models = cc.modelCatalog() as Model[];

  const modelsByCloud = new Map<string, Model[]>();
  const externalByProvider = new Map<string, Model[]>();
  for (const m of models) {
    if (m.cloud) {
      const list = modelsByCloud.get(m.cloud) ?? [];
      list.push(m);
      modelsByCloud.set(m.cloud, list);
    } else {
      const list = externalByProvider.get(m.endpoint) ?? [];
      list.push(m);
      externalByProvider.set(m.endpoint, list);
    }
  }

  const aiFacet = (list: Model[], provider: string): AiFacet => {
    const readyCount = list.filter(m => m.ready).length;
    return {
      status: readyCount > 0 ? 'connected' : 'pending',
      provider,
      models: list.map(m => ({ id: m.id, name: m.name, ready: m.ready })),
      readyCount,
    };
  };

  const rows: InventoryRow[] = clouds.map(c => {
    const ramp = onramps.find(o => o.targets.some(([cid]) => cid === c.id)) ?? null;
    const network: NetworkFacet = {
      onrampId: ramp?.id ?? null,
      onrampName: ramp?.name ?? null,
      attached: c.attached,
      workloads: c.workloads,
      path: c.attached ? 'private' : 'public',
    };
    const list = modelsByCloud.get(c.id);
    return {
      key: c.id,
      name: c.name,
      mark: { id: c.id, color: c.color, label: c.mk },
      network,
      ai: list ? aiFacet(list, c.name) : null,
    };
  });

  // AI-only providers (external models with cloud === null), keyed by provider label
  for (const [provider, list] of externalByProvider) {
    rows.push({
      key: provider,
      name: provider,
      mark: { id: null, color: '#6E82A4', label: provider.slice(0, 2).toUpperCase() },
      network: null,
      ai: aiFacet(list, provider),
    });
  }

  return rows;
}

export function useUnifiedInventory(): InventoryRow[] {
  return useCloudControl(buildInventory);
}
