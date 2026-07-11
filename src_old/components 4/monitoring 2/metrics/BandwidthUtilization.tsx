import { useMemo } from 'react';
import { Card } from '../../common/Card';
import { LineChart } from '../../charts/LazyCharts';
import { ArrowUpDown, TrendingUp, Info, Router, Zap } from 'lucide-react';

interface BandwidthUtilizationProps {
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

export function BandwidthUtilization({ data, timeRange }: BandwidthUtilizationProps) {
  // Format data for charts
  const chartData = useMemo(() => {
    const labels = data.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    // Bandwidth direction simulation - upload/download split
    const uploadData = data.map(d => d.bandwidth * 0.35); // 35% upload
    const downloadData = data.map(d => d.bandwidth * 0.65); // 65% download

    // Create datasets for upload and download
    return {
      labels,
      datasets: [
        {
          label: 'Download (Mbps)',
          data: downloadData,
          borderColor: '#10b981', // green
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Upload (Mbps)',
          data: uploadData,
          borderColor: '#6366f1', // indigo
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [data]);

  // Calculate usage statistics
  const usageStats = useMemo(() => {
    if (!data.length) return { avg: 0, peak: 0, peakTime: '', lowUsage: 0, highUsage: 0 };

    const bandwidthValues = data.map(d => d.bandwidth);
    const avg = bandwidthValues.reduce((sum, val) => sum + val, 0) / bandwidthValues.length;
    const peak = Math.max(...bandwidthValues);
    const peakIndex = bandwidthValues.indexOf(peak);
    const peakTime = new Date(data[peakIndex].timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Calculate low and high usage hours
    const lowUsageHours = data
      .map((d, i) => ({ value: d.bandwidth, index: i }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 3)
      .map(item => {
        const date = new Date(data[item.index].timestamp);
        return date.getHours();
      });
      
    const highUsageHours = data
      .map((d, i) => ({ value: d.bandwidth, index: i }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(item => {
        const date = new Date(data[item.index].timestamp);
        return date.getHours();
      });
    
    const lowUsage = Math.min(...bandwidthValues);
    const highUsage = peak;
    
    return { avg, peak, peakTime, lowUsageHours, highUsageHours, lowUsage, highUsage };
  }, [data]);

  // Calculate threshold bands
  const thresholds = {
    warning: 80, // 80% utilization - warning threshold
    critical: 90 // 90% utilization - critical threshold
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-lg font-medium">Bandwidth Utilization Analysis</h3>
          </div>
          <div className="text-sm text-gray-500">
            Based on {data.length} data points over {timeRange}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Router className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="text-base font-medium text-gray-900">Bandwidth Usage Profile</h4>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
              {timeRange} time period
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Average Usage</div>
              <div className="text-2xl font-semibold text-gray-900">{usageStats.avg.toFixed(1)}%</div>
              <div className="mt-1 text-xs text-gray-500">of contracted bandwidth</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Peak Usage</div>
              <div className="text-2xl font-semibold text-gray-900">{usageStats.peak.toFixed(1)}%</div>
              <div className="mt-1 text-xs text-gray-500">at {usageStats.peakTime}</div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-700">Utilization Insights</h4>
                <p className="mt-1 text-xs text-blue-600">
                  Bandwidth utilization shows typical business hour peaks, with the highest usage at {usageStats.peakTime}.
                  Consider load balancing during peak hours ({usageStats.highUsageHours.join(':00, ')}:00) or scheduling large data transfers during low usage hours ({usageStats.lowUsageHours.join(':00, ')}:00).
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Cost Efficiency</h4>
            
            <div className="flex items-center">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                usageStats.avg < 20 ? 'bg-red-100 text-red-800' :
                usageStats.avg < 40 ? 'bg-yellow-100 text-yellow-800' :
                usageStats.avg < 70 ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {usageStats.avg < 20 ? 'Underutilized' :
                usageStats.avg < 40 ? 'Moderately Used' :
                usageStats.avg < 70 ? 'Optimally Used' :
                'Heavily Used'}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Current Bandwidth</span>
                <span className="font-medium text-gray-900">1 Gbps</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full">
                <div className="h-2.5 rounded-full bg-brand-blue" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Peak Usage</span>
                <span className="font-medium text-gray-900">{(10 * usageStats.peak / 100).toFixed(1)} Gbps</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full">
                <div 
                  className={`h-2.5 rounded-full ${
                    usageStats.peak > thresholds.critical ? 'bg-red-500' :
                    usageStats.peak > thresholds.warning ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} 
                  style={{ width: `${usageStats.peak}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Average Usage</span>
                <span className="font-medium text-gray-900">{(10 * usageStats.avg / 100).toFixed(1)} Gbps</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full">
                <div 
                  className={`h-2.5 rounded-full ${
                    usageStats.avg > thresholds.critical ? 'bg-red-500' :
                    usageStats.avg > thresholds.warning ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} 
                  style={{ width: `${usageStats.avg}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-2">
              <Zap className="h-4 w-4 text-brand-blue mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Billing Efficiency</h4>
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              {usageStats.avg < 40 ? 
                'Your bandwidth usage is lower than optimal. Consider downgrading to save costs.' :
                usageStats.avg > 80 ?
                'You are approaching your bandwidth limit. Consider upgrading to avoid performance issues.' :
                'Your bandwidth usage is in the optimal range for this connection size.'}
            </p>
            
            <div className="text-xs text-gray-500">
              {usageStats.avg < 40 ? (
                <span className="text-green-600">Potential monthly savings: $250 with a lower tier</span>
              ) : usageStats.avg > 80 ? (
                <span className="text-amber-600">Risk of over-limit charges if peak usage continues</span>
              ) : (
                <span className="text-brand-blue">Current plan provides optimal cost efficiency</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">Bandwidth Usage Trend</h4>
          <p className="text-sm text-gray-500">
            This chart shows your download and upload bandwidth usage over time. The colored areas represent data flowing in each direction.
          </p>
        </div>
        
        <div className="h-80">
          <LineChart data={chartData} />
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <TrendingUp className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Bandwidth Observation</p>
              <p>
                Your average download/upload ratio is approximately 65/35, which is typical for enterprise networks. 
                The peak utilization periods align closely with business hours, suggesting regular usage patterns.
                {usageStats.peak > thresholds.warning && 
                  ' Consider implementing traffic shaping or examining bandwidth-intensive applications during peak periods.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}