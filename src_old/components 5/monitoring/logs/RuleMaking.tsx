import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, AlertTriangle, Zap, Filter, Settings } from 'lucide-react';
import { Button } from '../../common/Button';
import { AlertRules } from './rules/AlertRules';
import { AutomationRules } from './rules/AutomationRules';
import { FilterRules } from './rules/FilterRules';

interface RuleMakingProps {
  selectedConnection: string;
  timeRange: string;
  defaultTab?: 'alerts' | 'automation' | 'filters';
}

export function RuleMaking({ selectedConnection, timeRange, defaultTab = 'alerts' }: RuleMakingProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'alerts' | 'automation' | 'filters'>(defaultTab);

  useEffect(() => {
    const state = location.state as { defaultRuleTab?: typeof activeTab };
    if (state?.defaultRuleTab) {
      setActiveTab(state.defaultRuleTab);
    } else {
      setActiveTab(defaultTab);
    }
  }, [location, defaultTab]);

  const tabs = [
    { id: 'alerts', label: 'Alert Rules', icon: AlertTriangle, description: 'Create rules to trigger alerts' },
    { id: 'automation', label: 'Automation Rules', icon: Zap, description: 'Automate actions based on logs' },
    { id: 'filters', label: 'Filter Rules', icon: Filter, description: 'Create custom log filters' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        return <AlertRules selectedConnection={selectedConnection} />;
      case 'automation':
        return <AutomationRules selectedConnection={selectedConnection} />;
      case 'filters':
        return <FilterRules selectedConnection={selectedConnection} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Vertical Tabs */}
      <div className="w-64 shrink-0 border-r border-gray-200 pr-4">
        <nav className="space-y-1" aria-label="Rule Types">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 mr-3 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-500 font-normal mt-0.5">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Quick Actions</h4>
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              window.addToast({
                type: 'info',
                title: 'Create Rule',
                message: 'Select a rule type from the menu',
                duration: 3000
              });
            }}
            className="w-full"
          >
            New Rule
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 pl-6">
        <div className="bg-white rounded-lg">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
