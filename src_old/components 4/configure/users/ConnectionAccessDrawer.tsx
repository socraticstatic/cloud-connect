import { useState } from 'react';
import { Network, Shield, Eye, Settings, Activity, AlertCircle, Info } from 'lucide-react';
import { UserType } from '../types';
import { SideDrawer } from '../../common/SideDrawer';
import { Button } from '../../common/Button';
import { ScopeBadge } from '../../common/ScopeBadge';
import { permissionChecker } from '../../../utils/permissionChecker';
import { Role } from '../../../types/permissions';

interface ConnectionAccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (userId: string, connectionAccess: any[]) => void;
}

const AVAILABLE_CONNECTIONS = [
  { id: '1', name: 'AWS Direct Connect', location: 'us-east-1' },
  { id: '2', name: 'Azure ExpressRoute', location: 'eastus' },
  { id: '3', name: 'Google Cloud Interconnect', location: 'us-central1' },
  { id: '4', name: 'Site-to-Site VPN', location: 'us-west-2' }
];

const PERMISSIONS = [
  { id: 'view', label: 'View', icon: Eye, description: 'View connection details and status' },
  { id: 'manage', label: 'Manage', icon: Shield, description: 'Create, edit, and delete connections' },
  { id: 'monitor', label: 'Monitor', icon: Activity, description: 'Access monitoring and analytics' },
  { id: 'configure', label: 'Configure', icon: Settings, description: 'Modify connection settings' }
];

export function ConnectionAccessDrawer({ isOpen, onClose, user, onSave }: ConnectionAccessDrawerProps) {
  const [accessConfig, setAccessConfig] = useState(
    user.connectionAccess.reduce((acc, curr) => ({
      ...acc,
      [curr.connectionId]: curr.permissions
    }), {})
  );

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

  const handleSelectAll = (connectionId: string) => {
    setAccessConfig(prev => ({
      ...prev,
      [connectionId]: PERMISSIONS.map(p => p.id)
    }));
  };

  const handleDeselectAll = (connectionId: string) => {
    setAccessConfig(prev => ({
      ...prev,
      [connectionId]: []
    }));
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

  const getActiveConnectionsCount = () => {
    return Object.values(accessConfig).filter(perms => perms.length > 0).length;
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Connection Access"
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-fw-bodyLight">
            {getActiveConnectionsCount()} of {AVAILABLE_CONNECTIONS.length} connections with access
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" icon={Shield} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User Info Banner */}
        <div className="bg-fw-blue-light border border-fw-active rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-fw-link mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-fw-heading mb-1">
                Connection Access for {user.name}
              </h3>
              <p className="text-xs text-fw-body mb-2">
                Configure which connections {user.name} can access and what actions they can perform on each connection.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-fw-bodyLight">Role:</span>
                  <span className="px-2 py-0.5 bg-fw-accent text-fw-cobalt-700 rounded-md font-medium border border-fw-active">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-fw-bodyLight">Scope:</span>
                  <ScopeBadge
                    scope={permissionChecker.getDefaultScope(
                      user.role.toLowerCase().includes('admin') ? 'admin' : 'user'
                    )}
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scope Information Banner */}
        <div className="bg-fw-accent border border-fw-active rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-fw-link mt-0.5 flex-shrink-0" />
            <div className="text-xs text-fw-body">
              <span className="font-medium text-fw-heading">Scope Limitations:</span>
              {' '}User's role limits access to connections within their {permissionChecker.getDefaultScope(
                user.role.toLowerCase().includes('admin') ? 'admin' : 'user'
              )} scope. Connections outside this scope will not be accessible.
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-fw-heading">Available Connections</h3>
            <div className="text-xs text-fw-bodyLight">
              Select permissions for each connection
            </div>
          </div>

          {AVAILABLE_CONNECTIONS.map((connection) => {
            const hasAnyPermission = (accessConfig[connection.id] || []).length > 0;
            const hasAllPermissions = (accessConfig[connection.id] || []).length === PERMISSIONS.length;

            return (
              <div
                key={connection.id}
                className={`border rounded-lg transition-all ${
                  hasAnyPermission
                    ? 'border-fw-active bg-fw-blue-light'
                    : 'border-fw-secondary bg-fw-base'
                }`}
              >
                {/* Connection Header */}
                <div className="p-4 border-b border-fw-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-fw-accent rounded-lg">
                        <Network className="h-5 w-5 text-fw-link" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-fw-heading">
                          {connection.name}
                        </div>
                        <div className="text-xs text-fw-bodyLight">{connection.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!hasAllPermissions && (
                        <button
                          onClick={() => handleSelectAll(connection.id)}
                          className="text-xs text-fw-link hover:text-fw-linkHover font-medium"
                        >
                          Select All
                        </button>
                      )}
                      {hasAnyPermission && (
                        <button
                          onClick={() => handleDeselectAll(connection.id)}
                          className="text-xs text-fw-bodyLight hover:text-fw-body font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  {hasAnyPermission && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-fw-success"></div>
                      <span className="text-xs text-fw-success font-medium">
                        {(accessConfig[connection.id] || []).length} permission
                        {(accessConfig[connection.id] || []).length !== 1 ? 's' : ''} granted
                      </span>
                    </div>
                  )}
                </div>

                {/* Permissions Grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {PERMISSIONS.map((permission) => {
                    const isChecked = (accessConfig[connection.id] || []).includes(permission.id);
                    const Icon = permission.icon;

                    return (
                      <label
                        key={permission.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? 'border-fw-active bg-fw-accent'
                            : 'border-fw-secondary bg-fw-base hover:border-fw-active hover:bg-fw-wash'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(connection.id, permission.id)}
                          className="mt-0.5 text-fw-link border-fw-secondary focus:ring-fw-active"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-4 w-4 flex-shrink-0 ${
                              isChecked ? 'text-fw-link' : 'text-fw-bodyLight'
                            }`} />
                            <span className={`text-sm font-medium ${
                              isChecked ? 'text-fw-heading' : 'text-fw-body'
                            }`}>
                              {permission.label}
                            </span>
                          </div>
                          <p className="text-xs text-fw-bodyLight leading-relaxed">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {getActiveConnectionsCount() > 0 && (
          <div className="bg-green-50 border border-fw-success rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-fw-success mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-fw-heading mb-1">Access Summary</h3>
                <p className="text-xs text-fw-body">
                  {user.name} will have access to {getActiveConnectionsCount()} connection
                  {getActiveConnectionsCount() !== 1 ? 's' : ''} with the configured permissions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}
