import { useState } from 'react';
import { Plus, Edit, Trash2, Zap, Play, Pause, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../common/Button';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'log_pattern' | 'threshold' | 'schedule' | 'webhook';
    condition: string;
  };
  action: {
    type: 'restart_service' | 'scale_resources' | 'notify_team' | 'run_script' | 'create_ticket';
    details: string;
  };
  enabled: boolean;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
}

interface AutomationRulesProps {
  selectedConnection: string;
}

export function AutomationRules({ selectedConnection }: AutomationRulesProps) {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-Restart on Critical Errors',
      description: 'Automatically restart affected service when critical errors are detected',
      trigger: {
        type: 'log_pattern',
        condition: 'severity=error AND count>5 in 5min'
      },
      action: {
        type: 'restart_service',
        details: 'Restart connection service with 30s grace period'
      },
      enabled: true,
      lastExecuted: '2024-03-10 12:30',
      executionCount: 8,
      successRate: 100
    },
    {
      id: '2',
      name: 'Scale Up on High Load',
      description: 'Scale resources when bandwidth utilization exceeds threshold',
      trigger: {
        type: 'threshold',
        condition: 'bandwidth_utilization > 80% for 10min'
      },
      action: {
        type: 'scale_resources',
        details: 'Increase bandwidth by 25%'
      },
      enabled: true,
      lastExecuted: '2024-03-09 18:45',
      executionCount: 3,
      successRate: 100
    },
    {
      id: '3',
      name: 'Security Incident Response',
      description: 'Create ticket and notify security team on security events',
      trigger: {
        type: 'log_pattern',
        condition: 'type=security AND severity=warning'
      },
      action: {
        type: 'create_ticket',
        details: 'Create P2 ticket and notify security@company.com'
      },
      enabled: false,
      executionCount: 0,
      successRate: 0
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
      title: 'Rule Updated',
      message: `Rule "${rule?.name}" ${rule?.enabled ? 'disabled' : 'enabled'}`,
      duration: 3000
    });
  };

  const deleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(rules.filter(r => r.id !== ruleId));

    window.addToast({
      type: 'success',
      title: 'Rule Deleted',
      message: `Rule "${rule?.name}" has been deleted`,
      duration: 3000
    });
  };

  const testRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    window.addToast({
      type: 'info',
      title: 'Testing Rule',
      message: `Simulating execution of "${rule?.name}"`,
      duration: 3000
    });
  };

  const getActionIcon = (actionType: AutomationRule['action']['type']) => {
    switch (actionType) {
      case 'restart_service':
        return <Play className="h-4 w-4" />;
      case 'scale_resources':
        return <Zap className="h-4 w-4" />;
      case 'create_ticket':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
          <p className="text-sm text-gray-500 mt-1">
            Automate actions in response to log events and patterns
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
          className="whitespace-nowrap shrink-0"
        >
          Create Automation Rule
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <Zap className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Automation Best Practices</h4>
            <p className="text-sm text-blue-700 mt-1">
              Always test automation rules in a non-production environment first. Set up proper notifications
              and monitoring for automated actions. Use rate limiting to prevent automation loops.
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
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className={`h-5 w-5 ${rule.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                  <h4 className="text-base font-semibold text-gray-900">{rule.name}</h4>
                  {rule.enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{rule.description}</p>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Trigger:</span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">{rule.trigger.type.replace('_', ' ')}</span>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{rule.trigger.condition}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Action:</span>
                    <div className="flex-1 flex items-start">
                      {getActionIcon(rule.action.type)}
                      <div className="ml-2">
                        <span className="text-sm text-gray-700 font-medium">{rule.action.type.replace(/_/g, ' ')}</span>
                        <p className="text-xs text-gray-500 mt-1">{rule.action.details}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-6 text-xs">
                  <div>
                    <span className="text-gray-500">Executions:</span>
                    <span className="ml-1 text-gray-900 font-medium">{rule.executionCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className={`ml-1 font-medium ${
                      rule.successRate >= 90 ? 'text-green-600' :
                      rule.successRate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {rule.successRate}%
                    </span>
                  </div>
                  {rule.lastExecuted && (
                    <div>
                      <span className="text-gray-500">Last Run:</span>
                      <span className="ml-1 text-gray-900">{rule.lastExecuted}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => testRule(rule.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  title="Test rule"
                >
                  <Play className="h-5 w-5" />
                </button>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>

                <button
                  onClick={() => {
                    window.addToast({
                      type: 'info',
                      title: 'Edit Rule',
                      message: 'Automation editor coming soon',
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
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Create Automation Rule</h3>
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Automation rule builder coming soon</p>
              <p className="text-sm mt-2">Configure triggers, actions, and execution parameters</p>
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
