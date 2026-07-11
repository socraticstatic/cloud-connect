import { useMemo } from 'react';
import { Activity, Shield, Network, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';
import { Group } from '../../../types/group';
import { Connection } from '../../../types';
import { Card } from '../../common/Card';
import { LazyLoadSection } from '../../common/layouts/LazyLoadSection';
import { SkeletonCard } from '../../common/SkeletonCard';
import { LineChart } from '../../monitoring/charts/LineChart';

interface GroupPerformanceWidgetProps {
  group: Group;
  connections: Connection[];
}

export function GroupPerformanceWidget({ group, connections }: GroupPerformanceWidgetProps) {
  // Calculate performance metrics for the connections in this group
  const performanceData = useMemo(() => {
    // Filter only connections belonging to this group
    const groupConnections = connections.filter(conn => 
      group.connectionIds.includes(conn.id)
    );
    
    if (groupConnections.length === 0) {
      return {
        avgLatency: 'N/A',
        avgPacketLoss: 'N/A',
        avgUptime: 'N/A',
        healthScore: 0,
        connectionHealth: { healthy: 0, warning: 0, critical: 0 },
        hasIssues: false,
        latencyData: {
          labels: Array(7).fill(''),
          datasets: [{
            label: 'Avg Latency',
            data: Array(7).fill(0),
            borderColor: '#3b82f6',
            tension: 0.4,
            fill: false
          }]
        }
      };
    }
    
    // Calculate average latency
    let totalLatency = 0;
    let latencyCount = 0;
    groupConnections.forEach(conn => {
      if (conn.performance?.latency) {
        const latencyValue = parseFloat(conn.performance.latency.replace(/[^\d.]/g, ''));
        if (!isNaN(latencyValue)) {
          totalLatency += latencyValue;
          latencyCount++;
        }
      }
    });
    
    // Calculate average packet loss
    let totalPacketLoss = 0;
    let packetLossCount = 0;
    groupConnections.forEach(conn => {
      if (conn.performance?.packetLoss) {
        const packetLossValue = parseFloat(conn.performance.packetLoss.replace(/[^\d.]/g, ''));
        if (!isNaN(packetLossValue)) {
          totalPacketLoss += packetLossValue;
          packetLossCount++;
        }
      }
    });
    
    // Calculate average uptime
    let totalUptime = 0;
    let uptimeCount = 0;
    groupConnections.forEach(conn => {
      if (conn.performance?.uptime) {
        const uptimeValue = parseFloat(conn.performance.uptime.replace(/[^\d.]/g, ''));
        if (!isNaN(uptimeValue)) {
          totalUptime += uptimeValue;
          uptimeCount++;
        }
      }
    });
    
    // Calculate connection health status
    const connectionHealth = {
      healthy: 0,
      warning: 0,
      critical: 0
    };
    
    groupConnections.forEach(conn => {
      // Based on bandwidth utilization and status
      const utilization = conn.performance?.bandwidthUtilization || 0;
      
      if (conn.status !== 'Active') {
        connectionHealth.critical++;
      } else if (utilization > 90) {
        connectionHealth.critical++;
      } else if (utilization > 80) {
        connectionHealth.warning++;
      } else {
        connectionHealth.healthy++;
      }
    });
    
    // Calculate a simple health score (0-100)
    const healthScore = Math.round(
      (connectionHealth.healthy * 100 + connectionHealth.warning * 50) / 
      (connectionHealth.healthy + connectionHealth.warning + connectionHealth.critical) || 0
    );
    
    // Generate some realistic latency trend data
    const baseLatency = totalLatency / latencyCount || 4.5;
    const latencyTrend = Array(7).fill(0).map(() => 
      baseLatency + (Math.random() * 0.4 - 0.2) // Add small random variation
    );
    
    const latencyData = {
      labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
      datasets: [
        {
          label: 'Avg Latency (ms)',
          data: latencyTrend,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    return {
      avgLatency: latencyCount > 0 ? `${(totalLatency / latencyCount).toFixed(2)}ms` : 'N/A',
      avgPacketLoss: packetLossCount > 0 ? `${(totalPacketLoss / packetLossCount).toFixed(4)}%` : 'N/A',
      avgUptime: uptimeCount > 0 ? `${(totalUptime / uptimeCount).toFixed(2)}%` : 'N/A',
      healthScore,
      connectionHealth,
      hasIssues: connectionHealth.warning > 0 || connectionHealth.critical > 0,
      latencyData
    };
  }, [group, connections]);
  
  // Get health color based on score
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <LazyLoadSection
      placeholder={<SkeletonCard lines={4} />}
      className="w-full"
    >
      <Card padding="lg" hover>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Performance Overview
          </h3>
          
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              getHealthBgColor(performanceData.healthScore)
            } ${getHealthColor(performanceData.healthScore)}`}
          >
            Health Score: {performanceData.healthScore}%
          </span>
        </div>
        
        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Latency</div>
              <div className="text-xl font-semibold text-gray-900">{performanceData.avgLatency}</div>
            </div>
            <Activity className="h-8 w-8 text-brand-blue bg-brand-lightBlue p-1.5 rounded-full" />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Packet Loss</div>
              <div className="text-xl font-semibold text-gray-900">{performanceData.avgPacketLoss}</div>
            </div>
            <Network className="h-8 w-8 text-gray-600 bg-gray-100 p-1.5 rounded-full" />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Avg Uptime</div>
              <div className="text-xl font-semibold text-green-600">{performanceData.avgUptime}</div>
            </div>
            <Shield className="h-8 w-8 text-green-500 bg-green-50 p-1.5 rounded-full" />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Connections</div>
              <div className="text-xl font-semibold text-gray-900">
                {performanceData.connectionHealth.healthy + 
                 performanceData.connectionHealth.warning + 
                 performanceData.connectionHealth.critical}
              </div>
            </div>
            <BarChart2 className="h-8 w-8 text-gray-500 bg-gray-100 p-1.5 rounded-full" />
          </div>
        </div>
        
        {/* Connection Status and Latency Trend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="md:col-span-1">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Connection Health</h4>
            {performanceData.connectionHealth.healthy + 
             performanceData.connectionHealth.warning + 
             performanceData.connectionHealth.critical > 0 ? (
              <div className="space-y-4">
                {performanceData.connectionHealth.healthy > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-700">Healthy</span>
                    </div>
                    <span className="text-sm font-semibold text-green-700">
                      {performanceData.connectionHealth.healthy}
                    </span>
                  </div>
                )}
                
                {performanceData.connectionHealth.warning > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-amber-700">Warning</span>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">
                      {performanceData.connectionHealth.warning}
                    </span>
                  </div>
                )}
                
                {performanceData.connectionHealth.critical > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-700">Critical</span>
                    </div>
                    <span className="text-sm font-semibold text-red-700">
                      {performanceData.connectionHealth.critical}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 border border-gray-200 rounded-lg">
                <p className="text-gray-500">No connection data available</p>
              </div>
            )}
          </div>
          
          {/* Latency Trend Graph */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Latency Trend (7 Day)</h4>
            <div className="h-48 lg:h-64">
              <LineChart data={performanceData.latencyData} />
            </div>
          </div>
        </div>
        
        {/* Performance Insights */}
        {performanceData.hasIssues && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Insights</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Performance Issues Detected</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {performanceData.connectionHealth.critical > 0 ? 
                      `${performanceData.connectionHealth.critical} connection${performanceData.connectionHealth.critical > 1 ? 's' : ''} with critical issues. ` : ''}
                    {performanceData.connectionHealth.warning > 0 ? 
                      `${performanceData.connectionHealth.warning} connection${performanceData.connectionHealth.warning > 1 ? 's' : ''} with performance warnings.` : ''}
                  </p>
                  <button className="mt-2 text-sm text-amber-800 font-medium hover:text-amber-900">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </LazyLoadSection>
  );
}