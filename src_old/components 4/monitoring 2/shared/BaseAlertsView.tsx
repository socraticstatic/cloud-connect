import { ReactNode, useState, useEffect, useRef } from 'react';
import { Bell, Activity, Shield, Clock, Search, X, RefreshCw, Download, Filter } from 'lucide-react';
import { useAlerts } from '../../../hooks/useAlerts';
import { Connection } from '../../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../common/Button';

interface BaseAlertsViewProps {
  connections: Connection[];
  selectedConnection: string;
  children: (props: {
    filteredAlerts: (connectionId?: string) => Array<any>;
    dismissAlert: ReturnType<typeof useAlerts>['dismissAlert'];
    activeFilters: ReturnType<typeof useAlerts>['activeFilters'];
  }) => ReactNode;
  isMobile?: boolean;
}

export function BaseAlertsView({ 
  connections, 
  selectedConnection, 
  children,
  isMobile = false
}: BaseAlertsViewProps) {
  const {
    alerts,
    activeFilters,
    updateFilters,
    resetFilters,
    dismissAlert,
    getFilteredAlerts
  } = useAlerts(connections);
  
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  
  // Get filtered alerts function to pass to children
  const filteredAlerts = getFilteredAlerts;
  
  // Clean up any timers on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    // Simulate data refresh - in real app this would fetch from backend
    refreshTimerRef.current = window.setTimeout(() => {
      setIsRefreshing(false);
      refreshTimerRef.current = null;
      
      window.addToast({
        type: 'success',
        title: 'Alerts Refreshed',
        message: 'Alert data has been updated',
        duration: 2000
      });
    }, 1000);
  };

  if (isMobile) {
    // Mobile version
    return (
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Filter Alerts</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Alert Filters</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Types
                  </label>
                  <div className="space-y-2">
                    {['critical', 'warning', 'info'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const types = activeFilters.types.includes(type as any)
                            ? activeFilters.types.filter(t => t !== type)
                            : [...activeFilters.types, type as any];
                          updateFilters({ types });
                        }}
                        className={`
                          block w-full text-left px-3 py-2 rounded-md text-sm
                          ${activeFilters.types.includes(type as any)
                            ? type === 'critical'
                              ? 'bg-red-50 text-red-700'
                              : type === 'warning'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-brand-lightBlue text-brand-blue'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-darkBlue"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {(activeFilters.types.length > 0 || activeFilters.search) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.types.map((type) => (
              <span
                key={type}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  type === 'critical'
                    ? 'bg-red-50 text-red-700'
                    : type === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-brand-lightBlue text-brand-blue'
                }`}
              >
                {type}
                <button
                  onClick={() => {
                    updateFilters({
                      types: activeFilters.types.filter(t => t !== type)
                    });
                  }}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {activeFilters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                "{activeFilters.search}"
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Render children with necessary props */}
        {children({
          filteredAlerts,
          dismissAlert,
          activeFilters
        })}
      </div>
    );
  }
  
  // Desktop version
  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={activeFilters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Search alerts..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {['critical', 'warning', 'info'].map((type) => (
                <Button
                  key={type}
                  variant={activeFilters.types.includes(type as any) ? 'primary' : 'outline'}
                  size="sm"
                  className={
                    activeFilters.types.includes(type as any)
                      ? type === 'critical'
                        ? 'bg-red-600'
                        : type === 'warning'
                          ? 'bg-amber-500'
                          : undefined
                      : undefined
                  }
                  onClick={() => {
                    const types = activeFilters.types.includes(type as any)
                      ? activeFilters.types.filter(t => t !== type)
                      : [...activeFilters.types, type as any];
                    updateFilters({ types });
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                window.addToast({
                  type: 'success',
                  title: 'Alerts Exported',
                  message: 'Alert data has been exported successfully',
                  duration: 3000
                });
              }}
            >
              Export
            </Button>
            
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isRefreshing ? 'cursor-not-allowed' : ''}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {/* Active Filters */}
        {(activeFilters.types.length > 0 || activeFilters.search) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.types.map((type) => (
              <span
                key={type}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  type === 'critical'
                    ? 'bg-red-50 text-red-700'
                    : type === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-brand-lightBlue text-brand-blue'
                }`}
              >
                {type}
                <button
                  onClick={() => {
                    updateFilters({
                      types: activeFilters.types.filter(t => t !== type)
                    });
                  }}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {activeFilters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                "{activeFilters.search}"
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Render children with necessary props */}
      {children({
        filteredAlerts,
        dismissAlert,
        activeFilters
      })}
    </div>
  );
}