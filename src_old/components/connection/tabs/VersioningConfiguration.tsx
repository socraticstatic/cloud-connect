import { useState } from 'react';
import { 
  GitBranch, GitCommit, GitMerge, GitPullRequest, History, 
  Clock, Check, AlertTriangle, ArrowLeft, ArrowRight,
  Download, Upload, RefreshCw, Lock, Diff, Command
} from 'lucide-react';
import { Button } from '../../common/Button';

interface Version {
  id: string;
  number: string;
  timestamp: string;
  author: string;
  type: 'major' | 'minor' | 'patch' | 'config';
  status: 'deployed' | 'pending' | 'rollback' | 'failed';
  changes: Array<{
    component: string;
    type: 'added' | 'modified' | 'removed';
    description: string;
  }>;
  metadata: {
    deploymentId?: string;
    environment: string;
    approvedBy?: string;
    reviewers: string[];
    deploymentStatus: 'deployed' | 'pending' | 'failed';
    rollbackVersion?: string;
    configHash: string;
    dependencies: {
      name: string;
      version: string;
    }[];
  };
  compliance: {
    changeRequest: string;
    riskAssessment: 'low' | 'medium' | 'high';
    approvals: {
      required: number;
      received: number;
    };
    auditTrail: {
      created: string;
      reviewed: string;
      deployed: string;
    };
  };
}

interface VersioningConfigurationProps {
  connectionId: string;
  currentVersion: string;
}

