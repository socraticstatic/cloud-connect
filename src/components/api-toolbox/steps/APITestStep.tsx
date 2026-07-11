import { useState } from 'react';
import { PlayCircle, CheckCircle, XCircle, Clock, RefreshCw, Code, FileJson } from 'lucide-react';
import { APIConfig } from '../APIToolbox';

interface APITestStepProps {
  config: Partial<APIConfig>;
  onChange: (config: Partial<APIConfig>) => void;
  onNext: () => void;
}

export function APITestStep({ config, onChange, onNext }: APITestStepProps) {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    status: 'success' | 'error' | 'pending' | null;
    responseTime: number;
    statusCode: number;
    data: any;
  } | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');

  const sampleEndpoints = [
    { id: '1', name: 'Get Network Status', path: '/network/status', method: 'GET' },
    { id: '2', name: 'Get Bandwidth Metrics', path: '/metrics/bandwidth', method: 'GET' },
    { id: '3', name: 'List Connections', path: '/connections', method: 'GET' }
  ];

  const runTest = () => {
    setTesting(true);
    setTestResults({ status: 'pending', responseTime: 0, statusCode: 0, data: null });

    setTimeout(() => {
      const sampleData = {
        status: 'success',
        data: {
          connections: [
            {
              id: 'conn-1',
              name: 'AWS Interconnect – last mile',
              bandwidth: 10000,
              status: 'active',
              latency: 5.2,
              provider: 'AWS',
              location: 'us-east-1'
            },
            {
              id: 'conn-2',
              name: 'Azure ExpressRoute',
              bandwidth: 5000,
              status: 'active',
              latency: 7.8,
              provider: 'Azure',
              location: 'eastus'
            }
          ],
          timestamp: new Date().toISOString()
        }
      };

      setTestResults({
        status: 'success',
        responseTime: 142,
        statusCode: 200,
        data: sampleData
      });
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] text-center mb-8">
        Test API Connection
      </h3>

      <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              Select Endpoint to Test
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            >
              <option value="">Choose an endpoint...</option>
              {sampleEndpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} {endpoint.path} - {endpoint.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-figma-sm text-fw-bodyLight">
              API Base URL: <span className="font-mono text-fw-heading">{config.baseUrl || 'Not set'}</span>
            </div>
            <button
              onClick={runTest}
              disabled={testing || !selectedEndpoint}
              className="px-6 py-2 bg-fw-primary text-white rounded-full hover:bg-fw-primaryHover disabled:bg-fw-neutral disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {testResults && (
        <div className="space-y-4">
          <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4">Test Results</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-fw-wash rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-figma-base font-medium text-fw-body">Status</span>
                  {testResults.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-fw-success" />
                  )}
                  {testResults.status === 'error' && (
                    <XCircle className="h-5 w-5 text-fw-error" />
                  )}
                  {testResults.status === 'pending' && (
                    <Clock className="h-5 w-5 text-fw-warn animate-pulse" />
                  )}
                </div>
                <div className={`mt-2 text-figma-lg font-semibold ${
                  testResults.status === 'success' ? 'text-fw-success' :
                  testResults.status === 'error' ? 'text-fw-error' :
                  'text-fw-warn'
                }`}>
                  {testResults.status === 'success' ? 'Success' :
                   testResults.status === 'error' ? 'Failed' :
                   'Testing...'}
                </div>
              </div>

              <div className="bg-fw-wash rounded-lg p-4">
                <div className="text-figma-base font-medium text-fw-body">Response Time</div>
                <div className="mt-2 text-figma-lg font-semibold text-fw-heading">
                  {testResults.responseTime}ms
                </div>
                <div className="mt-1 text-figma-sm text-fw-bodyLight">
                  {testResults.responseTime < 100 ? 'Excellent' :
                   testResults.responseTime < 300 ? 'Good' :
                   testResults.responseTime < 1000 ? 'Average' : 'Slow'}
                </div>
              </div>

              <div className="bg-fw-wash rounded-lg p-4">
                <div className="text-figma-base font-medium text-fw-body">Status Code</div>
                <div className={`mt-2 text-figma-lg font-semibold ${
                  testResults.statusCode >= 200 && testResults.statusCode < 300 ? 'text-fw-success' :
                  testResults.statusCode >= 400 ? 'text-fw-error' :
                  'text-fw-heading'
                }`}>
                  {testResults.statusCode || '—'}
                </div>
                <div className="mt-1 text-figma-sm text-fw-bodyLight">
                  {testResults.statusCode >= 200 && testResults.statusCode < 300 ? 'OK' :
                   testResults.statusCode >= 400 ? 'Error' : '—'}
                </div>
              </div>
            </div>

            {testResults.status === 'success' && testResults.data && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-figma-base font-medium text-fw-heading flex items-center">
                    <FileJson className="h-4 w-4 mr-2 text-fw-link" />
                    Response Data
                  </h4>
                  <button className="text-figma-base text-fw-link hover:text-fw-linkHover font-medium flex items-center">
                    <Code className="h-4 w-4 mr-1" />
                    Copy JSON
                  </button>
                </div>
                <div className="bg-fw-heading rounded-lg p-4 overflow-x-auto">
                  <pre className="text-figma-sm text-fw-success font-mono">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {testResults.status === 'success' && (
            <div className="bg-fw-base border border-fw-secondary rounded-lg p-6">
              <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em] mb-4">Data Mapping Preview</h3>
              <p className="text-figma-base font-medium text-fw-body mb-4">
                Here's how the API data will be mapped to your network connections:
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-fw-successLight rounded-lg border border-fw-success/20">
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">API Field</div>
                    <div className="text-figma-base font-mono text-fw-heading">data.connections[0].bandwidth</div>
                  </div>
                  <div className="px-4">→</div>
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">Network Field</div>
                    <div className="text-figma-base font-medium text-fw-heading">Connection Bandwidth</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-figma-sm text-fw-bodyLight">Value</div>
                    <div className="text-figma-base font-semibold text-fw-success">10 Gbps</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-fw-successLight rounded-lg border border-fw-success/20">
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">API Field</div>
                    <div className="text-figma-base font-mono text-fw-heading">data.connections[0].status</div>
                  </div>
                  <div className="px-4">→</div>
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">Network Field</div>
                    <div className="text-figma-base font-medium text-fw-heading">Connection Status</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-figma-sm text-fw-bodyLight">Value</div>
                    <div className="text-figma-base font-semibold text-fw-success">Active</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-fw-successLight rounded-lg border border-fw-success/20">
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">API Field</div>
                    <div className="text-figma-base font-mono text-fw-heading">data.connections[0].latency</div>
                  </div>
                  <div className="px-4">→</div>
                  <div className="flex-1">
                    <div className="text-figma-sm text-fw-bodyLight">Network Field</div>
                    <div className="text-figma-base font-medium text-fw-heading">Connection Latency</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-figma-sm text-fw-bodyLight">Value</div>
                    <div className="text-figma-base font-semibold text-fw-success">5.2 ms</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center text-figma-base text-fw-success">
                <CheckCircle className="h-4 w-4 mr-2" />
                All mappings validated successfully
              </div>
            </div>
          )}

          {testResults.status === 'error' && (
            <div className="bg-fw-errorLight border border-fw-error/20 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-fw-error mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-figma-base font-medium text-fw-error">Test Failed</p>
                  <p className="text-figma-base text-fw-error mt-1">
                    Unable to connect to the API. Please check your configuration and try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!testResults && (
        <div className="bg-fw-wash border-2 border-dashed border-fw-secondary rounded-lg p-12 text-center">
          <PlayCircle className="h-16 w-16 text-fw-bodyLight mx-auto mb-4" />
          <p className="text-figma-base text-fw-body mb-2">No tests run yet</p>
          <p className="text-figma-sm text-fw-bodyLight">
            Select an endpoint and click "Run Test" to verify your API connection
          </p>
        </div>
      )}

      <div className="bg-fw-accent border border-fw-active rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-fw-link mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-figma-base font-medium text-fw-linkHover">
            <p className="font-medium">Testing Best Practices</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Test all critical endpoints before deploying</li>
              <li>Verify data mappings produce expected results</li>
              <li>Check response times meet your requirements</li>
              <li>Ensure authentication works correctly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
