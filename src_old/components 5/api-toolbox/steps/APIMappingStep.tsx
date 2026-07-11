import { useState } from 'react';
import { Link2, ArrowRight, Plus, Trash2, Sparkles, Network, Database } from 'lucide-react';
import { APIConfig, DataMapping } from '../APIToolbox';

interface APIMappingStepProps {
  config: Partial<APIConfig>;
  onChange: (config: Partial<APIConfig>) => void;
  onNext: () => void;
}

export function APIMappingStep({ config, onChange, onNext }: APIMappingStepProps) {
  const [mappings, setMappings] = useState<DataMapping[]>([
    { source: 'api.bandwidth', target: 'connection.bandwidth', transformation: 'multiply:1000000' },
    { source: 'api.status', target: 'connection.status', transformation: 'map:active=up,inactive=down' }
  ]);

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');

  const sampleEndpoints = [
    { id: '1', name: 'Get Network Status', path: '/network/status', method: 'GET' },
    { id: '2', name: 'Get Bandwidth Metrics', path: '/metrics/bandwidth', method: 'GET' },
    { id: '3', name: 'List Connections', path: '/connections', method: 'GET' },
    { id: '4', name: 'Update Connection', path: '/connections/{id}', method: 'PUT' }
  ];

  const connectionFields = [
    { value: 'connection.name', label: 'Connection Name', type: 'string' },
    { value: 'connection.bandwidth', label: 'Bandwidth', type: 'number' },
    { value: 'connection.status', label: 'Status', type: 'string' },
    { value: 'connection.latency', label: 'Latency', type: 'number' },
    { value: 'connection.packetLoss', label: 'Packet Loss', type: 'number' },
    { value: 'connection.provider', label: 'Provider', type: 'string' },
    { value: 'connection.location', label: 'Location', type: 'string' }
  ];

  const addMapping = () => {
    setMappings([...mappings, { source: '', target: '', transformation: '' }]);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, field: keyof DataMapping, value: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const suggestMappings = () => {
    const suggested: DataMapping[] = [
      { source: 'response.data.bandwidth', target: 'connection.bandwidth', transformation: 'multiply:1000000' },
      { source: 'response.data.status', target: 'connection.status' },
      { source: 'response.data.latency', target: 'connection.latency' },
      { source: 'response.data.provider', target: 'connection.provider' },
      { source: 'response.data.location', target: 'connection.location' }
    ];
    setMappings(suggested);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
        Map API Data
      </h3>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start flex-1">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-900">AI-Powered Mapping Suggestions</p>
              <p className="text-sm text-purple-700 mt-1">
                Let AI analyze your API response and suggest optimal field mappings
              </p>
            </div>
          </div>
          <button
            onClick={suggestMappings}
            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Suggest Mappings
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select API Endpoint
        </label>
        <select
          value={selectedEndpoint}
          onChange={(e) => setSelectedEndpoint(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose an endpoint...</option>
          {sampleEndpoints.map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.method} {endpoint.path} - {endpoint.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Field Mappings</h3>
          <button
            onClick={addMapping}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Mapping
          </button>
        </div>

        <div className="space-y-4">
          {mappings.map((mapping, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <Database className="h-3 w-3 inline mr-1" />
                    API Source Field
                  </label>
                  <input
                    type="text"
                    value={mapping.source}
                    onChange={(e) => updateMapping(index, 'source', e.target.value)}
                    placeholder="response.data.field"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-1 flex items-center justify-center mt-6">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <Network className="h-3 w-3 inline mr-1" />
                    Network Target Field
                  </label>
                  <select
                    value={mapping.target}
                    onChange={(e) => updateMapping(index, 'target', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select field...</option>
                    {connectionFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label} ({field.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Transform
                  </label>
                  <input
                    type="text"
                    value={mapping.transformation || ''}
                    onChange={(e) => updateMapping(index, 'transformation', e.target.value)}
                    placeholder="optional"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    onClick={() => removeMapping(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {mapping.transformation && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Transformation:</span> {mapping.transformation}
                </div>
              )}
            </div>
          ))}
        </div>

        {mappings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">No mappings defined yet</p>
            <button
              onClick={addMapping}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first mapping
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transformation Functions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Functions</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li><code className="bg-white px-2 py-0.5 rounded">multiply:N</code> - Multiply by N</li>
              <li><code className="bg-white px-2 py-0.5 rounded">divide:N</code> - Divide by N</li>
              <li><code className="bg-white px-2 py-0.5 rounded">map:A=X,B=Y</code> - Map values</li>
              <li><code className="bg-white px-2 py-0.5 rounded">upper</code> - Convert to uppercase</li>
              <li><code className="bg-white px-2 py-0.5 rounded">lower</code> - Convert to lowercase</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Example Transformations</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>Bandwidth: <code className="bg-white px-2 py-0.5 rounded">multiply:1000000</code></li>
              <li>Status: <code className="bg-white px-2 py-0.5 rounded">map:1=up,0=down</code></li>
              <li>Region: <code className="bg-white px-2 py-0.5 rounded">upper</code></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Link2 className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Dynamic Data Synchronization</p>
            <p className="mt-1">
              These mappings will automatically update your network connections whenever the API data changes.
              Set up refresh intervals in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
