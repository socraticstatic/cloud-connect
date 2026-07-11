import { TabItem } from '../../types/navigation';

interface VerticalTabGroupProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function VerticalTabGroup({ tabs, activeTab, onChange, className = '' }: VerticalTabGroupProps) {
  // Group tabs by category
  const groupedTabs: Record<string, TabItem[]> = {};
  
  tabs.forEach(tab => {
    const category = tab.category || 'default';
    if (!groupedTabs[category]) {
      groupedTabs[category] = [];
    }
    groupedTabs[category].push(tab);
  });

  return (
    <div className={`w-64 shrink-0 border-r border-gray-200 pr-4 ${className}`}>
      <nav className="space-y-1" aria-label="Tabs">
        {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
          <div key={category} className="mb-4">
            {category !== 'default' && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                {category}
              </h3>
            )}
            <div className="space-y-1">
              {categoryTabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && onChange(tab.id)}
                    disabled={tab.disabled}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg
                      transition-colors duration-200
                      ${tab.disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : activeTab === tab.id
                          ? 'bg-brand-lightBlue text-brand-blue'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {tab.icon && (
                      <span className={`mr-3 ${activeTab === tab.id ? 'text-brand-blue' : 'text-gray-400'}`}>
                        {tab.icon}
                      </span>
                    )}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        activeTab === tab.id ? 'bg-brand-lightBlue text-brand-blue' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}