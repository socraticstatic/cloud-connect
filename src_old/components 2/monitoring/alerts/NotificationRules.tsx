import { useState } from 'react';
import { Plus, Bell, Mail, MessageSquare, Settings, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ThresholdRule, MetricGroup } from '../../../types/metric';
import { Button } from '../../common/Button';
import { useStore } from '../../../store/useStore';
import { NotificationRule } from '../../../types/rule';

interface NotificationRulesProps {
  selectedConnection: string;
}

export function NotificationRules({ selectedConnection }: NotificationRulesProps) {
  const { rules, toggleRule, deleteRule, addRule } = useStore();
  const notificationRules = rules.filter(rule => rule.type === 'notification') as NotificationRule[];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    slack: false,
    webhook: false
  });

  // Define metric groups for notifications
  const metricGroups: MetricGroup[] = [
    {
      id: 'performance',
      name: 'Performance Metrics',
      metrics: [
        {
          id: 'latency',
          name: 'Network Latency',
          description: 'Alert when latency exceeds threshold',
          category: 'performance',
          dataType: 'number',
          unit: 'ms',
          aggregation: 'avg'
        },
        {
          id: 'packetLoss',
          name: 'Packet Loss',
          description: 'Alert when packet loss exceeds threshold',
          category: 'performance',
          dataType: 'percentage',
          aggregation: 'avg'
        },
        {
          id: 'bandwidth',
          name: 'Bandwidth Utilization',
          description: 'Alert when bandwidth utilization exceeds threshold',
          category: 'performance',
          dataType: 'percentage',
          aggregation: 'avg'
        }
      ]
    },
    {
      id: 'status',
      name: 'Status Metrics',
      metrics: [
        {
          id: 'uptime',
          name: 'Uptime',
          description: 'Alert when uptime falls below threshold',
          category: 'status',
          dataType: 'percentage'
        },
        {
          id: 'errors',
          name: 'Error Rate',
          description: 'Alert when error rate exceeds threshold',
          category: 'status',
          dataType: 'number'
        }
      ]
    },
    {
      id: 'security',
      name: 'Security Metrics',
      metrics: [
        {
          id: 'failedLogins',
          name: 'Failed Login Attempts',
          description: 'Alert on multiple failed login attempts',
          category: 'security',
          dataType: 'number'
        },
        {
          id: 'ddosActivity',
          name: 'DDoS Activity',
          description: 'Alert on potential DDoS activity',
          category: 'security',
          dataType: 'number'
        }
      ]
    }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleAddThreshold = (metricId: string) => {
    setActiveMetricId(metricId);
    setShowThresholdModal(true);
  };

  const handleRemoveThreshold = (metricId: string, ruleId: string) => {
    setThresholds(prev => ({
      ...prev,
      [metricId]: prev[metricId].filter(rule => rule.id !== ruleId)
    }));

    window.addToast({
      type: 'success',
      title: 'Rule Removed',
      message: 'Notification rule has been removed successfully',
      duration: 3000
    });
  };

  const handleSaveThreshold = (rule: ThresholdRule) => {
    if (!activeMetricId) return;

    setThresholds(prev => ({
      ...prev,
      [activeMetricId]: [...(prev[activeMetricId] || []), rule]
    }));

    setShowThresholdModal(false);
    setActiveMetricId(null);

    window.addToast({
      type: 'success',
      title: 'Rule Added',
      message: 'New notification rule has been added successfully',
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationChannels.email}
              onChange={(e) => setNotificationChannels(prev => ({
                ...prev,
                email: e.target.checked
              }))}
              className="h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
            />
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Email Notifications</span>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationChannels.slack}
              onChange={(e) => setNotificationChannels(prev => ({
                ...prev,
                slack: e.target.checked
              }))}
              className="h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
            />
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Slack Notifications</span>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationChannels.webhook}
              onChange={(e) => setNotificationChannels(prev => ({
                ...prev,
                webhook: e.target.checked
              }))}
              className="h-4 w-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
            />
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Webhook Notifications</span>
            </div>
          </label>
        </div>
      </div>

      {/* Active Notification Rules */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Active Notification Rules</h3>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Add Rule
          </Button>
        </div>

        <div className="space-y-3">
          {notificationRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No notification rules configured</p>
            </div>
          ) : (
            notificationRules.map(rule => (
              <div key={rule.id} className={`p-4 border rounded-lg ${!rule.enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Bell className={`h-5 w-5 ${rule.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h4 className="text-base font-semibold text-gray-900">{rule.name}</h4>
                      {rule.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Metric: {rule.metricId}</span>
                      <span>Threshold: {rule.threshold.operator} {rule.threshold.value}</span>
                      <span>Triggered: {rule.triggerCount} times</span>
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
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Notification Rule</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Create notification rule form coming soon</p>
              <p className="text-xs mt-2">This will allow you to set thresholds for specific metrics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}