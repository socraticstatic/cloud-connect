import { useState } from 'react';
import { Plus, Edit, Trash2, Filter, Save, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../common/Button';

interface FilterRule {
  id: string;
  name: string;
  description: string;
  filters: {
    severity?: string[];
    types?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
    timeRange?: string;
  };
  enabled: boolean;
  isDefault: boolean;
  usageCount: number;
  createdBy: string;
  lastUsed?: string;
}

interface FilterRulesProps {
  selectedConnection: string;
}

export function FilterRules({ selectedConnection }: FilterRulesProps) {
  const [rules, setRules] = useState<FilterRule[]>([
    {
      id: '1',
      name: 'Critical Issues Only',
      description: 'Show only error and warning severity logs',
      filters: {
        severity: ['error', 'warning'],
        types: [],
        keywords: [],
        excludeKeywords: [],
        timeRange: '24h'
      },
      enabled: true,
      isDefault: false,
      usageCount: 45,
      createdBy: 'system',
      lastUsed: '2024-03-11 15:30'
    },
    {
      id: '2',
      name: 'Security Events',
      description: 'Filter for security-related logs only',
      filters: {
        severity: [],
        types: ['security'],
        keywords: ['authentication', 'authorization', 'access'],
        excludeKeywords: [],
        timeRange: '7d'
      },
      enabled: true,
      isDefault: false,
      usageCount: 23,
      createdBy: 'sarah.chen@example.com',
      lastUsed: '2024-03-11 14:20'
    },
    {
      id: '3',
      name: 'Performance Monitoring',
      description: 'Track performance-related logs and metrics',
      filters: {
        severity: ['warning', 'error'],
        types: ['performance'],
        keywords: ['latency', 'bandwidth', 'throughput'],
        excludeKeywords: ['normal', 'success'],
        timeRange: '24h'
      },
      enabled: true,
      isDefault: true,
      usageCount: 89,
      createdBy: 'system',
      lastUsed: '2024-03-11 15:45'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));

    const rule = rules.find(r => r.id === ruleId);
    window.addToast({
      type: 'success',
      title: 'Filter Updated',
      message: `Filter "${rule?.name}" ${rule?.enabled ? 'disabled' : 'enabled'}`,
      duration: 3000
    });
  };

  const setDefaultRule = (ruleId: string) => {
    setRules(rules.map(rule => ({
      ...rule,
      isDefault: rule.id === ruleId
    })));

    const rule = rules.find(r => r.id === ruleId);
    window.addToast({
      type: 'success',
      title: 'Default Filter Set',
      message: `"${rule?.name}" is now the default filter`,
      duration: 3000
    });
  };

  const deleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule?.isDefault) {
      window.addToast({
        type: 'error',
        title: 'Cannot Delete',
        message: 'Cannot delete the default filter',
        duration: 3000
      });
      return;
    }

    setRules(rules.filter(r => r.id !== ruleId));
    window.addToast({
      type: 'success',
      title: 'Filter Deleted',
      message: `Filter "${rule?.name}" has been deleted`,
      duration: 3000
    });
  };

  const applyFilter = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(rules.map(r =>
      r.id === ruleId ? { ...r, usageCount: r.usageCount + 1, lastUsed: new Date().toISOString() } : r
    ));

    window.addToast({
      type: 'info',
      title: 'Filter Applied',
      message: `Applying filter: "${rule?.name}"`,
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Filter Rules</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage custom filters for quick log access
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
          className="whitespace-nowrap shrink-0"
        >
          Create Filter Rule
        </Button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <Filter className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Filter Tips</h4>
            <p className="text-sm text-green-700 mt-1">
              Save frequently used filter combinations as rules for quick access. Set a default filter to automatically
              apply when viewing logs. Combine severity, types, and keywords for precise filtering.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`card p-6 hover:shadow-md transition-shadow ${
              !rule.enabled ? 'opacity-60' : ''
            } ${rule.isDefault ? 'border-2 border-blue-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Filter className={`h-5 w-5 ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <h4 className="text-base font-semibold text-gray-900">{rule.name}</h4>
                  {rule.isDefault && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      DEFAULT
                    </span>
                  )}
                  {rule.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{rule.description}</p>

                <div className="space-y-2 text-sm">
                  {rule.filters.severity && rule.filters.severity.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32">Severity:</span>
                      <div className="flex flex-wrap gap-1">
                        {rule.filters.severity.map(sev => (
                          <span key={sev} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            sev === 'error' ? 'bg-red-100 text-red-800' :
                            sev === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {sev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.filters.types && rule.filters.types.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32">Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {rule.filters.types.map(type => (
                          <span key={type} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.filters.keywords && rule.filters.keywords.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32">Keywords:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {rule.filters.keywords.join(', ')}
                      </span>
                    </div>
                  )}

                  {rule.filters.excludeKeywords && rule.filters.excludeKeywords.length > 0 && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32">Exclude:</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {rule.filters.excludeKeywords.join(', ')}
                      </span>
                    </div>
                  )}

                  {rule.filters.timeRange && (
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32">Time Range:</span>
                      <span className="text-gray-900">{rule.filters.timeRange}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center space-x-6 text-xs text-gray-500">
                  <div>
                    <span>Used:</span>
                    <span className="ml-1 text-gray-900 font-medium">{rule.usageCount} times</span>
                  </div>
                  <div>
                    <span>Created by:</span>
                    <span className="ml-1 text-gray-900">{rule.createdBy}</span>
                  </div>
                  {rule.lastUsed && (
                    <div>
                      <span>Last used:</span>
                      <span className="ml-1 text-gray-900">{rule.lastUsed}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => applyFilter(rule.id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    disabled={!rule.enabled}
                  >
                    Apply
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  {!rule.isDefault && (
                    <button
                      onClick={() => setDefaultRule(rule.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Set as default"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      window.addToast({
                        type: 'info',
                        title: 'Edit Filter',
                        message: 'Filter editor coming soon',
                        duration: 3000
                      });
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    disabled={rule.isDefault}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Create Filter Rule</h3>
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Filter rule builder coming soon</p>
              <p className="text-sm mt-2">Configure severity, types, keywords, and time ranges</p>
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
