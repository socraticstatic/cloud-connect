import { Activity } from 'lucide-react';
import { VLAN } from '../modals/VLANModal';

interface LinkStatusSummaryProps {
  links: VLAN[];
}

export function LinkStatusSummary({ links }: LinkStatusSummaryProps) {
  const activeCount = links.filter(v => v.status === 'active').length;
  const inactiveCount = links.filter(v => v.status === 'inactive').length;
  
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-start space-x-2">
        <Activity className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Link Status:</span> {activeCount} active, {inactiveCount} inactive
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Virtual Links are logical network segments that allow devices to communicate as if they were on the same physical network, even when they are on different physical segments.
          </p>
        </div>
      </div>
    </div>
  );
}