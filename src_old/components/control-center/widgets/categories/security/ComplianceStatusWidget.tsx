import { Shield, Check, Clock, AlertTriangle } from 'lucide-react';
import { Connection } from '../../../../../types';

interface ComplianceStatusWidgetProps {
  connections: Connection[];
}

export function ComplianceStatusWidget({ connections }: ComplianceStatusWidgetProps) {
  const complianceFrameworks = [
    {
      name: 'SOC 2',
      status: 'compliant',
      lastAudit: '2024-02-15',
      nextAudit: '2024-08-15',
      score: 100
    },
    {
      name: 'HIPAA',
      status: 'compliant',
      lastAudit: '2024-01-20',
      nextAudit: '2024-07-20',
      score: 98
    },
    {
      name: 'PCI DSS',
      status: 'review',
      lastAudit: '2024-03-01',
      nextAudit: '2024-09-01',
      score: 92
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-medium text-gray-900">Compliance Status</span>
        </div>
      </div>

      <div className="space-y-3">
        {complianceFrameworks.map((framework) => (
          <div key={framework.name} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{framework.name}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                framework.status === 'compliant'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {framework.status === 'compliant' ? (
                  <Check className="h-3 w-3 inline mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                )}
                {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Next audit: {framework.nextAudit}
              </div>
              <span className="font-medium text-gray-700">{framework.score}%</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        View Compliance Reports
      </button>
    </div>
  );
}