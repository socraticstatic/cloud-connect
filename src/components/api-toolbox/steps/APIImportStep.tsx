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
      <h3 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] text-center mb-8">
        Import Your API
      </h3>

      <div className="bg-fw-accent border border-fw-active rounded-lg p-4">
        <div className="flex items-start">
          <FileJson className="h-5 w-5 text-fw-link mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-figma-base font-medium text-fw-linkHover">
            <p className="font-medium">Supported Formats</p>
            <p className="mt-1">
              OpenAPI 3.0, Swagger 2.0, or custom JSON schema defining your API endpoints,
              authentication, and data structures.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-fw-secondary">
        <div className="flex space-x-8">
          <button
            onClick={() => setImportMethod('upload')}
            className={`no-rounded pb-4 px-1 border-b-2 font-medium text-figma-base transition-colors ${
              importMethod === 'upload'
                ? 'border-fw-active text-fw-link'
                : 'border-transparent text-fw-heading hover:text-fw-body hover:border-fw-secondary'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setImportMethod('url')}
            className={`no-rounded pb-4 px-1 border-b-2 font-medium text-figma-base transition-colors ${
              importMethod === 'url'
                ? 'border-fw-active text-fw-link'
                : 'border-transparent text-fw-heading hover:text-fw-body hover:border-fw-secondary'
            }`}
          >
            <Link2 className="h-4 w-4 inline mr-2" />
            Import from URL
          </button>
          <button
            onClick={() => setImportMethod('manual')}
            className={`no-rounded pb-4 px-1 border-b-2 font-medium text-figma-base transition-colors ${
              importMethod === 'manual'
                ? 'border-fw-active text-fw-link'
                : 'border-transparent text-fw-heading hover:text-fw-body hover:border-fw-secondary'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Manual Entry
          </button>
        </div>
      </div>

      {importMethod === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-fw-secondary rounded-lg p-12 text-center hover:border-fw-active transition-colors">
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-fw-bodyLight mx-auto mb-4" />
              <p className="text-figma-base font-medium text-fw-body mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-figma-sm text-fw-bodyLight">
                OpenAPI/Swagger JSON or YAML (Max 10MB)
              </p>
            </label>
          </div>

          <div>
            <h3 className="text-figma-base font-medium text-fw-heading mb-3">Or try a sample API</h3>
            <div className="grid grid-cols-2 gap-3">
              {sampleAPIs.map((api, index) => (
                <button
                  key={index}
                  onClick={() => loadSampleAPI(api)}
                  className="text-left p-4 border border-fw-secondary rounded-lg hover:border-fw-active hover:bg-fw-accent transition-all"
                >
                  <div className="text-figma-base font-medium text-fw-heading">{api.name}</div>
                  <div className="text-figma-sm text-fw-bodyLight mt-1">{api.description}</div>
                  <div className="text-figma-sm text-fw-link mt-2">{api.endpoints} endpoints</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {importMethod === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
              API Definition URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://api.example.com/swagger.json"
                className="flex-1 px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
              />
              <button
                onClick={handleUrlImport}
                disabled={!urlInput || isValidating}
                className="px-6 py-2 bg-fw-primary text-white rounded-full hover:bg-fw-primaryHover disabled:bg-fw-neutral disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? 'Fetching...' : 'Import'}
              </button>
            </div>
            <p className="mt-2 text-figma-sm text-fw-bodyLight">
              Enter the URL to your OpenAPI specification or Swagger JSON file
            </p>
          </div>
        </div>
      )}

      {importMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-figma-sm font-medium text-fw-body mb-2">
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
              className="w-full px-4 py-3 border border-fw-secondary rounded-lg font-mono text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-figma-sm text-fw-bodyLight">
                Enter your API definition in JSON format
              </p>
              <button
                onClick={() => validateJSON(jsonInput)}
                disabled={!jsonInput || isValidating}
                className="text-figma-base text-fw-link hover:text-fw-linkHover font-medium disabled:text-fw-bodyLight"
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
              ? 'bg-fw-successLight border border-fw-success/20'
              : 'bg-fw-errorLight border border-fw-error/20'
          }`}
        >
          <div className="flex items-start">
            {validationResult.valid ? (
              <CheckCircle className="h-5 w-5 text-fw-success mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-fw-error mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-figma-base font-medium ${
                  validationResult.valid ? 'text-fw-success' : 'text-fw-error'
                }`}
              >
                {validationResult.message}
              </p>
              {validationResult.valid && validationResult.endpoints !== undefined && (
                <p className="text-figma-base text-fw-success mt-1">
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
