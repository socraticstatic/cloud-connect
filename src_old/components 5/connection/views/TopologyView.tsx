import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connection } from '../../../types';
import { Group } from '../../../types/group';
import { ConnectionVisualization } from '../ConnectionVisualization';
import { ConnectionOverflowMenu } from '../ConnectionOverflowMenu';
import { useStore } from '../../../store/useStore';
import { getGroupsForConnection } from '../../../utils/groups';
import { Group as GroupIcon, ChevronRight } from 'lucide-react';

interface TopologyViewProps {
  connections: Connection[];
  groups: Group[];
}

export function TopologyView({ connections, groups }: TopologyViewProps) {
  const navigate = useNavigate();
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const removeConnection = useStore(state => state.removeConnection);

  const handleDelete = (id: string) => {
    removeConnection(id);
    window.addToast({
      type: 'success',
      title: 'Connection Deleted',
      message: 'Connection has been removed successfully',
      duration: 3000
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {connections.map((connection) => {
        // Get groups for this connection
        const connectionGroups = getGroupsForConnection(groups, connection.id);
        
        return (
          <div
            key={connection.id}
            className={`
              bg-white rounded-xl border border-gray-200 overflow-visible
              transition-all duration-300 ease-in-out
              ${hoveredConnection === connection.id.toString() 
                ? 'shadow-lg ring-2 ring-[#009fdb] ring-opacity-50 transform scale-[1.02]' 
                : 'hover:shadow-md'
              }
            `}
            onMouseEnter={() => setHoveredConnection(connection.id.toString())}
            onMouseLeave={() => setHoveredConnection(null)}
            onClick={() => navigate(`/connections/${connection.id}`)}
          >
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{connection.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{connection.type}</p>
                  
                  {/* Show group badges */}
                  {connectionGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connectionGroups.slice(0, 2).map(group => (
                        <span key={group.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          <GroupIcon className="h-3 w-3 mr-1.5" />
                          {group.name}
                        </span>
                      ))}
                      {connectionGroups.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          +{connectionGroups.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ConnectionOverflowMenu
                    connection={connection}
                    onDelete={() => handleDelete(connection.id.toString())}
                  />
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    connection.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">{connection.status}</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    connection.performance?.latency ? 
                      parseFloat(connection.performance.latency) < 10 ? 'bg-green-500' :
                      parseFloat(connection.performance.latency) < 20 ? 'bg-yellow-500' :
                      'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {connection.performance?.latency || 'No Data'}
                  </span>
                </div>
              </div>

              {/* Topology Visualization */}
              <div className="h-[400px] rounded-xl overflow-hidden mb-6 border border-gray-200 shadow-sm">
                <ConnectionVisualization connection={connection} standalone />
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Bandwidth</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{connection.bandwidth}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Location</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{connection.location}</p>
                </div>
              </div>
            </div>
            
            {/* Action Footer - Similar to ConnectionCardAction */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(connection.id.toString());
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Manage Connection
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}