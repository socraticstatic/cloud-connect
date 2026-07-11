import { Edit2, Trash2, Download } from 'lucide-react';
import { Group } from '../../types/group';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

interface GroupDetailHeaderProps {
  group: Group;
  onDeleteClick: () => void;
}

export function GroupDetailHeader({ group, onDeleteClick }: GroupDetailHeaderProps) {
  // Get group type color
  const getGroupTypeColor = () => {
    switch (group.type) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'department':
        return 'bg-purple-100 text-purple-800';
      case 'project':
        return 'bg-green-100 text-green-800';
      case 'team':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHeaderGradient = () => {
    switch (group.type) {
      case 'business':
        return 'from-blue-500 to-blue-600';
      case 'department':
        return 'from-purple-500 to-purple-600';
      case 'project':
        return 'from-green-500 to-green-600';
      case 'team':
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
      <div className={`h-3 bg-gradient-to-r ${getHeaderGradient()}`}></div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getGroupTypeColor()}`}>
                {group.type}
              </span>
              <StatusBadge status={group.status} size="md" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>
            <p className="text-gray-600">{group.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-3">
              {group.tags && Object.entries(group.tags).map(([key, value]) => (
                <div key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  <span className="font-medium">{key}:</span>
                  <span className="ml-1">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => {}}
            >
              Edit Pool
            </Button>

            <Button
              variant="outline"
              icon={Trash2}
              onClick={onDeleteClick}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
            
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                window.addToast({
                  type: 'success',
                  title: 'Export Complete',
                  message: 'Pool details exported successfully',
                  duration: 3000
                });
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}