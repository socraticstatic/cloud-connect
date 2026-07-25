import { ClipboardCheck } from 'lucide-react';
import { WidgetFrame } from '../WidgetFrame';
import type { LayerWidgetProps } from '../registry';
import { useCloudControlLive } from '../../../../engine/react/useCloudControl';

export function AssessmentFindingsWidget(_props: LayerWidgetProps) {
  const kpis = useCloudControlLive(cc => {
    const r = cc.assessmentReport();
    return [
      { label: 'Recoverable', value: `$${Math.round(r.recoverableMo).toLocaleString()}/mo` },
      { label: 'Security events', value: String(r.securityEvents) },
      { label: 'Invisible share', value: `${Math.round(r.invisibleSharePct)}%` },
    ];
  });
  return (
    <WidgetFrame title="What the assessment found" icon={ClipboardCheck}>
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} data-testid="assessment-kpi">
            <div className="text-figma-2xl font-bold tabular-nums tracking-[-0.02em] text-fw-heading">{k.value}</div>
            <div className="text-figma-sm text-fw-bodyLight mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}
