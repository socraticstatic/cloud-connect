import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Play, Pause, Search, Filter, Download, ChevronRight, Activity } from 'lucide-react';
import { Connection } from '../../../types';
import { BaseTable } from '../../common/BaseTable';
import { OverflowMenu } from '../../common/OverflowMenu';
import { Button } from '../../common/Button';
import { FilterButton } from '../../common/FilterButton';
import { useStore } from '../../../store/useStore';

interface ConnectionListProps {
  searchQuery: string;
  onSelect: (id: string, name: string) => void;
  selectedConnection: string | null;
  onUpdateConnection?: (id: string, updates: Partial<Connection>) => void;
}

export function ConnectionList({
  searchQuery,
  onSelect,
  selectedConnection,
  onUpdateConnection,
}: ConnectionListProps) {
  const connections = useStore(state => state.connections);
  const updateConnection = useStore(state => state.updateConnection);
  const removeConnection = useStore(state => state.removeConnection);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const filteredConnections = connections.filter(conn =>
    (conn.name ?? '').toLowerCase().includes((localSearchQuery || '').toLowerCase()) ||
    (conn.type ?? '').toLowerCase().includes((localSearchQuery || '').toLowerCase())
  );

  const handleStartEdit = (connection: Connection) => {
    setEditingId(connection.id.toString());
    setEditName(connection.name);
    setNameError('');
  };

  const handleSaveEdit = (connection: Connection) => {
    if (!editName.trim()) {
      setNameError('Connection name cannot be empty');
      return;
    }

    const nameExists = connections.some(
      conn => conn.id !== connection.id && conn.name.toLowerCase() === editName.toLowerCase()
    );
    if (nameExists) {
      setNameError('Connection name must be unique');
      return;
    }

    updateConnection(connection.id.toString(), { name: editName.trim() });
    onUpdateConnection?.(connection.id.toString(), { name: editName.trim() });
    setEditingId(null);
    setNameError('');

    window.addToast({
      type: 'success',
      title: 'Connection Updated',
      message: 'Connection name has been updated successfully.',
      duration: 3000
    });
  };

  const handleToggleStatus = (connection: Connection) => {
    const newStatus = connection.status === 'Active' ? 'Inactive' : 'Active';
    updateConnection(connection.id.toString(), { status: newStatus });
    
    window.addToast({
      type: 'success',
      title: 'Status Updated',
      message: `Connection is now ${newStatus}`,
      duration: 3000
    });
  };

  const handleDelete = (id: string) => {
    removeConnection(id);
    setShowDeleteConfirm(null);
    
    window.addToast({
      type: 'success',
      title: 'Connection Deleted',
      message: 'Connection has been removed successfully.',
      duration: 3000
    });
  };

  const columns = [
    {
      id: 'select',
      label: '',
      render: (connection: Connection) => (
        <div className="flex items-center justify-center">
          {selectedConnection === connection.id.toString() ? (
            <div className="h-2 w-2 rounded-full bg-fw-success" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      )
    },
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      render: (connection: Connection) => (
        editingId === connection.id.toString() ? (
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit(connection);
                }}
                className="p-2 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
            {nameError && (
              <span className="text-xs text-red-500 mt-1">{nameError}</span>
            )}
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-900">{connection.name || 'Unnamed Connection'}</div>
        )
      )
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true,
      render: (connection: Connection) => (
        <div className="text-sm text-gray-500">{connection.type || 'Unknown'}</div>
      )
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (connection: Connection) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          connection.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {connection.status}
        </span>
      )
    },
    {
      id: 'bandwidth',
      label: 'Bandwidth',
      sortable: true,
      render: (connection: Connection) => (
        <div className="text-sm text-gray-500">{connection.bandwidth}</div>
      )
    },
    {
      id: 'location',
      label: 'Location',
      sortable: true,
      render: (connection: Connection) => (
        <div className="text-sm text-gray-500">{connection.location}</div>
      )
    }
  ];

  return (
    <>
      {/* Help Banner */}
      <div className="mb-4 bg-gradient-to-r from-fw-wash to-fw-base border border-fw-secondary rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Activity className="h-6 w-6 text-fw-link" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-fw-heading">Connection Management</h3>
            <p className="text-sm text-fw-bodyLight mt-1">
              Click on any connection row to select it, then use the <strong>Logs</strong> or <strong>Test</strong> tabs to view detailed information.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search connections..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div className="flex items-center space-x-4">
            <FilterButton
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: 'Filters',
                  message: 'Filter options coming soon',
                  duration: 3000
                });
              }}
            />
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                window.addToast({
                  type: 'success',
                  title: 'Export Complete',
                  message: 'Connections exported successfully',
                  duration: 3000
                });
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <BaseTable
          columns={columns}
          data={filteredConnections}
          keyField="id"
          tableId="configure-connections"
          showColumnManager={true}
          onRowClick={(connection) => onSelect(connection.id.toString(), connection.name)}
          rowClassName={(connection) =>
            selectedConnection === connection.id.toString()
              ? 'bg-fw-wash border-l-4 border-fw-link hover:bg-fw-wash cursor-pointer'
              : 'hover:bg-gray-50 cursor-pointer transition-colors'
          }
          actions={(connection) => (
            <OverflowMenu
              items={[
                {
                  id: 'status',
                  label: connection.status === 'Active' ? 'Deactivate' : 'Activate',
                  icon: connection.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />,
                  onClick: () => handleToggleStatus(connection)
                },
                {
                  id: 'edit',
                  label: 'Edit Name',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: () => handleStartEdit(connection)
                },
                {
                  id: 'delete',
                  label: 'Delete Connection',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => setShowDeleteConfirm(connection.id.toString()),
                  variant: 'danger'
                }
              ]}
            />
          )}
          emptyState="No connections found"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(null)} />
            <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Delete Connection
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this connection? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500 sm:ml-3"
                >
                  Delete
                </Button>
                <div className="mt-3 sm:mt-0 sm:mr-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}