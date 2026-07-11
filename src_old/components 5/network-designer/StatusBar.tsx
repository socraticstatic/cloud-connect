import { Activity, Shield, RefreshCw, Zap } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../types';

interface StatusBarProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  onRefresh: () => void;
}

export function StatusBar({ nodes, edges, onRefresh }: StatusBarProps) {
  // Calculate network statistics
  const activeNodes = nodes.filter(n => n.status === 'active').length;
  const activeEdges = edges.filter(e => e.status === 'active').length;
  const totalBandwidth = edges.reduce((sum, edge) => {
    const bandwidthValue = parseInt(edge.bandwidth.replace(/[^\d]/g, ''));
    const bandwidthUnit = edge.bandwidth.replace(/[\d\s]/g, '');
    
    // Convert to a common unit (Gbps)
    let normalizedBandwidth = bandwidthValue;
    if (bandwidthUnit.toLowerCase() === 'mbps') {
      normalizedBandwidth = bandwidthValue / 1000;
    } else if (bandwidthUnit.toLowerCase() === 'tbps') {
      normalizedBandwidth = bandwidthValue * 1000;
    }
    
    return sum + normalizedBandwidth;
  }, 0);
  
  // Format the total bandwidth
  const formattedBandwidth = totalBandwidth >= 1000 
    ? `${(totalBandwidth / 1000).toFixed(2)} Tbps` 
    : `${totalBandwidth.toFixed(2)} Gbps`;

  return (
    <div 
      className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center space-x-6 whitespace-nowrap"
      style={{ zIndex: 100, minWidth: '600px' }}
    >
      <div className="flex items-center">
        <Activity className="h-4 w-4 text-brand-blue mr-1" />
        <span className="text-sm text-gray-600">
          {nodes.length} Nodes, {edges.length} Connections
        </span>
      </div>
      <div className="flex items-center">
        <Shield className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-sm text-gray-600">
          {activeNodes} Active Nodes, {activeEdges} Active Connections
        </span>
      </div>
      <div className="flex items-center">
        <Zap className="h-4 w-4 text-amber-500 mr-1" />
        <span className="text-sm text-gray-600">
          Total Bandwidth: {formattedBandwidth}
        </span>
      </div>
      <button
        onClick={onRefresh}
        className="p-1 text-gray-400 hover:text-brand-blue rounded-full hover:bg-brand-lightBlue"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}