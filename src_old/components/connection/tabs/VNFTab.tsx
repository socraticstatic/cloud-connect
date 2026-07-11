import { Connection } from '../../../types';
import { VNF } from '../../../types/vnf';
import { CloudRouter } from '../../../types/cloudrouter';
import { VNFSection } from '../vnf/VNFSection';

interface VNFTabProps {
  connection: Connection;
  vnfs: VNF[];
  cloudRouters: CloudRouter[];
  onAdd: () => void;
  onEdit: (vnf: VNF) => void;
  onDelete: (vnf: VNF) => void;
}

export function VNFTab({
  connection,
  vnfs,
  cloudRouters,
  onAdd,
  onEdit,
  onDelete
}: VNFTabProps) {
  return (
    <div className="p-6">
      <VNFSection
        vnfs={vnfs}
        cloudRouters={cloudRouters}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        connectionId={connection.id.toString()}
      />
    </div>
  );
}
