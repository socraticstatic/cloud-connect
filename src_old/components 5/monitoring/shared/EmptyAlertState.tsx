import { AlertCircle } from 'lucide-react';

interface EmptyAlertStateProps {
  message?: string;
  isMobile?: boolean;
}

export function EmptyAlertState({ 
  message = 'No active alerts for the selected connection',
  isMobile = false
}: EmptyAlertStateProps) {
  if (isMobile) {
    return (
      <div className="py-6 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-center text-gray-500">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}