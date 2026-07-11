import { useState, useMemo } from 'react';
import { GridView } from './connection/views/GridView';
import { ListView } from './connection/views/ListView';
import { TopologyView } from './connection/views/TopologyView';
import { MobileConnectionGrid } from './connection/MobileConnectionGrid';
import { Search, Filter, LayoutGrid, List, Network, Download, Minimize2, Maximize2, Group as GroupIcon, X } from 'lucide-react';
import { Connection, ViewMode } from '../types';
import { Button } from './common/Button';
import { useStore } from '../store/useStore';
import { getGroupsForConnection } from '../utils/groups';
import { useIsMobile } from '../hooks/useMobileDetection';

interface ConnectionGridProps {
  connections: Connection[];
}

export function ConnectionGrid({ connections }: ConnectionGridProps) {
  const groups = useStore(state => state.groups);
  const isMobile = useIsMobile();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [areAllMinimized, setAreAllMinimized] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    location: [] as string[],
    groups: [] as string[]
  });

  const filteredConnections = useMemo(() => {
    if (!Array.isArray(connections)) {
      console.error('connections is not an array:', connections);
      return [];
    }
    
    return connections.filter(connection => {
      // Make sure connection is a valid object
      if (!connection || typeof connection !== 'object') {
        console.error('Invalid connection object:', connection);
        return false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchLower || 
        Object.values(connection)
          .filter(val => typeof val === 'string')
          .some(val => val.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Get groups for this connection
      const connectionGroups = getGroupsForConnection(groups, connection.id);
      const connectionGroupIds = connectionGroups.map(g => g.id);

      return ['status', 'type', 'location'].every(key => {
        const filterValues = filters[key as keyof typeof filters];
        return filterValues.length === 0 || 
          filterValues.includes(connection[key as keyof Connection] as string);
      }) && (
        // Group filter
        filters.groups.length === 0 || 
        filters.groups.some(groupId => connectionGroupIds.includes(groupId))
      );
    });
  }, [connections, searchQuery, filters, groups]);

  // Log information about the filtered connections for debugging
  console.log('ConnectionGrid: filtered connections', {
    total: connections.length,
    filtered: filteredConnections.length,
    searchQuery,
    filters
  });

  // Use mobile view if on mobile device
  if (isMobile) {
    return <MobileConnectionGrid connections={connections} />;
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-16rem)] pb-12">
      <div className="bg-fw-base rounded-lg border border-fw-secondary">
        <div className="p-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-fw-secondary rounded-full focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            />
          </div>
          <div className="flex items-center bg-fw-base rounded-lg border border-fw-secondary p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-colors ${
                viewMode === 'grid'
                  ? 'text-fw-link bg-fw-accent'
                  : 'text-fw-disabled hover:text-fw-bodyLight'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-colors ${
                viewMode === 'list'
                  ? 'text-fw-link bg-fw-accent'
                  : 'text-fw-disabled hover:text-fw-bodyLight'
              }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('topology')}
              className={`p-2 rounded-full transition-colors ${
                viewMode === 'topology'
                  ? 'text-fw-link bg-fw-accent'
                  : 'text-fw-disabled hover:text-fw-bodyLight'
              }`}
              title="Topology View"
            >
              <Network className="h-5 w-5" />
            </button>
          </div>
          {viewMode === 'grid' && (
            <Button 
              variant="outline"
              icon={areAllMinimized ? Maximize2 : Minimize2}
              onClick={() => setAreAllMinimized(!areAllMinimized)}
              size="md"
            >
              {areAllMinimized ? 'Expand All' : 'Minimize All'}
            </Button>
          )}
          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(true)}
            size="md"
          >
            Filters
          </Button>
          <Button
            variant="outline"
            icon={Download}
            onClick={() => {
              const csv = [
                ['Name', 'Type', 'Status', 'Bandwidth', 'Location'].join(','),
                ...filteredConnections.map(c =>
                  [c.name, c.type, c.status, c.bandwidth, c.location].join(',')
                )
              ].join('\n');

              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'connections.csv';
              link.click();
              URL.revokeObjectURL(url);

              window.addToast({
                type: 'success',
                title: 'Export Complete',
                message: 'Connections exported successfully',
                duration: 3000
              });
            }}
            size="md"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters dialog */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            {/* Overlay */}
            <div className="fixed inset-0 bg-[rgb(0_0_0_/_75%)] transition-opacity" onClick={() => setShowFilters(false)}></div>

            {/* Modal */}
            <div className="relative bg-fw-base rounded-lg max-w-3xl w-full mx-auto shadow-xl z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-fw-heading">Filter Connections</h2>
                <button onClick={() => setShowFilters(false)} className="text-fw-disabled hover:text-fw-bodyLight">
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-fw-heading mb-2">Status</h3>
                  <div className="space-y-2">
                    {['Active', 'Inactive'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, status: [...filters.status, status]});
                            } else {
                              setFilters({...filters, status: filters.status.filter(t => t !== status)});
                            }
                          }}
                          className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-fw-body">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-fw-heading mb-2">Connection Type</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.from(new Set(connections.map(c => c.type))).map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, type: [...filters.type, type]});
                            } else {
                              setFilters({...filters, type: filters.type.filter(t => t !== type)});
                            }
                          }}
                          className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-fw-body">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-fw-heading mb-2">Location</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(connections.map(c => c.location))).map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.location.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, location: [...filters.location, location]});
                            } else {
                              setFilters({...filters, location: filters.location.filter(l => l !== location)});
                            }
                          }}
                          className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-fw-body">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-fw-heading mb-2 flex items-center">
                    <GroupIcon className="h-4 w-4 mr-1.5" />
                    Groups
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {groups.map((group) => (
                      <label key={group.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.groups.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, groups: [...filters.groups, group.id]});
                            } else {
                              setFilters({...filters, groups: filters.groups.filter(g => g !== group.id)});
                            }
                          }}
                          className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-fw-body">{group.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      status: [],
                      type: [],
                      location: [],
                      groups: []
                    });
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(Object.values(filters).some(arr => arr.length > 0) || searchQuery) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([category, values]) =>
            values.map((value) => {
              let displayValue = value;
              if (category === 'groups') {
                const group = groups.find(g => g.id === value);
                if (group) displayValue = group.name;
              }
              
              return (
                <span
                  key={`${category}-${value}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-fw-accent text-fw-link"
                >
                  {category === 'groups' ? (
                    <>
                      <GroupIcon className="h-3 w-3 mr-1.5" />
                      {displayValue}
                    </>
                  ) : (
                    displayValue
                  )}
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      [category]: prev[category as keyof typeof prev].filter(v => v !== value)
                    }))}
                    className="ml-2 hover:text-fw-linkHover"
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-fw-wash text-fw-body">
              "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 hover:text-fw-heading"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setFilters({ status: [], type: [], location: [], groups: [] });
              setSearchQuery('');
            }}
            className="text-sm text-fw-disabled hover:text-fw-body"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
        {filteredConnections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-fw-disabled">No connections match your search criteria</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <ListView
              connections={filteredConnections}
              groups={groups}
            />
          </div>
        ) : viewMode === 'topology' ? (
          <TopologyView
            connections={filteredConnections}
            groups={groups}
          />
        ) : (
          <GridView
            connections={filteredConnections}
            groups={groups}
            isMinimized={areAllMinimized}
          />
        )}
      </div>
    </div>
  );
}