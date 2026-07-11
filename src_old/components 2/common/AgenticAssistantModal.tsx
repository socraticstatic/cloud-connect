import { useState } from 'react';
import { AlertTriangle, CheckCircle, Settings, Zap, X, Loader } from 'lucide-react';
import { Modal } from './Modal';

interface Issue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedResources: string[];
  suggestedAction: string;
  canAutoResolve: boolean;
}

interface AgenticAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue;
  onCreateTicket: (issue: Issue) => void;
  onEnableAgentic: () => void;
  onResolveIssue: (issueId: string) => void;
  agenticEnabled: boolean;
}

export function AgenticAssistantModal({
  isOpen,
  onClose,
  issue,
  onCreateTicket,
  onEnableAgentic,
  onResolveIssue,
  agenticEnabled
}: AgenticAssistantModalProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [showAgenticPrompt, setShowAgenticPrompt] = useState(!agenticEnabled);

  const handleResolve = async () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      setResolved(true);
      onResolveIssue(issue.id);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 3000);
  };

  const handleEnableAgentic = () => {
    onEnableAgentic();
    setShowAgenticPrompt(false);
  };

  const getSeverityColor = () => {
    switch (issue.severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getSeverityIcon = () => {
    switch (issue.severity) {
      case 'critical':
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Zap;
    }
  };

  const SeverityIcon = getSeverityIcon();

  if (resolved) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Issue Resolved">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Issue Successfully Resolved
          </h3>
          <p className="text-gray-600">
            The issue has been automatically resolved by the AI assistant.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${getSeverityColor()}`}>
            <SeverityIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              AI Assistant Detected an Issue
            </h3>
            <p className="text-sm text-gray-600">
              I've identified a potential problem that requires your attention.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Issue</h4>
            <p className="text-sm text-gray-700">{issue.title}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{issue.description}</p>
          </div>

          {issue.affectedResources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Affected Resources</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {issue.affectedResources.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Suggested Action</h4>
            <p className="text-sm text-gray-600">{issue.suggestedAction}</p>
          </div>
        </div>

        {showAgenticPrompt && issue.canAutoResolve && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Enable Agentic AI Resolution
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Would you like me to automatically detect and resolve issues like this in the future?
                  With agentic mode enabled, I can proactively monitor your network, identify problems,
                  and take corrective action on your behalf.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleEnableAgentic}
                    className="quick-action-btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Enable Agentic Mode
                  </button>
                  <button
                    onClick={() => setShowAgenticPrompt(false)}
                    className="quick-action-btn px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="quick-action-btn px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Dismiss
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onCreateTicket(issue)}
              className="quick-action-btn px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Create Ticket
            </button>

            {issue.canAutoResolve && (
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="quick-action-btn px-4 py-2 bg-brand-blue text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isResolving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Resolving...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Resolve Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {agenticEnabled && (
          <div className="flex items-center justify-center text-xs text-gray-500 pt-2">
            <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
            Agentic AI is enabled
          </div>
        )}
      </div>
    </Modal>
  );
}
