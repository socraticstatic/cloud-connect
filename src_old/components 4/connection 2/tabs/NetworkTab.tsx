import { useState } from 'react';
import { Connection } from '../../../types';
import { VNF } from '../../../types/vnf';
import { CloudRouter } from '../../../types/cloudrouter';
import { CloudRouterSection } from '../cloudrouter/CloudRouterSection';

interface NetworkTabProps {
  connection: Connection;
  cloudRouters: CloudRouter[];
  vnfs: VNF[];
  onAddCloudRouter: () => void;
  onEditCloudRouter: (cloudRouter: CloudRouter) => void;
  onDeleteCloudRouter: (cloudRouter: CloudRouter) => void;
  isEditing?: boolean;
}

export function NetworkTab({
  connection,
  cloudRouters,
  vnfs,
  onAddCloudRouter,
  onEditCloudRouter,
  onDeleteCloudRouter,
  isEditing = false
}: NetworkTabProps) {
  return (
    <div className="p-6">
      <CloudRouterSection
        cloudRouters={cloudRouters}
        vnfs={vnfs}
        onAdd={onAddCloudRouter}
        onEdit={onEditCloudRouter}
        onDelete={onDeleteCloudRouter}
        connectionId={connection.id.toString()}
        connection={connection}
      />
    </div>
  );
}
