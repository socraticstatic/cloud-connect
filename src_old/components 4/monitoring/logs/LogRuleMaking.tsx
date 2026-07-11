import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../../common/Button';
import { FilterRules } from './rules/FilterRules';

interface LogRuleMakingProps {
  selectedConnection: string;
  timeRange: string;
}

export function LogRuleMaking({ selectedConnection, timeRange }: LogRuleMakingProps) {
  const location = useLocation();

  return (
    <div className="flex">
      {/* Vertical Tabs */}
      <div className="w-64 shrink-0 border-r border-gray-200 pr-4">
        <nav className="space-y-1" aria-label="Rule Types">
          <button
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700"
          >
            <Filter className="h-5 w-5 mr-3 text-blue-500" />
            <div className="text-left">
              <div>Filter Rules</div>
              <div className="text-xs text-gray-500 font-normal mt-0.5">Create custom log filters</div>
            </div>
          </button>
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
                title: 'Create Filter',
                message: 'Create a new log filter rule',
                duration: 3000
              });
            }}
            className="w-full"
          >
            New Filter
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 pl-6">
        <div className="bg-white rounded-lg">
          <FilterRules selectedConnection={selectedConnection} />
        </div>
      </div>
    </div>
  );
}
