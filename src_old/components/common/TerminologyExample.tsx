import { TerminologyTooltip } from './TerminologyTooltip';

export function TerminologyExample() {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Understanding Network Architecture
      </h3>

      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        <p>
          When you create a{' '}
          <TerminologyTooltip termId="connection">
            <span className="font-medium text-blue-700 border-b border-blue-300 border-dotted cursor-help">
              Connection
            </span>
          </TerminologyTooltip>
          , you establish a dedicated network path to cloud providers. Each connection can have multiple{' '}
          <TerminologyTooltip termId="cloud-router">
            <span className="font-medium text-green-700 border-b border-green-300 border-dotted cursor-help">
              Cloud Routers
            </span>
          </TerminologyTooltip>
          {' '}that handle routing and traffic management.
        </p>

        <p>
          Within each Cloud Router, you can create{' '}
          <TerminologyTooltip termId="link">
            <span className="font-medium text-purple-700 border-b border-purple-300 border-dotted cursor-help">
              Links (VLANs)
            </span>
          </TerminologyTooltip>
          {' '}to segment your traffic. Each Link can have its own{' '}
          <TerminologyTooltip termId="routing">
            <span className="font-medium text-gray-700 border-b border-gray-400 border-dotted cursor-help">
              routing settings
            </span>
          </TerminologyTooltip>
          {' '}and attached{' '}
          <TerminologyTooltip termId="vnf">
            <span className="font-medium text-orange-700 border-b border-orange-300 border-dotted cursor-help">
              VNFs
            </span>
          </TerminologyTooltip>
          {' '}for security and network functions.
        </p>

        <p>
          All of this virtual infrastructure runs on physical{' '}
          <TerminologyTooltip termId="ipe">
            <span className="font-medium text-gray-800 border-b border-gray-500 border-dotted cursor-help">
              IPE routers
            </span>
          </TerminologyTooltip>
          {' '}located at data center facilities, which provide the actual{' '}
          <TerminologyTooltip termId="bandwidth">
            <span className="font-medium text-blue-700 border-b border-blue-300 border-dotted cursor-help">
              bandwidth
            </span>
          </TerminologyTooltip>
          {' '}capacity and connectivity to{' '}
          <TerminologyTooltip termId="cloud-provider">
            <span className="font-medium text-cyan-700 border-b border-cyan-300 border-dotted cursor-help">
              cloud providers
            </span>
          </TerminologyTooltip>
          .
        </p>
      </div>

      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong className="font-semibold">Tip:</strong> Hover over any underlined term to see its definition, examples, and related concepts. Click "Learn More" to view the full glossary entry.
        </p>
      </div>
    </div>
  );
}
