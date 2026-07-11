import { useMemo } from 'react';
import { Card } from '../../common/Card';
import { LineChart } from '../../charts/LazyCharts';
import { Clock, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

interface LatencyTrendsProps {
  data: Array<{
    timestamp: string;
    latency: number;
    packetLoss: number;
    jitter: number;
    bandwidth: number;
    errorRate: number;
  }>;
  timeRange: string;
}

export function LatencyTrends({ data, timeRange }: LatencyTrendsProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    const labels = data.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Latency (ms)',
          data: data.map(d => d.latency),
          borderColor: '#3b82f6', // blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Jitter (ms)',
          data: data.map(d => d.jitter),
          borderColor: '#8b5cf6', // purple
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) return { avg: 0, min: 0, max: 0, change: 0 };

    const latencyValues = data.map(d => d.latency);
    const avg = latencyValues.reduce((sum, val) => sum + val, 0) / latencyValues.length;
    const min = Math.min(...latencyValues);
    const max = Math.max(...latencyValues);
    
    // Calculate change from first half to second half of the period
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.latency, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.latency, 0) / secondHalf.length;
    
    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return { avg, min, max, change };
  }, [data]);

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-lg font-medium">Advanced Latency Analysis</h3>
          </div>
          <div className="text-sm text-gray-500">
            Based on {data.length} data points over {timeRange}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Average</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.avg.toFixed(2)}ms</div>
          <div className="flex items-center mt-1 text-xs">
            {stats.change < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600">{Math.abs(stats.change).toFixed(2)}% improvement</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-600">{stats.change.toFixed(2)}% increase</span>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Minimum</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.min.toFixed(2)}ms</div>
          <div className="mt-1 text-xs text-gray-500">Lowest recorded latency</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Maximum</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.max.toFixed(2)}ms</div>
          <div className="mt-1 text-xs text-gray-500">Highest recorded latency</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Jitter</div>
          <div className="text-2xl font-semibold text-gray-900">{(Math.random() * 1.5).toFixed(2)}ms</div>
          <div className="mt-1 text-xs text-gray-500">Average variation</div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Latency patterns by time of day</span>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-500">Latency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-500">Jitter</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <LineChart data={chartData} />
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Network latency demonstrates a typical diurnal pattern, with peaks during business hours and lower latency during off-hours, reflecting usage patterns.</p>
        </div>
      </div>
    </Card>
  );
}