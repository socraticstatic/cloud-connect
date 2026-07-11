import { useMemo } from 'react';
import { BarChart2, Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '../../common/Card';
import { BarChart } from '../../charts/LazyCharts';

interface PerformanceDistributionProps {
  data: Array<{
    timestamp: string;
    latency: number;
    packetLoss: number;
    jitter: number;
    bandwidth: number;
    errorRate: number;
  }>;
}

export function PerformanceDistribution({ data }: PerformanceDistributionProps) {
  // Calculate performance distribution
  const distributionData = useMemo(() => {
    // Latency distribution buckets
    const latencyRanges = [
      { range: '< 3ms', count: 0 },
      { range: '3-5ms', count: 0 },
      { range: '5-7ms', count: 0 },
      { range: '7-10ms', count: 0 },
      { range: '> 10ms', count: 0 }
    ];

    // Count entries in each bucket
    data.forEach(entry => {
      if (entry.latency < 3) {
        latencyRanges[0].count++;
      } else if (entry.latency < 5) {
        latencyRanges[1].count++;
      } else if (entry.latency < 7) {
        latencyRanges[2].count++;
      } else if (entry.latency < 10) {
        latencyRanges[3].count++;
      } else {
        latencyRanges[4].count++;
      }
    });

    return {
      labels: latencyRanges.map(bucket => bucket.range),
      datasets: [
        {
          label: 'Latency Distribution',
          data: latencyRanges.map(bucket => bucket.count),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',  // Green (good)
            'rgba(59, 130, 246, 0.8)', // Blue (okay)
            'rgba(250, 204, 21, 0.8)', // Yellow (warning)
            'rgba(249, 115, 22, 0.8)', // Orange (concern)
            'rgba(239, 68, 68, 0.8)'   // Red (critical)
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(250, 204, 21, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data.length) return { latencyAvg: 0, latencyDelta: 0, packetLossAvg: 0, packetLossDelta: 0 };

    // Calculate metrics for current period (last 12 hours)
    const currentData = data.slice(-12);
    const previousData = data.slice(-24, -12);

    // Average calculations
    const latencyAvg = currentData.reduce((acc, item) => acc + item.latency, 0) / currentData.length;
    const prevLatencyAvg = previousData.length ? 
      previousData.reduce((acc, item) => acc + item.latency, 0) / previousData.length : latencyAvg;
    
    const packetLossAvg = currentData.reduce((acc, item) => acc + item.packetLoss, 0) / currentData.length;
    const prevPacketLossAvg = previousData.length ? 
      previousData.reduce((acc, item) => acc + item.packetLoss, 0) / previousData.length : packetLossAvg;
    
    // Calculate deltas (percentage change)
    const latencyDelta = prevLatencyAvg ? ((latencyAvg - prevLatencyAvg) / prevLatencyAvg) * 100 : 0;
    const packetLossDelta = prevPacketLossAvg ? ((packetLossAvg - prevPacketLossAvg) / prevPacketLossAvg) * 100 : 0;

    return { 
      latencyAvg, 
      latencyDelta, 
      packetLossAvg, 
      packetLossDelta 
    };
  }, [data]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 8,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            return `Count: ${context.raw} measurement${context.raw !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: true,
          color: 'rgba(107, 114, 128, 0.1)'
        }
      },
      y: {
        grid: {
          display: true,
          drawBorder: true,
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          precision: 0
        }
      }
    }
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + '%';
  };

  return (
    <Card className="overflow-hidden h-80">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 text-brand-blue mr-2" />
            <h3 className="text-lg font-medium">Latency Distribution</h3>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm font-medium">{summaryMetrics.latencyAvg.toFixed(2)}ms</span>
                </div>
                <div className="flex items-center text-xs">
                  {summaryMetrics.latencyDelta < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-600">{formatPercentage(Math.abs(summaryMetrics.latencyDelta))}</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-600">{formatPercentage(summaryMetrics.latencyDelta)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 h-[300px]">
        <BarChart data={distributionData} options={options} />
      </div>
    </Card>
  );
}