import { useState } from 'react';
import { Zap, CheckCircle, AlertTriangle, Bell, Ticket } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Toggle } from '../common/Toggle';

export function AgenticAISettings() {
  const { agenticSettings, updateAgenticSettings } = useStore();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggleAgentic = () => {
    if (!agenticSettings.enabled) {
      setShowConfirmation(true);
    } else {
      updateAgenticSettings({ enabled: false });
    }
  };

  const confirmEnable = () => {
    updateAgenticSettings({ enabled: true });
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agentic AI Settings</h2>
        <p className="text-gray-600">
          Configure how the AI assistant monitors and responds to issues in your network.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${agenticSettings.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Zap className={`h-6 w-6 ${agenticSettings.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Enable Agentic AI
                </h3>
                <p className="text-sm text-gray-600">
                  Allow the AI assistant to proactively monitor your network, detect issues,
                  and take action on your behalf. The AI will alert you before taking any
                  significant actions.
                </p>
                {agenticSettings.enabled && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Agentic AI is active
                  </div>
                )}
              </div>
            </div>
            <Toggle
              checked={agenticSettings.enabled}
              onChange={handleToggleAgentic}
            />
          </div>
        </div>

        {agenticSettings.enabled && (
          <>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <CheckCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Auto-Resolve Issues
                    </h3>
                    <p className="text-sm text-gray-600">
                      Allow the AI to automatically resolve detected issues when safe to do so.
                      You'll receive notifications about all actions taken.
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={agenticSettings.autoResolve}
                  onChange={(checked) => updateAgenticSettings({ autoResolve: checked })}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <Ticket className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Automatic Ticket Creation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Automatically create support tickets for issues that require human intervention.
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={agenticSettings.autoTicketCreation}
                  onChange={(checked) => updateAgenticSettings({ autoTicketCreation: checked })}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <Bell className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose which types of issues trigger notifications.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="notifications"
                        checked={agenticSettings.notificationPreference === 'all'}
                        onChange={() => updateAgenticSettings({ notificationPreference: 'all' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">All Issues</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="notifications"
                        checked={agenticSettings.notificationPreference === 'critical'}
                        onChange={() => updateAgenticSettings({ notificationPreference: 'critical' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Critical Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="notifications"
                        checked={agenticSettings.notificationPreference === 'none'}
                        onChange={() => updateAgenticSettings({ notificationPreference: 'none' })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">None (Silent Mode)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enable Agentic AI?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will allow the AI assistant to proactively monitor your network and take
                  actions on your behalf. You can customize the specific permissions and
                  notification settings after enabling.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={confirmEnable}
                    className="quick-action-btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="quick-action-btn px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
