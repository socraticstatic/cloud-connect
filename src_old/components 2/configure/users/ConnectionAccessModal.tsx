import { useState } from 'react';
import { X, Network } from 'lucide-react';
import { UserType } from '../types';

interface ConnectionAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (userId: string, connectionAccess: any[]) => void;
}

const AVAILABLE_CONNECTIONS = [
  { id: '1', name: 'AWS Direct Connect' },
  { id: '2', name: 'Azure ExpressRoute' },
  { id: '3', name: 'Google Cloud Interconnect' },
  { id: '4', name: 'Site-to-Site VPN' }
];

const PERMISSIONS = [
  { id: 'view', label: 'View' },
  { id: 'manage', label: 'Manage' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'configure', label: 'Configure' }
];

export function ConnectionAccessModal({ isOpen, onClose, user, onSave }: ConnectionAccessModalProps) {
  const [accessConfig, setAccessConfig] = useState(
    user.connectionAccess.reduce((acc, curr) => ({
      ...acc,
      [curr.connectionId]: curr.permissions
    }), {})
  );

  if (!isOpen) return null;

  const handlePermissionToggle = (connectionId: string, permission: string) => {
    setAccessConfig(prev => {
      const current = prev[connectionId] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      
      return {
        ...prev,
        [connectionId]: updated
      };
    });
  };

  const handleSave = () => {
    const formattedAccess = Object.entries(accessConfig)
      .filter(([_, permissions]) => permissions.length > 0)
      .map(([connectionId, permissions]) => ({
        connectionId,
        name: AVAILABLE_CONNECTIONS.find(c => c.id === connectionId)?.name || '',
        permissions
      }));

    onSave(user.id, formattedAccess);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-brand-lightBlue rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <Network className="w-6 h-6 text-brand-blue" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Manage Connection Access
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Configure connection access permissions for {user.name}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {AVAILABLE_CONNECTIONS.map((connection) => (
              <div key={connection.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Network className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-900">{connection.name}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PERMISSIONS.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={(accessConfig[connection.id] || []).includes(permission.id)}
                        onChange={() => handlePermissionToggle(connection.id, permission.id)}
                        className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-brand-blue border border-transparent rounded-md shadow-sm hover:bg-brand-darkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}