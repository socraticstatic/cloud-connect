import { motion } from 'framer-motion';

interface ConnectionCardProgressProps {
  performance?: {
    bandwidthUtilization: number;
  };
  bandwidth: string;
}

/**
 * Progress bar component for the connection card
 * Displays bandwidth utilization
 */
export function ConnectionCardProgress({
  performance,
  bandwidth
}: ConnectionCardProgressProps) {
  const bandwidthUtil = performance?.bandwidthUtilization || 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Bandwidth Utilization</span>
        <span className="font-medium text-gray-900">{bandwidthUtil}%</span>
      </div>
      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            bandwidthUtil > 90 ? 'bg-red-500' :
            bandwidthUtil > 80 ? 'bg-complementary-amber' :
            bandwidthUtil > 60 ? 'bg-brand-blue' :
            'bg-complementary-green'
          }`}
          style={{ width: `${bandwidthUtil}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>{bandwidth}</span>
      </div>
    </div>
  );
}