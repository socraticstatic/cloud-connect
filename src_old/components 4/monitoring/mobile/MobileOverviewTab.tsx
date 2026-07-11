import { useState } from 'react';
import { Activity, TrendingUp, ArrowUpDown, Clock, ChevronRight, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { Connection, ConnectionSummary } from '../../../types';
import { AlertList } from '../shared/AlertList';
import { MetricsSummary } from '../shared/MetricsSummary';
import { useAlerts } from '../../../hooks/useAlerts';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileOverviewTabProps {
  selectedConnection: string;
  connections: Connection[];
  metrics: ConnectionSummary;
}

export function MobileOverviewTab({ selectedConnection, connections, metrics }: MobileOverviewTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    alerts: true,
    metrics: true,
    network: false,
    billing: false
  });

  const {
    alerts,
    dismissAlert,
    getFilteredAlerts
  } = useAlerts(connections);
  
  const filteredAlerts = getFilteredAlerts(selectedConnection);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium text-gray-500">Connections</h3>
              <Activity className="h-4 w-4 text-brand-blue" />
            </div>
            <div className="text-xl font-semibold text-gray-900">{connections.length}</div>
            <div className="mt-1 text-xs text-gray-500">
              {metrics.byStatus.active} active
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium text-gray-500">Avg. Utilization</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-xl font-semibold text-gray-900">{metrics.averageUtilization.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-gray-500">
              Across all connections
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('alerts')}
        >
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-base font-medium text-gray-900">Active Alerts</h3>
          </div>
          {expandedSections.alerts ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {expandedSections.alerts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4">
                <AlertList 
                  alerts={filteredAlerts} 
                  onDismiss={dismissAlert}
                  isMobile={true} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics Overview Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('metrics')}
        >
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-base font-medium text-gray-900">Performance Summary</h3>
          </div>
          {expandedSections.metrics ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {expandedSections.metrics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 pb-4">
                <MetricsSummary metrics={metrics} isMobile={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <div className="pt-2 pb-8">
        <button
          onClick={() => {
            // Navigate to detailed view
          }}
          className="w-full flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="font-medium">View All Metrics</span>
          <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>
    </div>
  );
}

// Import missing Bell component
import { Bell } from 'lucide-react';

