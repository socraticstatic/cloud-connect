import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';

interface ModelInfo {
  id: string;
  name: string;
  kind: string;
  endpoint: string;
  cloud: string | null;
  p50: number;
  price: number;
  ready: boolean;
}

export function ModelCatalog() {
  const models = useCloudControl(cc => cc.modelCatalog()) as ModelInfo[];

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
        <AttIcon name="apps" className="h-5 w-5 text-fw-body" />
        <span className="font-medium text-fw-heading">Model catalog</span>
        <span className="text-figma-xs text-fw-bodyLight">
          {models.filter(m => m.ready).length} / {models.length} governed &amp; ready
        </span>
      </div>

      <table className="w-full text-figma-sm">
        <thead>
          <tr className="text-left text-figma-xs uppercase tracking-wide text-fw-bodyLight bg-fw-wash/60">
            <th className="px-5 py-2 font-medium">Model</th>
            <th className="px-5 py-2 font-medium">Kind</th>
            <th className="px-5 py-2 font-medium">Endpoint</th>
            <th className="px-5 py-2 font-medium">P50</th>
            <th className="px-5 py-2 font-medium">Price</th>
            <th className="px-5 py-2 font-medium text-right">State</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fw-secondary">
          {models.map(m => (
            <tr key={m.id} className="align-top">
              <td className="px-5 py-3">
                <div className="font-medium text-fw-heading">{m.name}</div>
              </td>
              <td className="px-5 py-3 text-fw-body">{m.kind}</td>
              <td className="px-5 py-3 text-fw-body">{m.endpoint}</td>
              <td className="px-5 py-3 text-fw-body tabular-nums">{m.p50}ms</td>
              <td className="px-5 py-3 text-fw-body tabular-nums">${m.price.toFixed(2)}/1M</td>
              <td className="px-5 py-3 text-right">
                <span
                  className={`inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${
                    m.ready
                      ? 'bg-fw-successLight text-fw-success'
                      : 'bg-fw-neutral text-fw-bodyLight'
                  }`}
                >
                  {m.ready ? 'Governed · ready' : 'Not attached'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
