import { useState } from 'react';
import { PageSection } from '../../components/common/layouts';
import { TabGroup } from '../../components/navigation/TabGroup';
import { AttIcon } from '../../components/icons/AttIcon';
import { TokenPolicies } from './TokenPolicies';
import { ModelCatalog } from './ModelCatalog';
import { AgentsPanel } from './AgentsPanel';
import { PromptTrace } from './PromptTrace';
import { GovernanceDecisions } from './GovernanceDecisions';

type AiFabricTab = 'policies-models' | 'agents' | 'trace';

export function AiFabricPage() {
  const [activeTab, setActiveTab] = useState<AiFabricTab>('policies-models');

  const tabs = [
    {
      id: 'policies-models',
      label: 'Policies & Models',
      icon: <AttIcon name="apis" className="h-4 w-4 mr-1.5" />,
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: <AttIcon name="apps" className="h-4 w-4 mr-1.5" />,
    },
    { id: 'trace', label: 'Trace' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <PageSection
        title="AI Fabric · the tokens layer"
        description="AI Fabric · token policies, model catalog, and agents — governance for every request the engine routes through AI."
      >
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as AiFabricTab)} />

        {activeTab === 'policies-models' && (
          <div className="space-y-4">
            <TokenPolicies />
            <ModelCatalog />
          </div>
        )}

        {activeTab === 'agents' && <AgentsPanel />}

        {activeTab === 'trace' && (
          <div className="space-y-4">
            <PromptTrace />
            <GovernanceDecisions />
          </div>
        )}
      </PageSection>
    </div>
  );
}
