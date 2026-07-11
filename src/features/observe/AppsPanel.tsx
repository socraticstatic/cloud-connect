import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';

interface AppInfo {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

interface AppDependency {
  dst: string;
  gbps: number;
  viaPublic: boolean;
  flows: number;
  decided: { action: string; name: string } | null;
}

interface AppView {
  app: AppInfo;
  workloads: number;
  deps: AppDependency[];
  aiDeps: AppDependency[];
  privatePct: number;
  coverage: { total: number; enforced: number };
  health: 'healthy' | 'partial' | 'at-risk' | 'degraded';
}

const HEALTH_BADGE: Record<AppView['health'], string> = {
  healthy: 'bg-fw-successLight text-fw-success',
  partial: 'bg-fw-warnLight text-fw-warn',
  'at-risk': 'bg-fw-warnLight text-fw-warn',
  degraded: 'bg-fw-errorLight text-fw-error',
};

const HEALTH_LABEL: Record<AppView['health'], string> = {
  healthy: 'Healthy',
  partial: 'Partial coverage',
  'at-risk': 'At risk',
  degraded: 'Degraded',
};

export function AppsPanel() {
  const apps = useCloudControl(cc => cc.appList()) as AppView[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <AttIcon name="apps" className="h-5 w-5 text-fw-body" />
        <span className="font-medium text-fw-heading">Applications</span>
        <span className="text-figma-xs text-fw-bodyLight">
          {apps.length} application{apps.length === 1 ? '' : 's'} derived from tags, flows, and policy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {apps.map(a => (
          <div
            key={a.app.id}
            className="rounded-2xl border border-fw-secondary bg-fw-base overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-fw-secondary bg-fw-wash">
              <div>
                <div className="font-medium text-fw-heading">{a.app.name}</div>
                <div className="text-figma-xs text-fw-bodyLight">{a.app.desc}</div>
              </div>
              <span
                className={`shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-figma-xs font-medium ${HEALTH_BADGE[a.health]}`}
              >
                {HEALTH_LABEL[a.health]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 px-5 py-4">
              <div>
                <div className="text-figma-xs text-fw-bodyLight">Workloads</div>
                <div className="text-figma-base font-medium text-fw-heading tabular-nums">{a.workloads}</div>
              </div>
              <div>
                <div className="text-figma-xs text-fw-bodyLight">Private</div>
                <div className="text-figma-base font-medium text-fw-heading tabular-nums">{a.privatePct}%</div>
              </div>
              <div>
                <div className="text-figma-xs text-fw-bodyLight">Policy coverage</div>
                <div className="text-figma-base font-medium text-fw-heading tabular-nums">
                  {a.coverage.enforced}/{a.coverage.total}
                </div>
              </div>
            </div>

            {a.deps.length > 0 && (
              <ul className="px-5 pb-4 space-y-1">
                {a.deps.map((d, i) => (
                  <li key={i} className="flex items-center justify-between text-figma-xs text-fw-body">
                    <span>
                      → {d.dst}
                      {d.viaPublic && (
                        <span className="ml-1.5 text-fw-warn">(public)</span>
                      )}
                    </span>
                    <span className="text-fw-bodyLight tabular-nums">{d.gbps} Gbps</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
