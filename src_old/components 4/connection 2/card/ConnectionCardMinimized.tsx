import { useState } from 'react';
import { Layers, ChevronRight, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButton } from '../../common/IconButton';
import { Group } from '../../../types/group';

interface ConnectionCardMinimizedProps {
  connection: any;
  groups: Group[];
  getStatusDotColor: () => string;
  getCardIcon: () => React.ReactNode;
  handleToggleStatus: (e: React.MouseEvent) => void;
  isPending: boolean;
  progress: number;
  remainingTime: number;
  navigate: (path: string) => void;
  onMaximize: () => void;
  showEffects: boolean;
}

/**
 * Minimized view of the connection card
 * Displays a compact version with essential information
 */
export function ConnectionCardMinimized({
  connection,
  groups,
  getStatusDotColor,
  getCardIcon,
  handleToggleStatus,
  isPending,
  progress,
  remainingTime,
  navigate,
  onMaximize,
  showEffects
}: ConnectionCardMinimizedProps) {
  return (
    <div className="h-full p-4 flex items-center">
      {/* Left Side: Icon and Name */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="p-2 bg-gray-50 rounded-lg shrink-0">
          {getCardIcon()}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {connection.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{connection.type}</p>
        </div>
      </div>

      {/* Right Side: Status and Actions */}
      <div className="flex items-center ml-auto space-x-4">
        {/* Status Dot and Percentage */}
        <div className="flex items-center space-x-2">
          <motion.div 
            className={`h-3 w-3 rounded-full ${getStatusDotColor()}`}
            // Add pulse effect when pending
            animate={isPending ? {
              scale: [1, 1.5, 1],
              opacity: [1, 0.6, 1],
              transition: { 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut" 
              }
            } : {}}
          />
          <span className="text-sm font-medium text-gray-700">
            {connection.performance?.bandwidthUtilization || 0}%
          </span>
        </div>

        {/* Groups Badge - always show, empty state if no groups */}
        <div className="flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
            <Layers className="h-3 w-3 mr-1" />
            {groups.length > 0 ? groups.length : '0'}
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(e);
            }}
            disabled={isPending}
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              transition-all duration-200 border
              ${isPending 
                ? 'bg-brand-lightBlue text-brand-blue border-brand-blue/20 cursor-wait' 
                : connection.status === 'Active'
                  ? 'bg-white text-complementary-green border-complementary-green/20 hover:bg-complementary-green/10'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }
            `}
            // Add pulse animation when pending
            animate={isPending ? {
              backgroundColor: ['rgba(230, 246, 253, 0.8)', 'rgba(230, 246, 253, 1)', 'rgba(230, 246, 253, 0.8)'],
              transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }
            } : {}}
          >
            {isPending ? (
              <span className="flex items-center">
                Activating...
              </span>
            ) : connection.status === 'Active' ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </motion.button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={<ChevronRight className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/connections/${connection.id}`);
            }}
            variant="ghost"
            size="sm"
            title="Manage Connection"
          />
          <IconButton
            icon={<svg xmlns="http://www.w3.org/2000/svg\" width="24\" height="24\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round\" strokeLinejoin="round\" className="h-4 w-4"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>}
            onClick={onMaximize}
            variant="ghost"
            size="sm"
            title="Expand"
          />
        </div>
      </div>
    </div>
  );
}