import { useState } from 'react';
import { Shield, ServerCog, Network, Router as RouterIcon, Globe, Clock, Info, MoreVertical, Activity, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { VNF } from '../../../types/vnf';
import { OverflowMenu } from '../../common/OverflowMenu';
import { CloudRouter } from '../../../types/cloudrouter';

interface VNFCardProps {
  vnf: VNF;
  cloudRouter?: CloudRouter;
  onEdit: () => void;
  onDelete: () => void;
}

export function VNFCard({ vnf, cloudRouter, onEdit, onDelete }: VNFCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  
  // Define icon based on VNF type
  const getIcon = () => {
    switch(vnf.type) {
      case 'firewall':
        return <Shield className="h-8 w-8 text-red-500" />;
      case 'sdwan':
        return <Globe className="h-8 w-8 text-purple-500" />;
      case 'router':
        return <RouterIcon className="h-8 w-8 text-blue-500" />;
      case 'vnat':
        return <Network className="h-8 w-8 text-green-500" />;
      case 'custom':
      default:
        return <ServerCog className="h-8 w-8 text-gray-700" />;
    }
  };

  // Define card color based on VNF type
  const getCardColor = () => {
    switch(vnf.type) {
      case 'firewall':
        return 'border-red-200 bg-red-50';
      case 'sdwan':
        return 'border-purple-200 bg-purple-50';
      case 'router':
        return 'border-blue-200 bg-blue-50';
      case 'vnat':
        return 'border-green-200 bg-green-50';
      case 'custom':
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Define status color and text
  const getStatusColor = () => {
    switch(vnf.status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle className="h-4 w-4 mr-1" /> };
      case 'provisioning':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Activity className="h-4 w-4 mr-1" /> };
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Info className="h-4 w-4 mr-1" /> };
    }
  };

  // Calculate license expiration status
  const getLicenseStatus = () => {
    if (!vnf.licenseExpiry) return null;

    const expiryDate = new Date(vnf.licenseExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-amber-600' };
    } else {
      return { text: `Valid until ${expiryDate.toLocaleDateString()}`, color: 'text-green-600' };
    }
  };

  const licenseStatus = getLicenseStatus();

  // Card handling
  const handleCardClick = () => {
    setShowDetails(!showDetails);
  };

  // Get formatted type name
  const getTypeName = () => {
    switch(vnf.type) {
      case 'firewall':
        return 'Firewall';
      case 'sdwan':
        return 'SD-WAN';
      case 'router':
        return 'Router';
      case 'vnat':
        return 'Virtual NAT';
      case 'custom':
        return 'Custom VNF';
      default:
        return vnf.type.toUpperCase();
    }
  };

  const status = getStatusColor();

  return (
    <div 
      className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${getCardColor()}`}
      style={{ transform: 'translateY(0)' }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            vnf.type === 'firewall' ? 'bg-red-100' : 
            vnf.type === 'sdwan' ? 'bg-purple-100' : 
            vnf.type === 'router' ? 'bg-blue-100' : 
            vnf.type === 'vnat' ? 'bg-green-100' : 
            'bg-gray-100'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{vnf.name}</h3>
            <p className="text-sm text-gray-500">{vnf.vendor} {vnf.model}</p>
          </div>
        </div>
        <div className="relative">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.icon}
            {vnf.status.charAt(0).toUpperCase() + vnf.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex justify-between mb-3">
          <div>
            <span className="text-xs font-medium text-gray-500">Type</span>
            <p className="text-sm font-medium text-gray-900">{getTypeName()}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Throughput</span>
            <p className="text-sm font-medium text-gray-900">{vnf.throughput || 'N/A'}</p>
          </div>
        </div>

        {/* Cloud Router Association */}
        <div className="mb-4 p-2 bg-brand-lightBlue rounded-lg">
          <div className="flex items-center">
            <RouterIcon className="h-4 w-4 text-brand-blue mr-1.5" />
            <span className="text-xs text-brand-blue">
              {cloudRouter ? `Attached to: ${cloudRouter.name}` : 'Not attached to any Cloud Router'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vnf.description || 'No description available'}</p>

        {/* License information */}
        {licenseStatus && (
          <div className="flex items-center mt-2 mb-4">
            <Clock className="h-4 w-4 mr-1.5" />
            <span className={`text-xs ${licenseStatus.color}`}>{licenseStatus.text}</span>
          </div>
        )}

        {/* Expandable details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Interfaces</h4>
            <div className="space-y-2 mb-3">
              {vnf.configuration?.interfaces && vnf.configuration.interfaces.length > 0 ? (
                vnf.configuration.interfaces.map(iface => (
                  <div key={iface.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <Network className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="font-medium">{iface.name}</span>
                      <span className="ml-1 text-gray-500">({iface.type})</span>
                    </div>
                    <span className={iface.status === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {iface.status.toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No interfaces configured</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {vnf.configuration?.highAvailability !== undefined && (
                <div>
                  <span className="text-gray-500">High Availability:</span>{' '}
                  <span className={vnf.configuration.highAvailability ? 'text-green-600' : 'text-gray-600'}>
                    {vnf.configuration.highAvailability ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
              
              {vnf.configuration?.managementIP && (
                <div>
                  <span className="text-gray-500">Management IP:</span>{' '}
                  <span className="font-mono">{vnf.configuration.managementIP}</span>
                </div>
              )}

              {vnf.configuration?.routingProtocols && vnf.configuration.routingProtocols.length > 0 && (
                <div className="col-span-2">
                  <span className="text-gray-500">Routing:</span>{' '}
                  <span>{vnf.configuration.routingProtocols.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={handleCardClick}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showDetails ? 'Show less' : 'Show more'}
          </button>
          
          <div className="relative">
            <OverflowMenu
              items={[
                {
                  id: 'edit',
                  label: 'Edit VNF',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: (e) => {
                    e.stopPropagation();
                    onEdit();
                  }
                },
                {
                  id: 'delete',
                  label: 'Delete VNF',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                  },
                  variant: 'danger'
                }
              ]}
              isOpen={showOverflow}
              onOpenChange={setShowOverflow}
            />
          </div>
        </div>
      </div>
    </div>
  );
}