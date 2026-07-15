import { useState } from 'react';
import { PageSection } from '../../components/common/layouts';
import { TabGroup } from '../../components/navigation/TabGroup';
import { AttIcon } from '../../components/icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { FlowBar } from '../../components/flow/FlowBar';
import { RulesPanel } from './RulesPanel';
import { PosturePanel } from './PosturePanel';
import { ServiceInsertion } from './ServiceInsertion';

type GovernTab = 'policies' | 'posture';

export function GovernPage() {
  const [activeTab, setActiveTab] = useState<GovernTab>('policies');
  const violations = useCloudControl(cc => cc.violations()) as unknown[];

  const tabs = [
    {
      id: 'policies',
      label: 'Policies',
      icon: <AttIcon name="check-shield" className="h-4 w-4 mr-1.5" />,
      count: violations.length || undefined,
    },
    { id: 'posture', label: 'Posture' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="Govern"
        description="Govern · policy & segmentation — rules, enforcement, violations, and impact on the live engine."
      >
        <FlowBar cta={{ label: 'Observe the impact', to: '/observe' }} />

        <TabGroup tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as GovernTab)} />

        {activeTab === 'policies' && (
          <div className="space-y-4">
            <RulesPanel />
            <ServiceInsertion />
          </div>
        )}

        {activeTab === 'posture' && <PosturePanel />}
      </PageSection>
    </div>
  );
}
