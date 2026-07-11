import { useState } from 'react';
import { Copy, Play, Key, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { API_ENDPOINTS, METHOD_COLORS, APIEndpointDoc } from '../../data/mockAPIEndpoints';

function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NB-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative">
      {label && <span className="text-[10px] font-medium text-fw-bodyLight uppercase tracking-wider">{label}</span>}
      <div className="mt-1 bg-fw-heading rounded-lg p-3 overflow-x-auto">
        <pre className="text-figma-xs text-green-300 font-mono whitespace-pre-wrap">{code}</pre>
      </div>
      <button onClick={handleCopy} className="absolute top-7 right-2 p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/80">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: APIEndpointDoc }) {
  const [expanded, setExpanded] = useState(false);
  const [tryResult, setTryResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mc = METHOD_COLORS[endpoint.method];

  const handleTry = () => {
    setLoading(true);
    setTimeout(() => {
      setTryResult(endpoint.responseBody);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="border border-fw-secondary rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-fw-wash transition-colors text-left"
      >
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${mc.bg} ${mc.text}`}>
          {endpoint.method}
        </span>
        <code className="text-figma-sm font-mono text-fw-heading flex-1">{endpoint.path}</code>
        <span className="text-figma-sm text-fw-bodyLight hidden sm:block">{endpoint.description}</span>
        {expanded ? <ChevronDown className="h-4 w-4 text-fw-bodyLight shrink-0" /> : <ChevronRight className="h-4 w-4 text-fw-bodyLight shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-fw-secondary pt-3">
          <p className="text-figma-sm text-fw-body">{endpoint.description}</p>

          {endpoint.requestBody && (
            <CodeBlock code={endpoint.requestBody} label="Request Body" />
          )}
          <CodeBlock code={endpoint.responseBody} label="Response" />
          <CodeBlock code={endpoint.curl} label="cURL" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleTry}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-figma-sm font-medium bg-fw-primary text-white hover:bg-fw-primaryHover transition-colors disabled:opacity-50"
            >
              {loading ? <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Try It
            </button>
            {tryResult && !loading && (
              <span className="text-figma-xs text-fw-success font-medium">200 OK</span>
            )}
          </div>

          {tryResult && (
            <CodeBlock code={tryResult} label="Response (Live)" />
          )}
        </div>
      )}
    </div>
  );
}

export function APIExplorer() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleGenerateKey = () => {
    const key = generateAPIKey();
    setApiKey(key);
  };

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key + Rate Limits */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-fw-base border border-fw-secondary rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4 w-4 text-fw-link" />
            <h4 className="text-figma-base font-bold text-fw-heading">API Key</h4>
          </div>
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-fw-wash rounded-lg text-figma-sm font-mono text-fw-heading truncate">{apiKey}</code>
              <button onClick={handleCopyKey} className="p-2 rounded-lg hover:bg-fw-wash text-fw-bodyLight">
                {keyCopied ? <Check className="h-4 w-4 text-fw-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <button onClick={handleGenerateKey} className="px-4 py-2 rounded-full text-figma-sm font-medium bg-fw-primary text-white hover:bg-fw-primaryHover">
              Generate API Key
            </button>
          )}
        </div>
        <div className="bg-fw-base border border-fw-secondary rounded-xl p-4">
          <h4 className="text-figma-sm font-medium text-fw-bodyLight mb-1">Base URL</h4>
          <code className="text-figma-sm font-mono text-fw-heading">https://api.netbond.att.com</code>
          <h4 className="text-figma-sm font-medium text-fw-bodyLight mt-3 mb-1">Rate Limit</h4>
          <p className="text-figma-sm text-fw-heading">1,000 requests/minute</p>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-2">
        <h3 className="text-figma-lg font-bold text-fw-heading">Endpoints</h3>
        {API_ENDPOINTS.map((ep, i) => (
          <EndpointCard key={i} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}
