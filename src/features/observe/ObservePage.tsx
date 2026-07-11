import { useState } from 'react';
import { PageSection } from '../../components/common/layouts';
import { TabGroup } from '../../components/navigation/TabGroup';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { TelemetryCharts } from './TelemetryCharts';
import { EventStream } from './EventStream';

type ObserveTab = 'telemetry' | 'applications';

export function ObservePage() {
  const [activeTab, setActiveTab] = useState<ObserveTab>('telemetry');
  // obsSummary() is a trusted engine-generated HTML narrative (bold tags only,
  // no user input reaches it) — safe to render with dangerouslySetInnerHTML.
  const summary = useCloudControl(cc => cc.obsSummary()) as string;

  const tabs = [
    {
      id: 'telemetry',
      label: 'Telemetry',
      icon: <AttIcon name="high-meter" className="h-4 w-4 mr-1.5" />,
    },
    { id: 'applications', label: 'Applications' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Observe"
        description="Observe · telemetry & egress — per-region latency, egress spend, and the live event feed from the engine."
      >
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as ObserveTab)} />

        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-fw-secondary bg-fw-base px-5 py-4">
              <div
                className="text-figma-sm text-fw-body leading-relaxed [&_b]:text-fw-heading [&_b]:font-semibold"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>

            <TelemetryCharts />

            <EventStream />
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="rounded-2xl border border-dashed border-fw-secondary px-5 py-10 text-center">
            <p className="text-figma-sm text-fw-bodyLight">
              Application-level insight (per-app egress, top talkers) lands in Task 3.4.
            </p>
          </div>
        )}
      </PageSection>
    </div>
  );
}
