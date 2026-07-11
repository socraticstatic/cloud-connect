import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Download, Calendar, FileText, TrendingUp, Activity } from 'lucide-react';
import { Button } from '../../common/Button';
import { useMonitoring } from '../context/MonitoringContext';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  lastAudit: string;
  nextAudit: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  score: number;
  requirements: {
    total: number;
    met: number;
    partial: number;
    failed: number;
  };
  categories: ComplianceCategory[];
}

interface ComplianceCategory {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  controls: number;
  issues: number;
}

const frameworks: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2 compliance for security, availability, and confidentiality',
    lastAudit: '2024-01-15T00:00:00Z',
    nextAudit: '2024-07-15T00:00:00Z',
    status: 'compliant',
    score: 96,
    requirements: { total: 47, met: 45, partial: 2, failed: 0 },
    categories: [
      { name: 'Security', status: 'pass', score: 98, controls: 15, issues: 0 },
      { name: 'Availability', status: 'pass', score: 97, controls: 12, issues: 0 },
      { name: 'Confidentiality', status: 'warning', score: 92, controls: 10, issues: 2 },
      { name: 'Processing Integrity', status: 'pass', score: 95, controls: 6, issues: 0 },
      { name: 'Privacy', status: 'pass', score: 96, controls: 4, issues: 0 }
    ]
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'International standard for information security management systems',
    lastAudit: '2023-11-20T00:00:00Z',
    nextAudit: '2024-11-20T00:00:00Z',
    status: 'compliant',
    score: 94,
    requirements: { total: 114, met: 107, partial: 5, failed: 2 },
    categories: [
      { name: 'Information Security Policies', status: 'pass', score: 95, controls: 12, issues: 1 },
      { name: 'Access Control', status: 'pass', score: 96, controls: 18, issues: 0 },
      { name: 'Cryptography', status: 'warning', score: 88, controls: 8, issues: 2 },
      { name: 'Operations Security', status: 'pass', score: 94, controls: 22, issues: 1 },
      { name: 'Incident Management', status: 'pass', score: 97, controls: 14, issues: 0 }
    ]
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard for secure payment processing',
    lastAudit: '2024-02-01T00:00:00Z',
    nextAudit: '2025-02-01T00:00:00Z',
    status: 'at-risk',
    score: 87,
    requirements: { total: 78, met: 68, partial: 7, failed: 3 },
    categories: [
      { name: 'Network Security', status: 'warning', score: 85, controls: 15, issues: 3 },
      { name: 'Cardholder Data Protection', status: 'pass', score: 92, controls: 12, issues: 1 },
      { name: 'Access Control Measures', status: 'warning', score: 83, controls: 18, issues: 4 },
      { name: 'Monitoring & Testing', status: 'pass', score: 90, controls: 10, issues: 2 },
      { name: 'Security Policies', status: 'pass', score: 88, controls: 8, issues: 1 }
    ]
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act for protected health information',
    lastAudit: '2024-01-10T00:00:00Z',
    nextAudit: '2024-07-10T00:00:00Z',
    status: 'compliant',
    score: 93,
    requirements: { total: 45, met: 42, partial: 3, failed: 0 },
    categories: [
      { name: 'Administrative Safeguards', status: 'pass', score: 94, controls: 15, issues: 1 },
      { name: 'Physical Safeguards', status: 'pass', score: 96, controls: 8, issues: 0 },
      { name: 'Technical Safeguards', status: 'warning', score: 89, controls: 12, issues: 2 },
      { name: 'Policies & Procedures', status: 'pass', score: 95, controls: 10, issues: 0 }
    ]
  }
];

export function ComplianceReports() {
  const { timeRange } = useMonitoring();
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);

  const getStatusColor = (status: ComplianceFramework['status']) => {
    switch (status) {
      case 'compliant': return 'text-green-700 bg-green-100';
      case 'at-risk': return 'text-yellow-700 bg-yellow-100';
      case 'non-compliant': return 'text-red-700 bg-red-100';
    }
  };

  const getStatusIcon = (status: ComplianceFramework['status']) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'at-risk': return AlertTriangle;
      case 'non-compliant': return XCircle;
    }
  };

  const getCategoryStatusIcon = (status: ComplianceCategory['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const handleGenerateReport = (framework: ComplianceFramework) => {
    window.addToast?.({
      type: 'success',
      title: 'Generating Report',
      message: `Creating ${framework.name} compliance report`,
      duration: 3000
    });
  };

  const overallCompliance = Math.round(
    frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length
  );

  const totalRequirements = frameworks.reduce((sum, f) => sum + f.requirements.total, 0);
  const totalMet = frameworks.reduce((sum, f) => sum + f.requirements.met, 0);
  const totalIssues = frameworks.reduce((sum, f) => sum + f.requirements.failed + f.requirements.partial, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track compliance status across regulatory frameworks and industry standards
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            window.addToast?.({
              type: 'info',
              title: 'Generating Reports',
              message: 'Creating comprehensive compliance reports for all frameworks',
              duration: 4000
            });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Compliance</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {overallCompliance}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Frameworks</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {frameworks.length}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {frameworks.filter(f => f.status === 'compliant').length} compliant
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requirements Met</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {totalMet}/{totalRequirements}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((totalMet / totalRequirements) * 100)}% complete
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Issues</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {totalIssues}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Requires attention
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {frameworks.map((framework) => {
          const StatusIcon = getStatusIcon(framework.status);

          return (
            <div
              key={framework.id}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedFramework(framework)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      {framework.name}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {framework.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(framework.status)}`}>
                        <StatusIcon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                        {framework.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <div className="text-2xl font-bold text-gray-900">
                        {framework.score}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Requirements</span>
                  <span className="font-medium text-gray-900">
                    {framework.requirements.met}/{framework.requirements.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(framework.requirements.met / framework.requirements.total) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-2 text-gray-500">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    {framework.requirements.met} Met
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                    {framework.requirements.partial} Partial
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    {framework.requirements.failed} Failed
                  </span>
                </div>
              </div>

              {/* Audit Dates */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>Last audit: {new Date(framework.lastAudit).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>Next: {new Date(framework.nextAudit).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2 mb-4">
                {framework.categories.slice(0, 3).map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getCategoryStatusIcon(category.status)}
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{category.score}%</span>
                  </div>
                ))}
                {framework.categories.length > 3 && (
                  <p className="text-xs text-gray-500 pl-7">
                    +{framework.categories.length - 3} more categories
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.addToast?.({
                      type: 'info',
                      title: 'Detailed View',
                      message: `Opening detailed compliance report for ${framework.name}`,
                      duration: 3000
                    });
                  }}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-1.5" />
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(framework);
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Generate Report
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View Panel */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedFramework.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedFramework.description}</p>
              </div>
              <button
                onClick={() => setSelectedFramework(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* All Categories */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h4>
                <div className="space-y-4">
                  {selectedFramework.categories.map((category, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getCategoryStatusIcon(category.status)}
                          <div>
                            <h5 className="font-medium text-gray-900">{category.name}</h5>
                            <p className="text-sm text-gray-600">
                              {category.controls} controls, {category.issues} issues
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{category.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            category.status === 'pass' ? 'bg-green-500' :
                            category.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setSelectedFramework(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleGenerateReport(selectedFramework);
                    setSelectedFramework(null);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Full Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
