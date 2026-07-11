import { AlertCircle } from 'lucide-react';
import { Connection } from '../../types';
import { isConnectionEditable, getConnectionEditRestrictionReason } from '../../utils/connections';

interface ConnectionEditWarningProps {
  connection: Connection;
  className?: string;
}

export function ConnectionEditWarning({ connection, className = '' }: ConnectionEditWarningProps) {
  const isEditable = isConnectionEditable(connection);
  const restrictionReason = getConnectionEditRestrictionReason(connection);

  if (isEditable || !restrictionReason) {
    return null;
  }

  return (
    <div className={`flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg ${className}`}>
      <AlertCircle className="h-5 w-5 text-fw-warn flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-fw-heading mb-1">Configuration Locked</h4>
        <p className="text-sm text-fw-body">
          {restrictionReason}. You can deactivate the connection from the connection menu to make changes.
        </p>
      </div>
    </div>
  );
}
