import { Connection } from '../../types';
import { ControlCenter } from './ControlCenter';

interface ControlCenterManagerProps {
  connections: Connection[];
}

export function ControlCenterManager({ connections }: ControlCenterManagerProps) {
  return (
    <div className="relative min-h-[calc(100vh-16rem)] bg-gray-50 rounded-lg">
      <ControlCenter connections={connections} />
    </div>
  );
}