export function VersioningConfiguration({ connectionId, currentVersion }: VersioningConfigurationProps) {
  const [versions] = useState<Version[]>([
    {
      id: 'v1.0.0',
      number: '1.0.0',
      timestamp: '2024-03-10T15:30:00Z',
      author: 'Sarah Chen',
      type: 'major',
      status: 'deployed',
      changes: [
        {
          component: 'Security',
          type: 'added',
          description: 'Implemented AES-256 encryption'
        },
        {
          component: 'Network',
          type: 'added',
          description: 'Configured BGP routing'
        }
      ],
      metadata: {
        deploymentId: 'dep-001',
        environment: 'production',
        approvedBy: 'John Smith',
        reviewers: ['John Smith', 'Maria Garcia'],
        deploymentStatus: 'deployed',
        configHash: 'abc123',
        dependencies: [
          { name: 'routing-module', version: '2.1.0' },
          { name: 'security-module', version: '1.5.0' }
        ]
      },
      compliance: {
        changeRequest: 'CR-001',
        riskAssessment: 'low',
        approvals: {
          required: 2,
          received: 2
        },
        auditTrail: {
          created: '2024-03-10T14:00:00Z',
          reviewed: '2024-03-10T14:30:00Z',
          deployed: '2024-03-10T15:30:00Z'
        }
      }
    },
    {
      id: 'v1.1.0',
      number: '1.1.0',
      timestamp: '2024-03-11T10:15:00Z',
      author: 'Maria Garcia',
      type: 'minor',
      status: 'deployed',
      changes: [
        {
          component: 'QoS',
          type: 'added',
          description: 'Added traffic prioritization'
        }
      ],
      metadata: {
        deploymentId: 'dep-002',
        environment: 'production',
        approvedBy: 'John Smith',
        reviewers: ['John Smith', 'Sarah Chen'],
        deploymentStatus: 'deployed',
        configHash: 'def456',
        dependencies: [
          { name: 'qos-module', version: '1.0.0' }
        ]
      },
      compliance: {
        changeRequest: 'CR-002',
        riskAssessment: 'medium',
        approvals: {
          required: 2,
          received: 2
        },
        auditTrail: {
          created: '2024-03-11T09:00:00Z',
          reviewed: '2024-03-11T09:30:00Z',
          deployed: '2024-03-11T10:15:00Z'
        }
      }
    }
  ]);

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const getStatusColor = (status: Version['status']) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rollback':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeColor = (type: Version['type']) => {
    switch (type) {
      case 'major':
        return 'bg-purple-100 text-purple-800';
      case 'minor':
        return 'bg-blue-100 text-blue-800';
      case 'patch':
        return 'bg-green-100 text-green-800';
      case 'config':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeColor = (type: 'added' | 'modified' | 'removed') => {
    switch (type) {
      case 'added':
        return 'text-green-600';
      case 'modified':
        return 'text-blue-600';
      case 'removed':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Version Control Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Version Control</h3>
            <span className="px-2 py-1 text-sm bg-blue-100 text-brand-blue rounded-full">
              Current: v{currentVersion}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={History}
              onClick={() => setShowHistory(!showHistory)}
            >
              Version History
            </Button>
            <Button
              variant="outline"
              icon={Diff}
              onClick={() => setShowDiff(true)}
              disabled={selectedVersions.length !== 2}
              className={
                selectedVersions.length === 2
                  ? "border-brand-blue text-brand-blue hover:bg-brand-blue/5"
                  : ""
              }
            >
              Compare Versions
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Create Version</span>
              <GitCommit className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mb-3">Create a new version from current configuration</p>
            <Button variant="primary" className="w-full">
              Create Version
            </Button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Backup Configuration</span>
              <Download className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mb-3">Export current configuration as backup</p>
            <Button variant="primary" className="w-full bg-green-600 hover:bg-green-700">
              Export Config
            </Button>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Restore Version</span>
              <Upload className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mb-3">Restore configuration from backup</p>
            <Button variant="primary" className="w-full bg-purple-600 hover:bg-purple-700">
              Restore Config
            </Button>
          </div>
        </div>

        {/* Version Timeline or List */}
        {showHistory ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {versions.map((version) => (
                <div key={version.id} className="relative pl-8">
                  <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    version.id === currentVersion
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <GitCommit className="h-4 w-4" />
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">v{version.number}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(version.type)}`}>
                          {version.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>
                          {version.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(version.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {version.changes.map((change, idx) => (
                        <div key={idx} className={`text-sm ${getChangeTypeColor(change.type)}`}>
                          {change.type === 'added' && '+'} 
                          {change.type === 'removed' && '-'} 
                          {change.type === 'modified' && '•'} 
                          {change.component}: {change.description}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Author:</span>
                        <span className="font-medium text-gray-900">{version.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">CR:</span>
                        <span className="font-medium text-gray-900">{version.compliance.changeRequest}</span>
                      </div>
                    </div>

                    {version.metadata.approvedBy && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Approved by {version.metadata.approvedBy}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Risk:</span>
                          <span className={`font-medium ${
                            version.compliance.riskAssessment === 'low' ? 'text-green-600' :
                            version.compliance.riskAssessment === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {version.compliance.riskAssessment}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-4 border rounded-lg ${
                  selectedVersions.includes(version.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedVersions.length < 2) {
                            setSelectedVersions([...selectedVersions, version.id]);
                          }
                        } else {
                          setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">Version {version.number}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(version.type)}`}>
                          {version.type}
                        </span>
                        {version.id === currentVersion && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                      title="Download Configuration"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                      title="Restore Version"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                      title="Lock Version"
                    >
                      <Lock className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Version Details */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Change Request:</span>
                    <span className="ml-2 text-gray-900">{version.compliance.changeRequest}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk Level:</span>
                    <span className={`ml-2 font-medium ${
                      version.compliance.riskAssessment === 'low' ? 'text-green-600' :
                      version.compliance.riskAssessment === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {version.compliance.riskAssessment.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Approvals:</span>
                    <span className="ml-2 text-gray-900">
                      {version.compliance.approvals.received}/{version.compliance.approvals.required}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Environment:</span>
                    <span className="ml-2 text-gray-900">{version.metadata.environment}</span>
                  </div>
                </div>

                {/* Dependencies */}
                <div className="mt-4">
                  <span className="text-xs text-gray-500">Dependencies:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {version.metadata.dependencies.map((dep) => (
                      <span key={dep.name} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {dep.name}@{dep.version}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}