import { Clock } from 'lucide-react';
import { Button } from '../../common/Button';
import { useMonitoring } from '../context/MonitoringContext';

interface RefreshControlsProps {
  className?: string;
}

export function RefreshControls({ className = '' }: RefreshControlsProps) {
  const { 
    refreshInterval,
    setRefreshInterval,
    isRefreshing,
    handleRefresh,
    lastRefreshed
  } = useMonitoring();
  
  const refreshIntervals = [
    { value: 0, label: 'Off' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' }
  ];

  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-sm text-gray-700 mr-2">Auto-refresh:</span>
      <select
        value={refreshInterval}
        onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
        className="form-control mr-4"
      >
        {refreshIntervals.map(interval => (
          <option key={interval.value} value={interval.value}>
            {interval.label}
          </option>
        ))}
      </select>
      
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-label="Refresh"
        title="Refresh Now"
        className="flex items-center"
      >
        <Clock className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
      </Button>
      
      {lastRefreshed && (
        <span className="ml-4 text-xs text-gray-500">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}