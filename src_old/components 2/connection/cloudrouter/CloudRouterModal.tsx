import { useState, useEffect } from 'react';
import { X, GitBranch, Network, Settings, Info, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../../common/Button';
import { CloudRouter } from '../../../types/cloudrouter';
import { FormField } from '../../form/FormField';
import { Link } from '../../../types/connection';
import { SideDrawer } from '../../common/SideDrawer';

interface CloudRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cloudRouter: CloudRouter) => void;
  cloudRouter?: CloudRouter;
  connectionId: string;
}

export function CloudRouterModal({ 
  isOpen, 
  onClose, 
  onSave, 
  cloudRouter, 
  connectionId 
}: CloudRouterModalProps) {
  const isEditMode = !!cloudRouter;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CloudRouter['status']>('inactive');
  const [location, setLocation] = useState('');
  const [routingPolicy, setRoutingPolicy] = useState('default');
  const [securityPolicy, setSecurityPolicy] = useState('standard');
  const [qosPolicy, setQosPolicy] = useState('standard');
  const [links, setLinks] = useState<Link[]>([]);
  const [asn, setAsn] = useState<number | undefined>(undefined);
  const [bgpEnabled, setBgpEnabled] = useState(false);
  const [routeFilters, setRouteFilters] = useState<string[]>([]);
  const [routeFilterInput, setRouteFilterInput] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Populate form fields in edit mode
  useEffect(() => {
    if (cloudRouter) {
      setName(cloudRouter.name);
      setDescription(cloudRouter.description || '');
      setStatus(cloudRouter.status);
      setLocation(cloudRouter.location);
      setLinks(cloudRouter.links || []);
      
      // Set policies if available
      if (cloudRouter.policies) {
        setRoutingPolicy(cloudRouter.policies.routingPolicy || 'default');
        setSecurityPolicy(cloudRouter.policies.securityPolicy || 'standard');
        setQosPolicy(cloudRouter.policies.qosPolicy || 'standard');
      }
      
      // Set configuration if available
      if (cloudRouter.configuration) {
        setAsn(cloudRouter.configuration.asn);
        setBgpEnabled(cloudRouter.configuration.bgpEnabled || false);
        setRouteFilters(cloudRouter.configuration.routeFilters || []);
      }
    } else {
      // Default values for new cloud routers
      setName('');
      setDescription('');
      setStatus('inactive');
      setLocation('');
      setLinks([]);
      setRoutingPolicy('default');
      setSecurityPolicy('standard');
      setQosPolicy('standard');
      setAsn(undefined);
      setBgpEnabled(false);
      setRouteFilters([]);
    }
    setErrors({});
  }, [cloudRouter, isOpen]);

  // Field validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRouteFilter = () => {
    if (routeFilterInput.trim()) {
      setRouteFilters([...routeFilters, routeFilterInput.trim()]);
      setRouteFilterInput('');
    }
  };

  const handleRemoveRouteFilter = (index: number) => {
    setRouteFilters(routeFilters.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare cloud router data
    const cloudRouterData: CloudRouter = {
      id: cloudRouter?.id || '',
      name,
      description,
      status,
      location,
      createdAt: cloudRouter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectionId,
      links: links,
      policies: {
        routingPolicy,
        securityPolicy,
        qosPolicy
      },
      configuration: {
        asn,
        bgpEnabled,
        routeFilters
      }
    };

    onSave(cloudRouterData);
  };

  const drawerTitle = (
    <div className="flex items-center">
      <GitBranch className="h-5 w-5 text-brand-blue mr-2" />
      {isEditMode ? 'Edit Cloud Router' : 'Add New Cloud Router'}
    </div>
  );

  const drawerFooter = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        form="cloudrouter-form"
      >
        {isEditMode ? 'Update Cloud Router' : 'Create Cloud Router'}
      </Button>
    </div>
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={drawerTitle as any}
      size="xl"
      footer={drawerFooter}
    >
      <form id="cloudrouter-form" onSubmit={handleSubmit}>
        <div>
            {/* Warning message when editing */}
            {isEditMode && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Warning: Editing Cloud Router Configuration
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    Changes to cloud router settings may impact network connectivity. Ensure all connected systems are properly configured for the updated settings.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <GitBranch className="h-4 w-4 text-gray-500 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Cloud Router Name" 
                    error={errors.name} 
                    required
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Primary Cloud Router"
                    />
                  </FormField>
                  
                  <FormField 
                    label="Status"
                  >
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CloudRouter['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="inactive">Inactive</option>
                      <option value="active">Active</option>
                      <option value="provisioning">Provisioning</option>
                      <option value="error">Error</option>
                    </select>
                  </FormField>
                  
                  <FormField 
                    label="Location" 
                    error={errors.location} 
                    required
                  >
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a location</option>
                      <option value="US East">US East</option>
                      <option value="US West">US West</option>
                      <option value="EU West">EU West</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                    </select>
                  </FormField>
                  
                  <div className="md:col-span-2">
                    <FormField 
                      label="Description"
                    >
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a description for this cloud router"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
              
              {/* Policies */}
              <div className="md:col-span-2">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="h-4 w-4 text-gray-500 mr-2" />
                  Policies
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField 
                    label="Routing Policy"
                  >
                    <select
                      value={routingPolicy}
                      onChange={(e) => setRoutingPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="default">Default</option>
                      <option value="backup">Backup</option>
                      <option value="load-balancing">Load Balancing</option>
                      <option value="failover">Failover</option>
                    </select>
                  </FormField>
                  
                  <FormField 
                    label="Security Policy"
                  >
                    <select
                      value={securityPolicy}
                      onChange={(e) => setSecurityPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="strict">Strict</option>
                      <option value="custom">Custom</option>
                    </select>
                  </FormField>
                  
                  <FormField 
                    label="QoS Policy"
                  >
                    <select
                      value={qosPolicy}
                      onChange={(e) => setQosPolicy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="business-critical">Business Critical</option>
                      <option value="real-time">Real-Time</option>
                      <option value="custom">Custom</option>
                    </select>
                  </FormField>
                </div>
              </div>
              
              {/* Advanced Settings Toggle */}
              <div className="md:col-span-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="md:col-span-2 pt-4 pb-2 space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      label="ASN (Autonomous System Number)"
                    >
                      <input
                        type="number"
                        value={asn || ''}
                        onChange={(e) => setAsn(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 65000"
                      />
                    </FormField>
                    
                    <FormField 
                      label="BGP Enabled"
                    >
                      <div className="flex items-center h-full">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={bgpEnabled}
                            onChange={(e) => setBgpEnabled(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable BGP routing</span>
                        </label>
                      </div>
                    </FormField>
                  </div>
                  
                  <div>
                    <FormField 
                      label="Route Filters"
                    >
                      <div className="space-y-2">
                        <div className="flex">
                          <input
                            type="text"
                            value={routeFilterInput}
                            onChange={(e) => setRouteFilterInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2"
                            placeholder="e.g., 10.0.0.0/8"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddRouteFilter}
                            disabled={!routeFilterInput.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        
                        {routeFilters.length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {routeFilters.map((filter, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                <span className="text-sm text-gray-700">{filter}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRouteFilter(index)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">No route filters added</p>
                        )}
                      </div>
                    </FormField>
                  </div>
                </div>
              )}
            </div>
        </div>
      </form>
    </SideDrawer>
  );
}