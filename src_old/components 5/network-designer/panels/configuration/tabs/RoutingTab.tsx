import { NetworkNode } from '../../../../../types';

interface RoutingTabProps {
  node: NetworkNode;
  onUpdate: (updates: Partial<NetworkNode>) => void;
}

export function RoutingTab({ node, onUpdate }: RoutingTabProps) {
  const handleConfigChange = (key: string, value: any) => {
    onUpdate({
      config: {
        ...node.config,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Common routing settings for all node types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Routing Protocol</label>
        <select
          value={node.config?.routingProtocol || 'bgp'}
          onChange={(e) => handleConfigChange('routingProtocol', e.target.value)}
          className="form-control w-full"
        >
          <option value="bgp">BGP</option>
          <option value="ospf">OSPF</option>
          <option value="static">Static</option>
          <option value="eigrp">EIGRP</option>
        </select>
      </div>

      {/* Source node specific routing settings */}
      {node.type === 'source' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Advertisement</label>
            <textarea
              value={node.config?.routeAdvertisement || ''}
              onChange={(e) => handleConfigChange('routeAdvertisement', e.target.value)}
              placeholder="e.g., 10.0.0.0/8, 172.16.0.0/12"
              className="form-control w-full"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Static Routes</label>
            <textarea
              value={node.config?.staticRoutes || ''}
              onChange={(e) => handleConfigChange('staticRoutes', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter static routes"
            />
          </div>
        </>
      )}

      {/* Destination node specific routing settings */}
      {node.type === 'destination' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Tables</label>
            <input
              type="text"
              value={node.config?.routeTables || ''}
              onChange={(e) => handleConfigChange('routeTables', e.target.value)}
              placeholder="rtb-xxxxxxxx"
              className="form-control w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Propagated Routes</label>
            <textarea
              value={node.config?.propagatedRoutes || ''}
              onChange={(e) => handleConfigChange('propagatedRoutes', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter propagated routes"
            />
          </div>
        </>
      )}

      {/* Router node specific routing settings */}
      {node.type === 'router' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ASN</label>
            <input
              type="text"
              value={node.config?.asn || ''}
              onChange={(e) => handleConfigChange('asn', e.target.value)}
              placeholder="e.g., 65000"
              className="form-control w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BGP Configuration</label>
            <textarea
              value={node.config?.bgpConfig || ''}
              onChange={(e) => handleConfigChange('bgpConfig', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter BGP configuration"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={node.config?.redistributeConnected || false}
                onChange={(e) => handleConfigChange('redistributeConnected', e.target.checked)}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              <span className="text-sm text-gray-700">Redistribute Connected Routes</span>
            </label>
          </div>
        </>
      )}

      {/* Network node specific routing settings */}
      {node.type === 'network' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Distribution</label>
            <select
              value={node.config?.routeDistribution || 'none'}
              onChange={(e) => handleConfigChange('routeDistribution', e.target.value)}
              className="form-control w-full"
            >
              <option value="none">None</option>
              <option value="ospf">OSPF</option>
              <option value="eigrp">EIGRP</option>
              <option value="rip">RIP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Filters</label>
            <textarea
              value={node.config?.routeFilters || ''}
              onChange={(e) => handleConfigChange('routeFilters', e.target.value)}
              rows={3}
              className="form-control w-full"
              placeholder="Enter route filters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Gateway</label>
            <input
              type="text"
              value={node.config?.defaultGateway || ''}
              onChange={(e) => handleConfigChange('defaultGateway', e.target.value)}
              placeholder="e.g., 192.168.1.1"
              className="form-control w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}