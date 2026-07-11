import { Activity, ShoppingBag, Cpu, Layers } from 'lucide-react';

interface ConnectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  connectionCount?: number;
  groupCount?: number;
}

export function ConnectionTabs({ activeTab, onTabChange, connectionCount, groupCount }: ConnectionTabsProps) {
  // Ensure Marketplace is first, followed by Connections, Pools, and Control Center
  const orderedTabs = [
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="h-5 w-5 mr-2" /> },
    { id: 'connections', label: 'Connections', icon: <Activity className="h-5 w-5 mr-2" />, count: connectionCount },
    { id: 'groups', label: 'Pools', icon: <Layers className="h-5 w-5 mr-2" />, count: groupCount },
    { id: 'control-center', label: 'Insights', icon: <Cpu className="h-5 w-5 mr-2" /> }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" data-onboarding="marketplace">
        {orderedTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center whitespace-nowrap pt-1 pb-2 px-1 border-b-2 font-medium text-sm no-rounded
              ${activeTab === tab.id
                ? 'border-fw-active text-fw-link'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                activeTab === tab.id ? 'bg-fw-accent text-fw-link' : 'bg-gray-100 text-gray-900'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}