import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectionCardActionProps {
  connectionId: string;
}

/**
 * Action component for the connection card
 * Provides a button to navigate to the connection details
 */
export function ConnectionCardAction({
  connectionId
}: ConnectionCardActionProps) {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 border-t border-gray-100">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/connections/${connectionId}`);
        }}
        className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Manage Connection
        <ChevronRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
}