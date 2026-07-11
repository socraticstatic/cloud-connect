import { ReactNode } from 'react';
import { Layers } from 'lucide-react';
import { Group } from '../../../types/group';

interface GroupCardHeaderProps {
  group: Group;
  children?: ReactNode;
}

export function GroupCardHeader({ group, children }: GroupCardHeaderProps) {
  return (
    <div className="p-4 border-b border-fw-secondary">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-fw-wash rounded-lg">
            <Layers className="h-5 w-5 text-fw-link" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-fw-heading">
              {group.name}
            </h3>
            <p className="text-xs text-fw-bodyLight capitalize">{group.type}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
}