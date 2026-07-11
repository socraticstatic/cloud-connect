import { Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConnectionCardStatusProps {
  status: string;
  bandwidthUtilization: number;
  isPending: boolean;
  progress: number;
  remainingTime: number;
  handleToggleStatus: (e: React.MouseEvent) => void;
  healthStatus: {
    label: string;
    color: string;
  };
  showEffects: boolean;
}

/**
 * Status component for the connection card
 * Displays the connection status, health, and toggle button
 */
export function ConnectionCardStatus({
  status,
  bandwidthUtilization,
  isPending,
  progress,
  remainingTime,
  handleToggleStatus,
  healthStatus,
  showEffects
}: ConnectionCardStatusProps) {
  return (
    <div className="p-4 border-t border-fw-secondary">
      <div className="flex items-center justify-between mt-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(e);
          }}
          disabled={isPending}
          className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200 border
            ${isPending
              ? 'bg-fw-blue-light text-fw-link border-fw-active/20 cursor-wait'
              : status === 'Active'
                ? 'bg-fw-base text-fw-success border-fw-success/20 hover:bg-green-50'
                : 'bg-fw-base text-fw-body border-fw-secondary hover:bg-fw-wash'
            }
          `}
          // Add animation for the pending state
          animate={isPending ? {
            backgroundColor: ['rgba(230, 246, 253, 0.6)', 'rgba(230, 246, 253, 1)', 'rgba(230, 246, 253, 0.6)'],
            borderColor: ['rgba(0, 159, 219, 0.1)', 'rgba(0, 159, 219, 0.3)', 'rgba(0, 159, 219, 0.1)'],
            transition: {
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut"
            }
          } : {}}
        >
          {isPending ? (
            <span className="flex items-center">
              <span>Activating...</span>
            </span>
          ) : status === 'Active' ? (
            <>
              <Pause className="h-3.5 w-3.5 mr-1.5" />
              Active
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Inactive
            </>
          )}
        </motion.button>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${healthStatus.color}`}>
          {healthStatus.label}
        </span>
      </div>
    </div>
  );
}