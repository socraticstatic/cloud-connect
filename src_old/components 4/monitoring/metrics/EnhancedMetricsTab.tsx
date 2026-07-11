import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Activity, Zap, Network, TrendingUp, AlertTriangle, Clock, Database, Cpu } from 'lucide-react';
import { RealTimeMetricCard } from './RealTimeMetricCard';
import { RealTimeChart } from './RealTimeChart';
import { useMonitoring } from '../context/MonitoringContext';
import { LoadingSpinner } from '../../common/LoadingSpinner';

const RouterMetricsView = lazy(() => import('./RouterMetricsView').then(m => ({ default: m.RouterMetricsView })));
const LinkMetricsView = lazy(() => import('./LinkMetricsView').then(m => ({ default: m.LinkMetricsView })));
const VNFMetricsView = lazy(() => import('./VNFMetricsView').then(m => ({ default: m.VNFMetricsView })));

interface MetricData {
  timestamp: Date;
  latency: number;
  throughput: number;
  packetLoss: number;
  jitter: number;
  errorRate: number;
  connections: number;
  cpuUsage: number;
  memoryUsage: number;
}

export function EnhancedMetricsTab() {
  const { summary, generateHourlyData, resourceType } = useMonitoring();
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'latency' | 'throughput' | 'packetLoss' | 'all'>('all');

  // Initialize and simulate real-time data
  useEffect(() => {
    const initialData = generateHourlyData().map(d => ({
      timestamp: new Date(d.timestamp),
      latency: d.latency,
      throughput: d.bandwidth * 10,
      packetLoss: d.packetLoss,
      jitter: d.jitter,
      errorRate: d.errorRate * 100,
      connections: Math.floor(Math.random() * 50) + 150,
      cpuUsage: Math.random() * 40 + 30,
      memoryUsage: Math.random() * 30 + 50
    }));
    setMetricsData(initialData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetricsData(prev => {
        const newPoint: MetricData = {
          timestamp: new Date(),
          latency: 3 + Math.random() * 4,
          throughput: 650 + Math.random() * 250,
          packetLoss: Math.random() * 0.05,
          jitter: Math.random() * 1.5,
          errorRate: Math.random() * 0.01,
          connections: Math.floor(Math.random() * 50) + 150,
          cpuUsage: Math.random() * 40 + 30,
          memoryUsage: Math.random() * 30 + 50
        };

        const updated = [...prev, newPoint];
        return updated.slice(-100);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [generateHourlyData]);

  // Calculate current values and trends
  const currentMetrics = useMemo(() => {
    if (metricsData.length === 0) return null;

    const current = metricsData[metricsData.length - 1];
    const previous = metricsData[Math.max(0, metricsData.length - 10)];

    const calculateTrend = (currentVal: number, prevVal: number) => {
      const change = ((currentVal - prevVal) / prevVal) * 100;
      return {
        direction: change > 1 ? 'up' as const : change < -1 ? 'down' as const : 'stable' as const,
        percentage: Math.abs(change),
        timeframe: '10 samples'
      };
    };

    const getStatus = (value: number, thresholds: { warning: number; critical: number }) => {
      if (value >= thresholds.critical) return 'critical' as const;
      if (value >= thresholds.warning) return 'warning' as const;
      return 'healthy' as const;
    };

    return {
      latency: {
        value: current.latency.toFixed(2),
        trend: calculateTrend(current.latency, previous.latency),
        status: getStatus(current.latency, { warning: 10, critical: 20 }),
        sparkline: metricsData.slice(-20).map(d => d.latency)
      },
      throughput: {
        value: current.throughput.toFixed(0),
        trend: calculateTrend(current.throughput, previous.throughput),
        status: current.throughput > 700 ? 'healthy' as const : current.throughput > 500 ? 'warning' as const : 'critical' as const,
        sparkline: metricsData.slice(-20).map(d => d.throughput)
      },
      packetLoss: {
        value: (current.packetLoss * 100).toFixed(3),
        trend: calculateTrend(current.packetLoss, previous.packetLoss),
        status: getStatus(current.packetLoss * 100, { warning: 0.1, critical: 0.5 }),
        sparkline: metricsData.slice(-20).map(d => d.packetLoss * 100)
      },
      jitter: {
        value: current.jitter.toFixed(2),
        trend: calculateTrend(current.jitter, previous.jitter),
        status: getStatus(current.jitter, { warning: 2, critical: 5 }),
        sparkline: metricsData.slice(-20).map(d => d.jitter)
      },
      errorRate: {
        value: current.errorRate.toFixed(3),
        trend: calculateTrend(current.errorRate, previous.errorRate),
        status: getStatus(current.errorRate, { warning: 0.5, critical: 1.0 }),
        sparkline: metricsData.slice(-20).map(d => d.errorRate)
      },
      connections: {
        value: current.connections,
        trend: calculateTrend(current.connections, previous.connections),
        status: 'healthy' as const,
        sparkline: metricsData.slice(-20).map(d => d.connections)
      },
      cpuUsage: {
        value: current.cpuUsage.toFixed(1),
        trend: calculateTrend(current.cpuUsage, previous.cpuUsage),
        status: getStatus(current.cpuUsage, { warning: 70, critical: 85 }),
        sparkline: metricsData.slice(-20).map(d => d.cpuUsage)
      },
      memoryUsage: {
        value: current.memoryUsage.toFixed(1),
        trend: calculateTrend(current.memoryUsage, previous.memoryUsage),
        status: getStatus(current.memoryUsage, { warning: 75, critical: 90 }),
        sparkline: metricsData.slice(-20).map(d => d.memoryUsage)
      }
    };
  }, [metricsData]);

  // Handle resource-specific views AFTER all hooks have been called
  if (resourceType === 'router') {
    return (
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading cloud router metrics..." />}>
        <RouterMetricsView />
      </Suspense>
    );
  }

  if (resourceType === 'link') {
    return (
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading link metrics..." />}>
        <LinkMetricsView />
      </Suspense>
    );
  }

  if (resourceType === 'vnf') {
    return (
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading VNF metrics..." />}>
        <VNFMetricsView />
      </Suspense>
    );
  }

  if (!currentMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const latencyChartData = metricsData.map(d => ({
    timestamp: d.timestamp,
    value: d.latency
  }));

  const throughputChartData = metricsData.map(d => ({
    timestamp: d.timestamp,
    value: d.throughput
  }));

  const packetLossChartData = metricsData.map(d => ({
    timestamp: d.timestamp,
    value: d.packetLoss * 100
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Near Real-Time Network Metrics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitoring updates every 2 seconds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('latency')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'latency'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Latency
          </button>
          <button
            onClick={() => setSelectedMetric('throughput')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'throughput'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Throughput
          </button>
          <button
            onClick={() => setSelectedMetric('packetLoss')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === 'packetLoss'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Packet Loss
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeMetricCard
          title="Network Latency"
          value={currentMetrics.latency.value}
          unit="ms"
          icon={<Clock className="h-5 w-5" />}
          status={currentMetrics.latency.status}
          trend={currentMetrics.latency.trend}
          sparklineData={currentMetrics.latency.sparkline}
          target={{ value: 50, label: 'SLA Target' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="Throughput"
          value={currentMetrics.throughput.value}
          unit="Mbps"
          icon={<Zap className="h-5 w-5" />}
          status={currentMetrics.throughput.status}
          trend={currentMetrics.throughput.trend}
          sparklineData={currentMetrics.throughput.sparkline}
          target={{ value: 75, label: 'Capacity Usage' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="Packet Loss"
          value={currentMetrics.packetLoss.value}
          unit="%"
          icon={<AlertTriangle className="h-5 w-5" />}
          status={currentMetrics.packetLoss.status}
          trend={currentMetrics.packetLoss.trend}
          sparklineData={currentMetrics.packetLoss.sparkline}
          target={{ value: 10, label: 'Threshold' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="Jitter"
          value={currentMetrics.jitter.value}
          unit="ms"
          icon={<TrendingUp className="h-5 w-5" />}
          status={currentMetrics.jitter.status}
          trend={currentMetrics.jitter.trend}
          sparklineData={currentMetrics.jitter.sparkline}
          target={{ value: 30, label: 'Quality Score' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeMetricCard
          title="Error Rate"
          value={currentMetrics.errorRate.value}
          unit="%"
          icon={<AlertTriangle className="h-5 w-5" />}
          status={currentMetrics.errorRate.status}
          trend={currentMetrics.errorRate.trend}
          sparklineData={currentMetrics.errorRate.sparkline}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="Active Connections"
          value={currentMetrics.connections.value}
          icon={<Network className="h-5 w-5" />}
          status={currentMetrics.connections.status}
          trend={currentMetrics.connections.trend}
          sparklineData={currentMetrics.connections.sparkline}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="CPU Usage"
          value={currentMetrics.cpuUsage.value}
          unit="%"
          icon={<Cpu className="h-5 w-5" />}
          status={currentMetrics.cpuUsage.status}
          trend={currentMetrics.cpuUsage.trend}
          sparklineData={currentMetrics.cpuUsage.sparkline}
          target={{ value: Number(currentMetrics.cpuUsage.value), label: 'Current Load' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />

        <RealTimeMetricCard
          title="Memory Usage"
          value={currentMetrics.memoryUsage.value}
          unit="%"
          icon={<Database className="h-5 w-5" />}
          status={currentMetrics.memoryUsage.status}
          trend={currentMetrics.memoryUsage.trend}
          sparklineData={currentMetrics.memoryUsage.sparkline}
          target={{ value: Number(currentMetrics.memoryUsage.value), label: 'Current Usage' }}
          lastUpdate={metricsData[metricsData.length - 1]?.timestamp}
          isLive={true}
        />
      </div>

      {/* Real-Time Charts */}
      {selectedMetric === 'all' && (
        <div className="space-y-6">
          <RealTimeChart
            data={latencyChartData}
            title="Network Latency"
            unit="ms"
            color="#3b82f6"
            thresholds={{ warning: 10, critical: 20 }}
            height={300}
          />
          <RealTimeChart
            data={throughputChartData}
            title="Network Throughput"
            unit="Mbps"
            color="#10b981"
            thresholds={{ warning: 500, critical: 300 }}
            height={300}
          />
          <RealTimeChart
            data={packetLossChartData}
            title="Packet Loss Rate"
            unit="%"
            color="#ef4444"
            thresholds={{ warning: 0.1, critical: 0.5 }}
            height={300}
          />
        </div>
      )}

      {selectedMetric === 'latency' && (
        <RealTimeChart
          data={latencyChartData}
          title="Network Latency - Detailed View"
          unit="ms"
          color="#3b82f6"
          thresholds={{ warning: 10, critical: 20 }}
          height={400}
        />
      )}

      {selectedMetric === 'throughput' && (
        <RealTimeChart
          data={throughputChartData}
          title="Network Throughput - Detailed View"
          unit="Mbps"
          color="#10b981"
          thresholds={{ warning: 500, critical: 300 }}
          height={400}
        />
      )}

      {selectedMetric === 'packetLoss' && (
        <RealTimeChart
          data={packetLossChartData}
          title="Packet Loss Rate - Detailed View"
          unit="%"
          color="#ef4444"
          thresholds={{ warning: 0.1, critical: 0.5 }}
          height={400}
        />
      )}

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Overall Health</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentMetrics.latency.status === 'healthy' &&
                   currentMetrics.throughput.status === 'healthy' &&
                   currentMetrics.packetLoss.status === 'healthy'
                    ? '✓ Excellent'
                    : currentMetrics.latency.status === 'critical' ||
                      currentMetrics.throughput.status === 'critical' ||
                      currentMetrics.packetLoss.status === 'critical'
                    ? '⚠ Critical'
                    : '⚡ Good'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Data Points Collected</p>
                <p className="text-lg font-semibold text-gray-900">{metricsData.length}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Monitoring Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {metricsData[0]?.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
