import { useState } from 'react';
import { Key, Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { APIConfig } from '../APIToolbox';

interface APIConfigureStepProps {
  config: Partial<APIConfig>;
  onChange: (config: Partial<APIConfig>) => void;
  onNext: () => void;
}

export function APIConfigureStep({ config, onChange, onNext }: APIConfigureStepProps) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const authTypes = [
    { value: 'none', label: 'No Authentication', description: 'Public API with no auth' },
    { value: 'apiKey', label: 'API Key', description: 'Header or query parameter' },
    { value: 'bearer', label: 'Bearer Token', description: 'OAuth 2.0 token' },
    { value: 'oauth2', label: 'OAuth 2.0', description: 'Full OAuth flow' },
    { value: 'basic', label: 'Basic Auth', description: 'Username and password' }
  ];

  const testConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setConnectionStatus('success');
      setTestingConnection(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] text-center mb-8">
        Configure API Connection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-figma-sm font-medium text-fw-body mb-2">
            API Name
          </label>
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => onChange({ ...config, name: e.target.value })}
            placeholder="My Network API"
            className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
          />
        </div>

        <div>
          <label className="block text-figma-sm font-medium text-fw-body mb-2">
            Base URL
          </label>
          <input
            type="url"
            value={config.baseUrl || ''}
            onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
            placeholder="https://api.example.com/v1"
            className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
          />
        </div>
      </div>

      <div>
        <label className="block text-figma-sm font-medium text-fw-body mb-2">
          Description
        </label>
        <textarea
          value={config.description || ''}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Describe what this API does..."
          rows={3}
          className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
        />
      </div>

      <div className="border-t border-fw-secondary pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] flex items-center">
              <Shield className="h-5 w-5 mr-2 text-fw-link" />
              Authentication
            </h3>
            <p className="text-figma-sm text-fw-bodyLight mt-1">
              Select your API authentication method
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {authTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChange({ ...config, authType: type.value as any })}
              className={`quick-action-btn p-4 border text-left transition-all ${
                config.authType === type.value
                  ? 'border-fw-heading bg-fw-base shadow-sm'
                  : 'border-fw-secondary bg-fw-base hover:border-fw-bodyLight'
              }`}
            >
              <div className="text-figma-base font-medium text-fw-heading">{type.label}</div>
              <div className="text-figma-sm text-fw-bodyLight mt-1">{type.description}</div>
            </button>
          ))}
        </div>

        {config.authType === 'apiKey' && (
          <div className="space-y-4 bg-fw-wash p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  Header Name
                </label>
                <input
                  type="text"
                  value={config.authConfig?.headerName || ''}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      authConfig: { ...config.authConfig, headerName: e.target.value }
                    })
                  }
                  placeholder="X-API-Key"
                  className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
              </div>
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={config.authConfig?.apiKey || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        authConfig: { ...config.authConfig, apiKey: e.target.value }
                      })
                    }
                    placeholder="Enter your API key"
                    className="w-full px-3 h-9 pr-10 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight hover:text-fw-body"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {config.authType === 'bearer' && (
          <div className="space-y-4 bg-fw-wash p-6 rounded-lg">
            <div>
              <label className="block text-figma-sm font-medium text-fw-body mb-2">
                Bearer Token
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.authConfig?.token || ''}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      authConfig: { ...config.authConfig, token: e.target.value }
                    })
                  }
                  placeholder="Enter bearer token"
                  className="w-full px-3 h-9 pr-10 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight hover:text-fw-body"
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {config.authType === 'basic' && (
          <div className="space-y-4 bg-fw-wash p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={config.authConfig?.username || ''}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      authConfig: { ...config.authConfig, username: e.target.value }
                    })
                  }
                  placeholder="Enter username"
                  className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
              </div>
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    value={config.authConfig?.password || ''}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        authConfig: { ...config.authConfig, password: e.target.value }
                      })
                    }
                    placeholder="Enter password"
                    className="w-full px-3 h-9 pr-10 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight hover:text-fw-body"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {config.authType === 'oauth2' && (
          <div className="space-y-4 bg-fw-wash p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  placeholder="Enter client ID"
                  className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                />
              </div>
              <div>
                <label className="block text-figma-sm font-medium text-fw-body mb-2">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="Enter client secret"
                    className="w-full px-3 h-9 pr-10 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fw-bodyLight hover:text-fw-body"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-figma-sm font-medium text-fw-body mb-2">
                Authorization URL
              </label>
              <input
                type="url"
                placeholder="https://oauth.example.com/authorize"
                className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
              />
            </div>
            <div>
              <label className="block text-figma-sm font-medium text-fw-body mb-2">
                Token URL
              </label>
              <input
                type="url"
                placeholder="https://oauth.example.com/token"
                className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-fw-secondary pt-6">
        <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Request Timeout (ms)
            </label>
            <input
              type="number"
              value={config.timeout || 30000}
              onChange={(e) => onChange({ ...config, timeout: parseInt(e.target.value) })}
              className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            />
          </div>
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Max Retries
            </label>
            <input
              type="number"
              value={config.retryPolicy?.maxRetries || 3}
              onChange={(e) =>
                onChange({
                  ...config,
                  retryPolicy: { ...config.retryPolicy!, maxRetries: parseInt(e.target.value) }
                })
              }
              className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            />
          </div>
        </div>
      </div>

      <div className="bg-fw-accent border border-fw-active rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start flex-1">
            <Key className="h-5 w-5 text-fw-link mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-figma-base font-medium text-fw-heading">Test Your Connection</p>
              <p className="text-figma-base font-medium text-fw-body mt-1">
                Verify your credentials and connectivity before proceeding
              </p>
            </div>
          </div>
          <button
            onClick={testConnection}
            disabled={testingConnection || !config.baseUrl}
            className="ml-4 px-4 py-2 bg-fw-primary text-white rounded-full hover:bg-fw-primaryHover disabled:bg-fw-neutral disabled:cursor-not-allowed transition-colors text-figma-base font-medium"
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        {connectionStatus === 'success' && (
          <div className="mt-3 flex items-center text-figma-base text-fw-success">
            <CheckCircle className="h-4 w-4 mr-2" />
            Connection successful!
          </div>
        )}
        {connectionStatus === 'error' && (
          <div className="mt-3 flex items-center text-figma-base text-fw-error">
            <AlertCircle className="h-4 w-4 mr-2" />
            Connection failed. Please check your credentials.
          </div>
        )}
      </div>
    </div>
  );
}
