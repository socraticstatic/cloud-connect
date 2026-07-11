import { useMemo } from 'react';
import { Card } from '../../common/Card';
import { LineChart } from '../charts/LineChart';
import { Signal, AlertTriangle, Info, Wifi } from 'lucide-react';

interface PacketLossAnalysisProps {
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

export function PacketLossAnalysis({ data, timeRange }: PacketLossAnalysisProps) {
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
          label: 'Packet Loss (%)',
          data: data.map(d => d.packetLoss * 100), // Convert to percentage
          borderColor: '#f59e0b', // amber
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.length) return { avg: 0, max: 0, spikes: 0, critical: 0 };

    const packetLossValues = data.map(d => d.packetLoss * 100); // Convert to percentage
    const avg = packetLossValues.reduce((sum, val) => sum + val, 0) / packetLossValues.length;
    const max = Math.max(...packetLossValues);
    
    // Count number of spikes (values over 0.1%)
    const spikes = packetLossValues.filter(val => val > 0.1).length;
    
    // Count critical incidents (values over 1%)
    const critical = packetLossValues.filter(val => val > 1).length;
    
    return { avg, max, spikes, critical };
  }, [data]);

  // Network quality rating
  const getNetworkQualityRating = () => {
    if (stats.avg < 0.01) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (stats.avg < 0.05) return { label: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (stats.avg < 0.1) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (stats.avg < 0.5) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const networkQuality = getNetworkQualityRating();

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Signal className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium">Packet Loss Analysis</h3>
          </div>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${networkQuality.bgColor} ${networkQuality.color}`}>
              {networkQuality.label}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="text-base font-medium text-gray-900">Network Quality Indicators</h4>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Average Loss</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.avg.toFixed(4)}%</div>
              <div className="mt-1 text-xs text-gray-600">
                {stats.avg < 0.01 ? 'Excellent quality' : 
                 stats.avg < 0.1 ? 'Good quality' : 
                 stats.avg < 0.5 ? 'Acceptable quality' : 
                 'Poor quality'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Maximum Loss</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.max.toFixed(4)}%</div>
              <div className="mt-1 text-xs text-gray-600">
                Maximum recorded packet loss
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Loss Events</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.spikes}</div>
              <div className="mt-1 text-xs text-gray-600">
                Events with &gt;0.1% packet loss
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Critical Events</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.critical}</div>
              <div className="mt-1 text-xs text-gray-600">
                Events with &gt;1% packet loss
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Quality Assessment</h4>
          </div>
          
          {stats.avg < 0.1 ? (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                    <Info className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-green-800">Healthy Connection</h5>
                  <p className="mt-1 text-sm text-green-700">
                    Your packet loss metrics indicate a healthy, stable connection. Current levels are well within acceptable ranges for voice, video, and data applications.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-yellow-800">Moderate Packet Loss Detected</h5>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your connection is experiencing some packet loss. While not critical, this may affect real-time applications like voice and video calls. Consider investigating network congestion or interference issues.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Application Impact</h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Voice Calls</span>
                  <span className="font-medium text-gray-900">{stats.avg < 0.5 ? 'Excellent' : stats.avg < 1 ? 'Good' : 'Poor'}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      stats.avg < 0.5 ? 'bg-green-500' : stats.avg < 1 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${100 - stats.avg * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Video Conferencing</span>
                  <span className="font-medium text-gray-900">{stats.avg < 0.3 ? 'Excellent' : stats.avg < 0.8 ? 'Good' : 'Poor'}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      stats.avg < 0.3 ? 'bg-green-500' : stats.avg < 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${100 - stats.avg * 120}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cloud Applications</span>
                  <span className="font-medium text-gray-900">{stats.avg < 1 ? 'Excellent' : stats.avg < 2 ? 'Good' : 'Poor'}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${
                      stats.avg < 1 ? 'bg-green-500' : stats.avg < 2 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${100 - stats.avg * 50}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-2">Packet Loss Trend</h4>
          <p className="text-sm text-gray-500">
            This chart shows your packet loss percentage over time. Lower values indicate better network quality and reliability.
          </p>
        </div>
        
        <div className="h-80">
          <LineChart data={chartData} />
        </div>
      </div>
    </Card>
  );
}

