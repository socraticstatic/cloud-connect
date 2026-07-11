import { Connection, Link } from '../../../types';
import { CloudRouter } from '../../../types/cloudrouter';
import { LinkSection } from '../links/LinkSection';

interface LinksTabProps {
  connection: Connection;
  cloudRouters: CloudRouter[];
  allLinks: Link[];
  isEditing?: boolean;
}

export function LinksTab({
  connection,
  cloudRouters,
  allLinks,
  isEditing = false
}: LinksTabProps) {
  return (
    <div className="p-6">
      <LinkSection
        connection={connection}
        cloudRouters={cloudRouters}
        allLinks={allLinks}
        isEditing={isEditing}
      />
    </div>
  );
}
