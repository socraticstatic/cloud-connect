import { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Group } from '../../../types/group';

interface AddToPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poolIds: string[]) => void;
  currentPoolIds?: string[];
  availablePools: Group[];
  connectionName: string;
}

export function AddToPoolModal({
  isOpen,
  onClose,
  onSave,
  currentPoolIds = [],
  availablePools,
  connectionName
}: AddToPoolModalProps) {
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>(currentPoolIds);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPools = availablePools.filter(pool =>
    pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePool = (poolId: string) => {
    if (selectedPoolIds.includes(poolId)) {
      setSelectedPoolIds(selectedPoolIds.filter(id => id !== poolId));
    } else {
      setSelectedPoolIds([...selectedPoolIds, poolId]);
    }
  };

  const handleSave = () => {
    onSave(selectedPoolIds);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPoolIds(currentPoolIds);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Assign to Pools">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Assign <span className="font-medium text-gray-900">{connectionName}</span> to one or more pools
          </p>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>

        {/* Pool List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
          {filteredPools.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No pools found</p>
            </div>
          ) : (
            filteredPools.map(pool => {
              const isSelected = selectedPoolIds.includes(pool.id);
              const isCurrentlyAssigned = currentPoolIds.includes(pool.id);

              return (
                <label
                  key={pool.id}
                  className={`flex items-center p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTogglePool(pool.id)}
                    className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pool.name}</p>
                        <p className="text-xs text-gray-500">{pool.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pool.type === 'business' ? 'bg-blue-100 text-blue-800' :
                          pool.type === 'department' ? 'bg-purple-100 text-purple-800' :
                          pool.type === 'project' ? 'bg-green-100 text-green-800' :
                          pool.type === 'team' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pool.type}
                        </span>
                        {isCurrentlyAssigned && (
                          <span className="text-xs text-green-600 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{pool.connectionIds.length} connections</span>
                      <span>{pool.userIds.length} members</span>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{selectedPoolIds.length}</span> pool{selectedPoolIds.length !== 1 ? 's' : ''} selected
            {selectedPoolIds.length !== currentPoolIds.length && (
              <span className="text-amber-600 ml-2">
                ({Math.abs(selectedPoolIds.length - currentPoolIds.length)} change{Math.abs(selectedPoolIds.length - currentPoolIds.length) !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={selectedPoolIds.length === 0}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
