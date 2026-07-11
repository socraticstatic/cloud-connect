import { ChevronRight } from 'lucide-react';

interface GroupCardFooterProps {
  onManageClick: (e: React.MouseEvent) => void;
}

export function GroupCardFooter({ onManageClick }: GroupCardFooterProps) {
  return (
    <div className="p-4 border-t border-gray-100">
      <button
        onClick={onManageClick}
        className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Manage Pool
        <ChevronRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
}
