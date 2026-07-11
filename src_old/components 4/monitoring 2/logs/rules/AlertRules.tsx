import { useState } from 'react';
import { Edit, Trash2, Bell, Mail, MessageSquare, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from '../../../common/Button';
import { useStore } from '../../../../store/useStore';
import { AlertRule } from '../../../../types/rule';
import { CreateAlertRuleModal } from '../../alerts/CreateAlertRuleModal';

interface AlertRulesProps {
  selectedConnection: string;
}

export function AlertRules({ selectedConnection }: AlertRulesProps) {
  const { rules, toggleRule, deleteRule } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | undefined>();

  const alertRules = rules.filter(rule => rule.type === 'alert') as AlertRule[];

  const getPriorityColor = (priority: AlertRule['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Alert Rules</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create rules to automatically generate alerts based on log patterns
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingRule(undefined);
            setShowCreateModal(true);
          }}
          className="whitespace-nowrap shrink-0"
        >
          Create Alert Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alertRules.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No Alert Rules</p>
            <p className="text-sm">Create your first alert rule to start monitoring</p>
          </div>
        ) : (
          alertRules.map((rule) => (
            <div
              key={rule.id}
              className={`card p-6 hover:shadow-md transition-shadow ${
                !rule.enabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Bell className={`h-5 w-5 ${rule.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h4 className="text-base font-semibold text-gray-900">{rule.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                      {rule.priority.toUpperCase()}
                    </span>
                    {rule.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Conditions:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Actions:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {rule.actions.email && <Mail className="h-4 w-4 text-gray-600" />}
                        {rule.actions.slack && <MessageSquare className="h-4 w-4 text-gray-600" />}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Triggered: {rule.triggerCount} times</span>
                    {rule.lastTriggered && (
                      <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                    )}
                    <span>Cooldown: {rule.cooldownMinutes}m</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setShowCreateModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateAlertRuleModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingRule(undefined);
          }}
          editRule={editingRule}
        />
      )}
    </div>
  );
}
