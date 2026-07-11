import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Search, Filter, Download, Plus, LayoutGrid, List, Minimize2, Maximize2, X, Activity, ShoppingBag, Cpu
} from 'lucide-react';
import { Group } from '../types/group';
import { Button } from './common/Button';
import { FilterButton } from './common/FilterButton';
import { useStore } from '../store/useStore';
import { AddGroupModal } from './configure/groups/AddGroupModal';
import { GroupCardView, GroupListView } from './group/views';
import { ConfirmDialog } from './common/ConfirmDialog';
import { ConnectionTabs } from './connection/ConnectionTabs';
import { ControlCenterManager } from './control-center/ControlCenterManager';

export function ManageGroupsPage() {
  const navigate = useNavigate();
  const groups = useStore(state => state.groups);
  const connections = useStore(state => state.connections);
  const removeGroup = useStore(state => state.removeGroup);
  const users = useStore(state => state.users);
  const addGroup = useStore(state => state.addGroup);
  
  const [activeTab, setActiveTab] = useState<'groups' | 'marketplace' | 'control-center'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [areAllMinimized, setAreAllMinimized] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: [] as Array<Group['type']>,
    status: [] as Array<Group['status']>
  });

  // Filter groups based on search and filters
  const filteredGroups = groups.filter(group => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchLower || 
      group.name.toLowerCase().includes(searchLower) ||
      group.description.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Type filter
    const matchesType = !filters.type.length || filters.type.includes(group.type);
    
    // Status filter
    const matchesStatus = !filters.status.length || filters.status.includes(group.status);
    
    return matchesType && matchesStatus;
  });

  const handleDeleteGroup = (id: string) => {
    removeGroup(id);
    setShowConfirmDelete(null);
    
    window.addToast({
      type: 'success',
      title: 'Pool Deleted',
      message: 'Pool has been deleted successfully',
      duration: 3000
    });
  };
  
  const handleAddGroup = async (newGroup: Omit<Group, 'id' | 'createdAt'>) => {
    // Generate ID and createdAt
    const groupToAdd = {
      ...newGroup,
      id: `group-${Date.now()}`,
      createdAt: new Date().toISOString()
    } as Group;
    
    try {
      await addGroup(groupToAdd);
      setShowAddModal(false);
      
      window.addToast({
        type: 'success',
        title: 'Pool Created',
        message: 'Pool has been created successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error creating pool:', error);
      window.addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create pool. Please try again.',
        duration: 3000
      });
    }
  };

  const exportGroups = () => {
    const csv = [
      ['Name', 'Type', 'Description', 'Status', 'Connections', 'Members'].join(','),
      ...filteredGroups.map(g => [
        g.name,
        g.type,
        g.description,
        g.status,
        g.connectionIds.length,
        g.userIds.length
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pools.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    window.addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Pools exported successfully',
      duration: 3000
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'groups':
        return (
          <>
            {/* Search and Controls */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="p-4 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search pools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'grid' 
                        ? 'text-brand-blue bg-brand-lightBlue' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'list' 
                        ? 'text-brand-blue bg-brand-lightBlue' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                    title="List View"
                  >
                    <List className="h-5 w-5" />
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
                  icon={Plus}
                  onClick={() => setShowAddModal(true)}
                >
                  Create Pool
                </Button>
                <FilterButton
                  onClick={() => setShowFilters(!showFilters)}
                />
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={exportGroups}
                >
                  Export
                </Button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Pool Type</h4>
                      <div className="space-y-2">
                        {['business', 'department', 'project', 'team', 'custom'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.type.includes(type as Group['type'])}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters({...filters, type: [...filters.type, type as Group['type']]});
                                } else {
                                  setFilters({...filters, type: filters.type.filter(t => t !== type)});
                                }
                              }}
                              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                      <div className="space-y-2">
                        {['active', 'inactive', 'suspended'].map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status as Group['status'])}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters({...filters, status: [...filters.status, status as Group['status']]});
                                } else {
                                  setFilters({...filters, status: filters.status.filter(s => s !== status)});
                                }
                              }}
                              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Advanced Filters</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Has Connections</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Has Members</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Has Addresses</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(Object.values(filters).some(arr => arr.length > 0) || searchQuery) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(filters).map(([category, values]) =>
                  values.map((value) => (
                    <span
                      key={`${category}-${value}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-lightBlue text-brand-blue"
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          [category]: prev[category as keyof typeof prev].filter(v => v !== value)
                        }))}
                        className="ml-2 hover:text-brand-darkBlue"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilters({ type: [], status: [] });
                    setSearchQuery('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pools match your search criteria</p>
                </div>
              ) : viewMode === 'list' ? (
                <GroupListView 
                  groups={filteredGroups} 
                  onDelete={(id) => setShowConfirmDelete(id)}
                  onSelect={(id) => navigate(`/groups/${id}`)} 
                />
              ) : (
                <GroupCardView 
                  groups={filteredGroups} 
                  onDelete={(id) => setShowConfirmDelete(id)}
                  isMinimized={areAllMinimized}
                />
              )}
            </div>
          </>
        );
      case 'marketplace':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pool Templates Marketplace</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Browse and select from pre-configured pool templates for different use cases and organizational structures.
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => setShowAddModal(true)}
              >
                Create Custom Pool
              </Button>
            </div>
          </div>
        );
      case 'control-center':
        return (
          <ControlCenterManager connections={connections} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Pools</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage your network pools</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          Create Pool
        </Button>
      </div>
      
      <div className="mb-8">
        <ConnectionTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
          connectionCount={connections.length}
          groupCount={groups.length}
        />
      </div>
      
      <div className="space-y-6 min-h-[calc(100vh-16rem)] pb-12">
        {renderContent()}
        
        {/* Add Pool Modal */}
        <AddGroupModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddGroup}
          users={users}
          connections={connections}
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={!!showConfirmDelete}
          onClose={() => setShowConfirmDelete(null)}
          onConfirm={() => showConfirmDelete && handleDeleteGroup(showConfirmDelete)}
          title="Delete Pool"
          message="Are you sure you want to delete this pool? This action cannot be undone and will remove all pool associations."
          confirmText="Delete"
          confirmVariant="danger"
        />
      </div>
    </div>
  );
}