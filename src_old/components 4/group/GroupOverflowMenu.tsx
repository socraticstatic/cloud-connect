import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../types/group';

interface GroupOverflowMenuProps {
  group: Group;
  onDelete?: (id: string) => void;
}

export function GroupOverflowMenu({ group, onDelete }: GroupOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/groups/${group.id}`);
    setIsOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/groups/${group.id}`);
    setIsOpen(false);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/groups/${group.id}?tab=members`);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(group.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleView}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Pool
          </button>
          <button
            onClick={handleManageMembers}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Members
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Pool
          </button>
        </div>
      )}
    </div>
  );
}
