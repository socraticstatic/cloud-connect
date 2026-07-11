import { Shield, Lock, Activity, AlertTriangle } from 'lucide-react';
import { Connection } from '../../../../../types';

interface SecurityOverviewWidgetProps {
  connections: Connection[];
}

export function SecurityOverviewWidget({ connections }: SecurityOverviewWidgetProps) {
  // Calculate security metrics
  const secureConnections = connections.filter(c => 
    c.security?.encryption && 
    c.security?.firewall && 
    c.security?.ddosProtection
  ).length;

  const securityScore = Math.round((secureConnections / connections.length) * 100);
  const activeThreats = 2; // Example value
  const vulnerabilities = 5; // Example value
  const complianceScore = 98; // Example value

  return (
    <div className="space-y-4">
      {/* Security Score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{securityScore}%</div>
          <div className="flex items-center mt-1">
            <Shield className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Security Score</span>
          </div>
        </div>
        <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center">
          <span className="text-lg font-bold text-green-500">{securityScore}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-600">Threats</span>
          </div>
          <div className="text-xl font-bold text-red-700">{activeThreats}</div>
        </div>

        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Shield className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-yellow-600">Vulnerabilities</span>
          </div>
          <div className="text-xl font-bold text-yellow-700">{vulnerabilities}</div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Lock className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Compliance</span>
          </div>
          <div className="text-xl font-bold text-green-700">{complianceScore}%</div>
        </div>
      </div>

      {/* Security Features */}
      <div className="space-y-2">
        {[
          { name: 'Encryption', enabled: true },
          { name: 'Firewall', enabled: true },
          { name: 'DDoS Protection', enabled: true },
          { name: 'IPSec', enabled: true }
        ].map((feature) => (
          <div key={feature.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">{feature.name}</span>
            </div>
            <span className={`text-sm ${feature.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {feature.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}