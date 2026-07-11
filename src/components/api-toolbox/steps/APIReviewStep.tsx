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
      <h3 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] text-center mb-8">
        Review & Deploy
      </h3>

      <div className="bg-fw-successLight border border-fw-success/20 rounded-lg p-6">
        <div className="flex items-start">
          <div className="p-3 bg-fw-successLight rounded-lg">
            <Check className="h-6 w-6 text-fw-success" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Ready to Deploy</h3>
            <p className="text-figma-base font-medium text-fw-body mt-1">
              Your API integration is configured and ready. Review the details below and click "Complete Setup"
              to activate your integration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
          <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-fw-link" />
            API Builder
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Name</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">{config.name || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Base URL</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading font-mono break-all">{config.baseUrl || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Description</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">{config.description || 'No description'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
          <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-fw-purple" />
            Authentication
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Type</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">{getAuthLabel(config.authType)}</dd>
            </div>
            {config.authType === 'apiKey' && config.authConfig?.headerName && (
              <div>
                <dt className="text-figma-sm font-medium text-fw-bodyLight">Header Name</dt>
                <dd className="mt-1 text-figma-base font-medium text-fw-heading font-mono">{config.authConfig.headerName}</dd>
              </div>
            )}
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium bg-fw-successLight text-fw-success">
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
          <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4 flex items-center">
            <Link2 className="h-5 w-5 mr-2 text-fw-success" />
            Data Mappings
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Total Mappings</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">5 fields mapped</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Transformations</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">2 active</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium bg-fw-successLight text-fw-success">
                  <Check className="h-3 w-3 mr-1" />
                  Validated
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
          <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4 flex items-center">
            <PlayCircle className="h-5 w-5 mr-2 text-fw-warn" />
            Connection Test
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Last Test</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">Just now</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Response Time</dt>
              <dd className="mt-1 text-figma-base font-medium text-fw-heading">142ms (Excellent)</dd>
            </div>
            <div>
              <dt className="text-figma-sm font-medium text-fw-bodyLight">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-figma-sm font-medium bg-fw-successLight text-fw-success">
                  <Check className="h-3 w-3 mr-1" />
                  All Tests Passed
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
        <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-fw-link" />
          Synchronization Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Sync Frequency
            </label>
            <select className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active">
              <option value="realtime">Real-time</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="30min">Every 30 minutes</option>
              <option value="1hour">Every hour</option>
              <option value="manual">Manual only</option>
            </select>
          </div>

          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Auto-Retry on Failure
            </label>
            <select className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active">
              <option value="yes">Yes (recommended)</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Error Notifications
            </label>
            <select className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active">
              <option value="all">All errors</option>
              <option value="critical">Critical only</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="mt-4 bg-fw-accent border border-fw-active rounded-lg p-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-fw-link mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-figma-base font-medium text-fw-linkHover">
              <p className="font-medium">Automated Synchronization</p>
              <p className="mt-1">
                Your network data will be automatically updated based on the schedule you set. You can manually
                trigger a sync anytime from the connection details page.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
        <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4">Deployment Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-fw-success mr-3" />
            <span className="text-figma-base font-medium text-fw-body">API definition imported and validated</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-fw-success mr-3" />
            <span className="text-figma-base font-medium text-fw-body">Authentication configured</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-fw-success mr-3" />
            <span className="text-figma-base font-medium text-fw-body">Data mappings defined</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-fw-success mr-3" />
            <span className="text-figma-base font-medium text-fw-body">Connection tested successfully</span>
          </div>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-fw-success mr-3" />
            <span className="text-figma-base font-medium text-fw-body">Synchronization schedule set</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0057b8] to-fw-cobalt-700 rounded-2xl p-6 text-white">
        <div className="flex items-start">
          <div className="p-3 bg-white/20 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-figma-lg font-bold mb-2 tracking-[-0.03em]">What Happens Next?</h3>
            <ul className="space-y-2 text-figma-base text-white/90">
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
