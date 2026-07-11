import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { StandardReports } from './StandardReports';
import { CustomTemplates } from './CustomTemplates';
import { ScheduledReports } from './ScheduledReports';
import { ComplianceReports } from './ComplianceReports';
import { FileText, Calendar, BookTemplate as Template, ShieldCheck } from 'lucide-react';

interface ReportingProps {
  selectedConnection: string;
  timeRange: string;
  defaultTab?: 'standard' | 'templates' | 'scheduled' | 'compliance';
}

export function ReportingSection({ selectedConnection, timeRange, defaultTab = 'standard' }: ReportingProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'standard' | 'templates' | 'scheduled' | 'compliance'>(defaultTab);

  // Set initial active tab from location state or props
  useEffect(() => {
    const state = location.state as { defaultReportTab?: typeof activeTab };
    if (state?.defaultReportTab) {
      setActiveTab(state.defaultReportTab);
    } else {
      setActiveTab(defaultTab);
    }
  }, [location, defaultTab]);

  const tabs = [
    { id: 'standard', label: 'Standard Reports', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Template },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'standard':
        return <StandardReports />;
      case 'templates':
        return <CustomTemplates />;
      case 'scheduled':
        return <ScheduledReports />;
      case 'compliance':
        return <ComplianceReports />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Vertical Tabs */}
      <div className="w-64 shrink-0 border-r border-gray-200 pr-4">
        <nav className="space-y-1" aria-label="Report Types">
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
                {tab.label}
              </button>
            );
          })}
        </nav>
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