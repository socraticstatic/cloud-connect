import { ReactNode } from 'react';
import {
  Activity, Shield, History, Terminal,
  Network, GitBranch, Layers, Users, DollarSign, Code, FileText
} from 'lucide-react';

export type ConnectionTabType =
  | 'overview'
  | 'cloudrouters'
  | 'links'
  | 'vnfs'
  | 'policies'
  | 'apps'
  | 'access'
  | 'versions'
  | 'billing'
  | 'logs'
  | 'api';

interface Tab {
  id: ConnectionTabType;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

interface ConnectionTabsProps {
  activeTab: ConnectionTabType;
  onTabChange: (tab: ConnectionTabType) => void;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <Activity className="h-5 w-5 mr-2" /> },
  { id: 'cloudrouters', label: 'Cloud Routers', icon: <GitBranch className="h-5 w-5 mr-2" /> },
  { id: 'links', label: 'Links', icon: <Network className="h-5 w-5 mr-2" /> },
  { id: 'vnfs', label: 'VNFs', icon: <Shield className="h-5 w-5 mr-2" /> },
  { id: 'policies', label: 'Policies', icon: <FileText className="h-5 w-5 mr-2" /> },
  { id: 'apps', label: 'Apps', icon: <Layers className="h-5 w-5 mr-2" /> },
  { id: 'api', label: 'API', icon: <Code className="h-5 w-5 mr-2" /> },
  { id: 'access', label: 'Access', icon: <Users className="h-5 w-5 mr-2" /> },
  { id: 'billing', label: 'Billing', icon: <DollarSign className="h-5 w-5 mr-2" /> },
  { id: 'versions', label: 'Versions', icon: <History className="h-5 w-5 mr-2" /> },
  { id: 'logs', label: 'Logs', icon: <Terminal className="h-5 w-5 mr-2" /> }
];

export function ConnectionTabs({ activeTab, onTabChange }: ConnectionTabsProps) {
  return (
    <div className="border-b border-fw-secondary">
      <nav className="-mb-px flex items-center space-x-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm no-rounded
              ${tab.disabled
                ? 'border-transparent text-fw-disabled cursor-not-allowed'
                : activeTab === tab.id
                  ? 'border-fw-active text-fw-link'
                  : 'border-transparent text-fw-bodyLight hover:text-fw-body'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}