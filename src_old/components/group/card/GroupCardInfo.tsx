import { Building, Calendar, Tag } from 'lucide-react';
import { Group } from '../../../types/group';

interface GroupCardInfoProps {
  group: Group;
}

export function GroupCardInfo({ group }: GroupCardInfoProps) {
  return (
    <div className="space-y-3">
      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        {group.addresses?.length > 0 && (
          <div className="flex items-start">
            <Building className="h-3.5 w-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-gray-600">Location:</p>
              <p className="text-gray-500 truncate max-w-[120px]">
                {group.addresses[0].city}, {group.addresses[0].state}
              </p>
            </div>
          </div>
        )}
        
        {group.createdAt && (
          <div className="flex items-start">
            <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-gray-600">Created:</p>
              <p className="text-gray-500">
                {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {group.tags && Object.keys(group.tags).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(group.tags).slice(0, 3).map(([key, value]) => (
            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
              <Tag className="h-3 w-3 mr-1" />
              {key}: {value}
            </span>
          ))}
          {Object.keys(group.tags).length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
              +{Object.keys(group.tags).length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}