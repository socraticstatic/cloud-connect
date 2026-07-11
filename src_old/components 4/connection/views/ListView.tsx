import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Activity, Network, Globe, Group as GroupIcon, Settings } from 'lucide-react';
import type { Connection } from '../../../types';
import type { Group } from '../../../types/group';
import { ConnectionOverflowMenu } from '../ConnectionOverflowMenu';
import { ColumnVisibilityPopover, ColumnDefinition } from '../../common/ColumnVisibilityPopover';
import { useColumnVisibility } from '../../../hooks/useColumnVisibility';
import { useStore } from '../../../store/useStore';
import { getGroupsForConnection } from '../../../utils/groups';

interface ListViewProps {
  connections: Connection[];
  groups: Group[];
}

const TABLE_ID = 'connections-list';

const ALL_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'Name' },
  { id: 'groups', label: 'Pools' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'performance', label: 'Performance' },
  { id: 'bandwidth', label: 'Bandwidth' },
  { id: 'location', label: 'Location' },
  { id: 'provider', label: 'Provider' }
];

const SORTABLE_COLUMNS = ['name', 'type', 'status', 'bandwidth', 'location', 'provider'];

export function ListView({ connections, groups }: ListViewProps) {
  const navigate = useNavigate();
  const { visibleColumns, isVisible } = useColumnVisibility(TABLE_ID);
  const [sortField, setSortField] = useState<keyof Connection>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeOverflowMenu, setActiveOverflowMenu] = useState<string | null>(null);
  const [showColumnPopover, setShowColumnPopover] = useState(false);
  const columnButtonRef = useRef<HTMLButtonElement>(null);
  const removeConnection = useStore(state => state.removeConnection);

  const handleSort = (field: keyof Connection) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    removeConnection(id);
    window.addToast({
      type: 'success',
      title: 'Connection Deleted',
      message: 'Connection has been removed successfully',
      duration: 3000
    });
  };

  const sortedConnections = [...connections].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
  });

  const renderColumnHeader = (columnId: string, columnLabel: string) => {
    const isSortable = SORTABLE_COLUMNS.includes(columnId);

    if (!isSortable) {
      return <span>{columnLabel}</span>;
    }

    const isSorted = sortField === columnId;
    const buttonId = `sort-${columnId}`;

    return (
      <button
        id={buttonId}
        onClick={() => handleSort(columnId as keyof Connection)}
        className="group inline-flex items-center space-x-1 text-left"
        aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{columnLabel}</span>
        <span className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${
              isSorted && sortDirection === 'asc'
                ? 'text-gray-700'
                : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 -mt-1 ${
              isSorted && sortDirection === 'desc'
                ? 'text-gray-700'
                : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
        </span>
      </button>
    );
  };

  const renderColumnContent = (connection: Connection, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <div className="flex items-center">
            {connection.type.toLowerCase().includes('internet') ? (
              <Globe className="h-5 w-5 text-blue-500 mr-3" aria-hidden="true" />
            ) : (
              <Network className="h-5 w-5 text-blue-500 mr-3" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">{connection.name}</div>
              <div className="text-sm text-gray-500 truncate">{connection.type}</div>
            </div>
          </div>
        );
      case 'groups':
        const connectionGroups = getGroupsForConnection(groups, connection.id);
        return (
          <div className="flex flex-col space-y-1">
            {connectionGroups.length > 0 ? (
              connectionGroups.slice(0, 2).map(group => (
                <div key={group.id} className="flex items-center">
                  <GroupIcon className="h-4 w-4 text-gray-400 mr-1.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{group.name}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500">No groups</span>
            )}
            {connectionGroups.length > 2 && (
              <span className="text-xs text-gray-400">
                +{connectionGroups.length - 2} more
              </span>
            )}
          </div>
        );
      case 'type':
        return <span className="text-sm text-gray-900 truncate">{connection.type}</span>;
      case 'status':
        return (
          <span 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              connection.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
            role="status"
          >
            {connection.status}
          </span>
        );
      case 'performance':
        return connection.performance && (
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="flex items-center" title="Latency">
              <Activity className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
              <span className="text-sm text-gray-900">{connection.performance.latency}</span>
            </div>
            <div className="flex items-center" title="Packet Loss">
              <Network className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
              <span className="text-sm text-gray-900">{connection.performance.packetLoss}</span>
            </div>
          </div>
        );
      case 'bandwidth':
        return <span className="text-sm text-gray-900 truncate">{connection.bandwidth}</span>;
      case 'location':
        return <span className="text-sm text-gray-900 truncate">{connection.location}</span>;
      case 'provider':
        return <span className="text-sm text-gray-900 truncate">{connection.provider || 'N/A'}</span>;
      default:
        return null;
    }
  };

  // Filter columns based on visibility
  const displayColumns = ALL_COLUMNS.filter(col => isVisible(col.id));

  return (
    <div className="overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">
          List of network connections showing details like name, type, status, performance metrics,
          bandwidth, location, and provider. Click column headers to sort, and use row actions for management.
        </caption>
        <thead className="bg-gray-50">
          <tr>
            {displayColumns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis"
                role="columnheader"
                aria-sort={sortField === column.id ? sortDirection : 'none'}
              >
                {renderColumnHeader(column.id, column.label)}
              </th>
            ))}
            <th
              scope="col"
              className="relative px-6 py-3 w-16"
              role="columnheader"
            >
              <div className="flex justify-end">
                <button
                  ref={columnButtonRef}
                  onClick={() => setShowColumnPopover(true)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                  title="Manage Columns"
                  aria-label="Manage table columns"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{visibleColumns.length}/{ALL_COLUMNS.length} visible</span>
                </button>
                {showColumnPopover && (
                  <ColumnVisibilityPopover
                    tableId={TABLE_ID}
                    allColumns={ALL_COLUMNS}
                    onClose={() => setShowColumnPopover(false)}
                    anchorEl={columnButtonRef.current}
                  />
                )}
              </div>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedConnections.length === 0 ? (
            <tr>
              <td
                colSpan={displayColumns.length + 1}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No connections found
              </td>
            </tr>
          ) : (
            sortedConnections.map((connection, rowIndex) => (
              <tr
                key={connection.id}
                onClick={() => navigate(`/connections/${connection.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
                role="row"
                aria-rowindex={rowIndex + 1}
              >
                {displayColumns.map((column) => (
                  <td
                    key={column.id}
                    className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis"
                    role="gridcell"
                  >
                    {renderColumnContent(connection, column.id)}
                  </td>
                ))}
                <td 
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-16"
                  role="gridcell"
                >
                  <div 
                    onClick={e => e.stopPropagation()}
                    className="inline-block"
                  >
                    <ConnectionOverflowMenu
                      connection={connection}
                      onDelete={() => handleDelete(connection.id.toString())}
                      isActive={activeOverflowMenu === connection.id.toString()}
                      onOpenChange={(isOpen) => {
                        if (!showColumnPopover) {
                          setActiveOverflowMenu(isOpen ? connection.id.toString() : null);
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}