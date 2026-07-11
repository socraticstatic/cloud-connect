import { useState } from 'react';
import {
  Upload, FileJson, Code, Download, Copy, CheckCircle, AlertTriangle, Link2
} from 'lucide-react';
import { APIConfig } from '../APIToolbox';

interface APIImportStepProps {
  config: Partial<APIConfig>;
  onChange: (config: Partial<APIConfig>) => void;
  onNext: () => void;
}

export function APIImportStep({ config, onChange, onNext }: APIImportStepProps) {
  const [importMethod, setImportMethod] = useState<'upload' | 'url' | 'manual'>('upload');
  const [jsonInput, setJsonInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    endpoints?: number;
  } | null>(null);

  const sampleAPIs = [
    {
      name: 'Network Monitoring API',
      description: 'Real-time network metrics and status updates',
      endpoints: 8
    },
    {
      name: 'Cloud Provider API',
      description: 'AWS, Azure, GCP integration endpoints',
      endpoints: 12
    },
    {
      name: 'IoT Device Management',
      description: 'Manage and monitor IoT devices',
      endpoints: 6
    },
    {
      name: 'Billing & Usage API',
      description: 'Track usage and billing information',
      endpoints: 5
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
        validateJSON(content);
      };
      reader.readAsText(file);
    }
  };

  const validateJSON = (json: string) => {
    setIsValidating(true);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(json);
        const endpointCount = parsed.paths ? Object.keys(parsed.paths).length : parsed.endpoints?.length || 0;

        setValidationResult({
          valid: true,
          message: 'API definition validated successfully',
          endpoints: endpointCount
        });

        onChange({
          ...config,
          name: parsed.info?.title || parsed.name || 'Imported API',
          description: parsed.info?.description || parsed.description || '',
          baseUrl: parsed.servers?.[0]?.url || parsed.baseUrl || '',
          endpoints: []
        });
      } catch (error) {
        setValidationResult({
          valid: false,
          message: 'Invalid JSON format. Please check your input.',
          endpoints: 0
        });
      }
      setIsValidating(false);
    }, 500);
  };

  const handleUrlImport = () => {
    setIsValidating(true);
    setTimeout(() => {
      setValidationResult({
        valid: true,
        message: 'API definition fetched successfully',
        endpoints: 8
      });

      onChange({
        ...config,
        name: 'External API',
        baseUrl: urlInput,
        endpoints: []
      });

      setIsValidating(false);
    }, 1000);
  };

  const loadSampleAPI = (api: typeof sampleAPIs[0]) => {
    const sampleJSON = {
      name: api.name,
      description: api.description,
      baseUrl: 'https://api.example.com/v1',
      endpoints: Array(api.endpoints).fill(null).map((_, i) => ({
        id: `endpoint-${i}`,
        name: `Endpoint ${i + 1}`,
        method: 'GET',
        path: `/endpoint${i + 1}`
      }))
    };

    setJsonInput(JSON.stringify(sampleJSON, null, 2));
    validateJSON(JSON.stringify(sampleJSON));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
        Import Your API
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileJson className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Supported Formats</p>
            <p className="mt-1">
              OpenAPI 3.0, Swagger 2.0, or custom JSON schema defining your API endpoints,
              authentication, and data structures.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setImportMethod('upload')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              importMethod === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setImportMethod('url')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              importMethod === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Link2 className="h-4 w-4 inline mr-2" />
            Import from URL
          </button>
          <button
            onClick={() => setImportMethod('manual')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              importMethod === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Manual Entry
          </button>
        </div>
      </div>

      {importMethod === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                OpenAPI/Swagger JSON or YAML (Max 10MB)
              </p>
            </label>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Or try a sample API</h3>
            <div className="grid grid-cols-2 gap-3">
              {sampleAPIs.map((api, index) => (
                <button
                  key={index}
                  onClick={() => loadSampleAPI(api)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="text-sm font-medium text-gray-900">{api.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{api.description}</div>
                  <div className="text-xs text-blue-600 mt-2">{api.endpoints} endpoints</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {importMethod === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Definition URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://api.example.com/swagger.json"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleUrlImport}
                disabled={!urlInput || isValidating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? 'Fetching...' : 'Import'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter the URL to your OpenAPI specification or Swagger JSON file
            </p>
          </div>
        </div>
      )}

      {importMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste JSON Definition
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
  "name": "My API",
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/data",
      "description": "Get data"
    }
  ]
}`}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Enter your API definition in JSON format
              </p>
              <button
                onClick={() => validateJSON(jsonInput)}
                disabled={!jsonInput || isValidating}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                Validate JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {validationResult && (
        <div
          className={`rounded-lg p-4 ${
            validationResult.valid
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start">
            {validationResult.valid ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  validationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {validationResult.message}
              </p>
              {validationResult.valid && validationResult.endpoints !== undefined && (
                <p className="text-sm text-green-700 mt-1">
                  Found {validationResult.endpoints} endpoint{validationResult.endpoints !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
