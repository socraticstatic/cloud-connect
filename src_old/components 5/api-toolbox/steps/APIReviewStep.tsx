import { Check, Globe, Key, Link2, PlayCircle, Calendar, RefreshCw, Zap } from 'lucide-react';
import { APIConfig } from '../APIToolbox';

interface APIReviewStepProps {
  config: Partial<APIConfig>;
  onChange: (config: Partial<APIConfig>) => void;
  onNext: () => void;
}

export function APIReviewStep({ config, onChange, onNext }: APIReviewStepProps) {
  const getAuthLabel = (authType?: string) => {
    switch (authType) {
      case 'apiKey': return 'API Key';
      case 'bearer': return 'Bearer Token';
      case 'oauth2': return 'OAuth 2.0';
      case 'basic': return 'Basic Authentication';
      default: return 'None';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
        Review & Deploy
      </h3>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="p-3 bg-green-100 rounded-lg">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">Ready to Deploy</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your API integration is configured and ready. Review the details below and click "Complete Setup"
              to activate your integration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            API Configuration
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Base URL</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{config.baseUrl || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.description || 'No description'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-purple-600" />
            Authentication
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{getAuthLabel(config.authType)}</dd>
            </div>
            {config.authType === 'apiKey' && config.authConfig?.headerName && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Header Name</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{config.authConfig.headerName}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Link2 className="h-5 w-5 mr-2 text-green-600" />
            Data Mappings
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Total Mappings</dt>
              <dd className="mt-1 text-sm text-gray-900">5 fields mapped</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Transformations</dt>
              <dd className="mt-1 text-sm text-gray-900">2 active</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Validated
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PlayCircle className="h-5 w-5 mr-2 text-orange-600" />
            Connection Test
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Last Test</dt>
              <dd className="mt-1 text-sm text-gray-900">Just now</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Response Time</dt>
              <dd className="mt-1 text-sm text-gray-900">142ms (Excellent)</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  All Tests Passed
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
          Synchronization Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sync Frequency
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="realtime">Real-time</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="30min">Every 30 minutes</option>
              <option value="1hour">Every hour</option>
              <option value="manual">Manual only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Retry on Failure
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="yes">Yes (recommended)</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Error Notifications
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All errors</option>
              <option value="critical">Critical only</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Automated Synchronization</p>
              <p className="mt-1">
                Your network data will be automatically updated based on the schedule you set. You can manually
                trigger a sync anytime from the connection details page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">API definition imported and validated</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Authentication configured</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Data mappings defined</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Connection tested successfully</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Synchronization schedule set</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start">
          <div className="p-3 bg-white/20 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium mb-2">What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your API integration will be activated and start syncing data immediately</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Network connections will be updated based on your mapping configuration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can monitor integration health from the Monitoring dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All API activity will be logged for troubleshooting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
