import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Play, Pause, Edit2, Trash2,
  Shield, AlertTriangle, Check, Network, GitBranch, Layers,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Toggle } from '../../common/Toggle';
import { RoutingPolicy, PolicyAppliesTo, PolicyAction, PolicyProtocol } from '../../../types/routingPolicy';
import { Connection } from '../../../types';
import { CloudRouter } from '../../../types/cloudrouter';
import { VNF } from '../../../types/vnf';
import { Link } from '../../../types';
import { Modal } from '../../common/Modal';
import { SideDrawer } from '../../common/SideDrawer';
import { FormField } from '../../form/FormField';

interface PoliciesTabProps {
  connection: Connection;
  cloudRouters: CloudRouter[];
  vnfs: VNF[];
  allLinks: Link[];
}

export function PoliciesTab({ connection, cloudRouters, vnfs, allLinks }: PoliciesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppliesTo, setSelectedAppliesTo] = useState<PolicyAppliesTo>('all');
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<PolicyAction>('allow');

  // Policy configuration options from Configure > Policies
  const [policyDirection, setPolicyDirection] = useState<'onPremiseToPartner' | 'partnerToOnPremise' | 'both'>('both');
  const [specificOptions, setSpecificOptions] = useState({
    matchingRoutes: false,
    blockDefaultRoutes: false,
    communityValueFilter: false,
    prependASN: false,
    cvTagging: false,
    advertiseStatic: false
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RoutingPolicy | undefined>();
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    action: [] as PolicyAction[],
    appliesTo: [] as PolicyAppliesTo[],
    enabled: 'all' as 'all' | 'enabled' | 'disabled'
  });

  // Sample routing policies
  const [policies, setPolicies] = useState<RoutingPolicy[]>([
    {
      id: 'policy-1',
      name: 'Production Traffic Priority',
      description: 'Allow production traffic over all links',
      enabled: true,
      priority: 100,
      action: 'allow',
      protocol: 'any',
      conditions: [
        { id: 'cond-1', type: 'prefix', operator: 'matches', value: '10.0.0.0/8' },
        { id: 'cond-2', type: 'community', operator: 'contains', value: '65000:100' }
      ],
      appliesTo: 'links',
      targetIds: ['link-1', 'link-2'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-03-10T14:30:00Z',
      createdBy: 'admin@att.com'
    },
    {
      id: 'policy-2',
      name: 'Block Suspicious Traffic',
      description: 'Deny traffic from known malicious sources',
      enabled: true,
      priority: 200,
      action: 'deny',
      protocol: 'tcp',
      conditions: [
        { id: 'cond-3', type: 'source', operator: 'matches', value: '192.168.100.0/24' },
        { id: 'cond-4', type: 'port', operator: 'range', value: '1-1024' }
      ],
      appliesTo: 'all',
      targetIds: [],
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-20T11:45:00Z',
      createdBy: 'security@att.com'
    },
    {
      id: 'policy-3',
      name: 'BGP AS Path Prepending',
      description: 'Manipulate route advertisements by prepending AS path',
      enabled: true,
      priority: 75,
      action: 'manipulate',
      protocol: 'bgp',
      conditions: [
        { id: 'cond-5', type: 'as-path', operator: 'contains', value: '65001' },
        { id: 'cond-6', type: 'prefix', operator: 'matches', value: '172.16.0.0/12' }
      ],
      appliesTo: 'cloudrouters',
      targetIds: ['cr-1'],
      createdAt: '2024-01-20T13:30:00Z',
      updatedAt: '2024-03-05T16:00:00Z',
      createdBy: 'network@att.com'
    },
    {
      id: 'policy-4',
      name: 'Advertise Static Routes',
      description: 'Advertise static routes to BGP neighbors',
      enabled: false,
      priority: 50,
      action: 'advertise',
      protocol: 'bgp',
      conditions: [
        { id: 'cond-7', type: 'prefix', operator: 'matches', value: '192.168.0.0/16' }
      ],
      appliesTo: 'vnfs',
      targetIds: ['vnf-1', 'vnf-2'],
      createdAt: '2024-02-10T11:00:00Z',
      updatedAt: '2024-03-01T09:20:00Z',
      createdBy: 'network@att.com'
    }
  ]);

  const filteredPolicies = useMemo(() => {
    return policies
      .filter(policy => {
        const matchesSearch = !searchQuery ||
          policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction = !filters.action.length || filters.action.includes(policy.action);
        const matchesAppliesTo = !filters.appliesTo.length || filters.appliesTo.includes(policy.appliesTo);
        const matchesEnabled = filters.enabled === 'all' ||
          (filters.enabled === 'enabled' && policy.enabled) ||
          (filters.enabled === 'disabled' && !policy.enabled);

        return matchesSearch && matchesAction && matchesAppliesTo && matchesEnabled;
      })
      .sort((a, b) => b.priority - a.priority);
  }, [policies, searchQuery, filters]);

  const handleTogglePolicy = (id: string) => {
    setPolicies(policies.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));

    const policy = policies.find(p => p.id === id);
    window.addToast({
      type: 'success',
      title: 'Policy Updated',
      message: `${policy?.name} has been ${policy?.enabled ? 'disabled' : 'enabled'}`,
      duration: 3000
    });
  };

  const handleDeletePolicy = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${policy?.name}"? This action cannot be undone.`)) {
      setPolicies(policies.filter(p => p.id !== id));
      window.addToast({
        type: 'success',
        title: 'Policy Deleted',
        message: `${policy?.name} has been deleted`,
        duration: 3000
      });
    }
  };

  const exportPolicies = () => {
    const csv = [
      ['Name', 'Action', 'Protocol', 'Applies To', 'Status', 'Priority'].join(','),
      ...filteredPolicies.map(p => [
        p.name,
        p.action,
        p.protocol,
        p.appliesTo,
        p.enabled ? 'Enabled' : 'Disabled',
        p.priority
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'routing-policies.csv';
    link.click();
    URL.revokeObjectURL(url);

    window.addToast({
      type: 'success',
      title: 'Export Complete',
      message: 'Policies exported successfully',
      duration: 3000
    });
  };

  const getTargetName = (targetId: string): string => {
    const link = allLinks.find(l => l.id === targetId);
    if (link) return link.name;

    const router = cloudRouters.find(cr => cr.id === targetId);
    if (router) return router.name;

    const vnf = vnfs.find(v => v.id === targetId);
    if (vnf) return vnf.name;

    return targetId;
  };

  const getTargetIcon = (appliesTo: PolicyAppliesTo) => {
    switch (appliesTo) {
      case 'links':
        return <Network className="h-4 w-4" />;
      case 'cloudrouters':
        return <GitBranch className="h-4 w-4" />;
      case 'vnfs':
        return <Shield className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-fw-heading">Routing Policies</h2>
          <p className="text-sm text-fw-bodyLight mt-1">
            Manage routing policies for {connection.name}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingPolicy(undefined);
            setShowAddModal(true);
          }}
        >
          Add Policy
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="bg-fw-base rounded-lg border border-fw-secondary p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fw-disabled h-5 w-5" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-fw-secondary rounded-full focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            />
          </div>

          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>

          <Button
            variant="outline"
            icon={Download}
            onClick={exportPolicies}
          >
            Export
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-fw-secondary">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-fw-body mb-2">Action</h4>
                <div className="space-y-2">
                  {['allow', 'deny', 'manipulate', 'advertise'].map((action) => (
                    <label key={action} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.action.includes(action as PolicyAction)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, action: [...filters.action, action as PolicyAction] });
                          } else {
                            setFilters({ ...filters, action: filters.action.filter(a => a !== action) });
                          }
                        }}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body capitalize">{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-fw-body mb-2">Applies To</h4>
                <div className="space-y-2">
                  {['all', 'links', 'cloudrouters', 'vnfs'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.appliesTo.includes(type as PolicyAppliesTo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, appliesTo: [...filters.appliesTo, type as PolicyAppliesTo] });
                          } else {
                            setFilters({ ...filters, appliesTo: filters.appliesTo.filter(t => t !== type) });
                          }
                        }}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-fw-body mb-2">Status</h4>
                <div className="space-y-2">
                  {['all', 'enabled', 'disabled'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="enabled"
                        checked={filters.enabled === status}
                        onChange={() => setFilters({ ...filters, enabled: status as any })}
                        className="border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        {filteredPolicies.length === 0 ? (
          <div className="text-center py-12 bg-fw-wash rounded-lg border border-fw-secondary">
            <Shield className="h-12 w-12 text-fw-disabled mx-auto mb-3" />
            <p className="text-fw-body">No routing policies found</p>
            <p className="text-sm text-fw-bodyLight mt-1">
              {searchQuery || filters.action.length || filters.appliesTo.length
                ? 'Try adjusting your filters'
                : 'Create your first routing policy to get started'
              }
            </p>
          </div>
        ) : (
          filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="bg-fw-base rounded-lg border border-fw-secondary hover:shadow-md transition-shadow"
            >
              {/* Policy Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Status Indicator */}
                  <Toggle
                    checked={policy.enabled}
                    onChange={() => handleTogglePolicy(policy.id)}
                    size="md"
                  />

                  {/* Priority Badge */}
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-fw-accent">
                    <span className="text-sm font-semibold text-fw-link">{policy.priority}</span>
                  </div>

                  {/* Policy Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-medium text-fw-heading truncate">{policy.name}</h3>

                      {/* Action Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        policy.action === 'allow'
                          ? 'bg-[var(--status-active-bg)] text-[var(--status-active-text)]'
                          : policy.action === 'deny'
                          ? 'bg-[var(--status-error-bg)] text-[var(--status-error-text)]'
                          : policy.action === 'manipulate'
                          ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
                          : 'bg-fw-accent text-fw-link'
                      }`}>
                        {policy.action === 'allow' ? <Check className="h-3 w-3 mr-1" /> :
                         policy.action === 'deny' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                         policy.action === 'manipulate' ? <Edit2 className="h-3 w-3 mr-1" /> :
                         <Play className="h-3 w-3 mr-1" />}
                        {policy.action.toUpperCase()}
                      </span>

                      {/* Protocol Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-fw-neutral text-fw-body">
                        {policy.protocol.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-fw-bodyLight mt-1 truncate">{policy.description}</p>

                    {/* Targets */}
                    <div className="flex items-center space-x-2 mt-2">
                      {getTargetIcon(policy.appliesTo)}
                      <span className="text-xs text-fw-bodyLight">
                        {policy.appliesTo === 'all'
                          ? 'Applied to all resources'
                          : `Applied to ${policy.targetIds.length} ${policy.appliesTo}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={expandedPolicy === policy.id ? ChevronUp : ChevronDown}
                    onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
                  >
                    {expandedPolicy === policy.id ? 'Hide' : 'Details'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => {
                      setEditingPolicy(policy);
                      setShowAddModal(true);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="text-fw-error border-fw-error hover:bg-[var(--status-error-bg)]"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPolicy === policy.id && (
                <div className="border-t border-fw-secondary p-4 bg-fw-wash">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Conditions */}
                    <div>
                      <h4 className="text-sm font-medium text-fw-heading mb-3">Conditions</h4>
                      <div className="space-y-2">
                        {policy.conditions.map((condition) => (
                          <div key={condition.id} className="flex items-center space-x-2 text-sm">
                            <span className="px-2 py-1 bg-fw-base rounded text-fw-bodyLight font-mono">
                              {condition.type}
                            </span>
                            <span className="text-fw-disabled">{condition.operator}</span>
                            <span className="px-2 py-1 bg-fw-base rounded text-fw-body font-mono">
                              {condition.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Targets */}
                    <div>
                      <h4 className="text-sm font-medium text-fw-heading mb-3">Applied To</h4>
                      {policy.appliesTo === 'all' ? (
                        <p className="text-sm text-fw-bodyLight">All links, cloud routers, and VNFs</p>
                      ) : (
                        <div className="space-y-2">
                          {policy.targetIds.map((targetId) => (
                            <div key={targetId} className="flex items-center space-x-2 text-sm">
                              {getTargetIcon(policy.appliesTo)}
                              <span className="text-fw-body">{getTargetName(targetId)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-fw-secondary text-xs text-fw-bodyLight">
                    <div className="flex items-center justify-between">
                      <span>Created by {policy.createdBy} on {new Date(policy.createdAt).toLocaleDateString()}</span>
                      <span>Last updated {new Date(policy.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Policy Drawer */}
      <SideDrawer
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingPolicy(undefined);
          setSelectedAppliesTo('all');
          setSelectedTargetIds([]);
          setSelectedAction('allow');
        }}
        title={editingPolicy ? 'Edit Routing Policy' : 'Add Routing Policy'}
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingPolicy(undefined);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary">
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-fw-bodyLight">
            Create routing policies to control traffic flow across your network infrastructure.
            Configure actions and conditions based on your network requirements.
          </p>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-fw-heading border-b border-fw-secondary pb-2">
              Basic Information
            </h3>

            <FormField label="Policy Name" required>
              <input
                type="text"
                className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                placeholder="e.g., Production Traffic Priority"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                rows={3}
                placeholder="Describe what this policy does and when it should be applied..."
              />
            </FormField>

            <FormField label="Priority" required helpText="Higher numbers = higher priority (1-1000)">
              <input
                type="number"
                className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                placeholder="100"
                min="1"
                max="1000"
                defaultValue={100}
              />
            </FormField>
          </div>

          {/* Action Configuration */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-fw-heading border-b border-fw-secondary pb-2">
              Action Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Action" required helpText="Inherited from Configure > Policies">
                <select
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as PolicyAction)}
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                  <option value="manipulate">Manipulate</option>
                  <option value="advertise">Advertise</option>
                </select>
              </FormField>

              <FormField label="Protocol" required>
                <select className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active">
                  <option value="any">Any</option>
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                  <option value="bgp">BGP</option>
                  <option value="ospf">OSPF</option>
                </select>
              </FormField>
            </div>

            {/* Direction Selection */}
            <FormField label="Traffic Direction" required>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="direction"
                    value="onPremiseToPartner"
                    checked={policyDirection === 'onPremiseToPartner'}
                    onChange={(e) => setPolicyDirection(e.target.value as typeof policyDirection)}
                    className="h-4 w-4 text-fw-link focus:ring-fw-active border-fw-secondary"
                  />
                  <span className="ml-2 text-sm text-fw-body">On Premise → Partner</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="direction"
                    value="partnerToOnPremise"
                    checked={policyDirection === 'partnerToOnPremise'}
                    onChange={(e) => setPolicyDirection(e.target.value as typeof policyDirection)}
                    className="h-4 w-4 text-fw-link focus:ring-fw-active border-fw-secondary"
                  />
                  <span className="ml-2 text-sm text-fw-body">Partner → On Premise</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="direction"
                    value="both"
                    checked={policyDirection === 'both'}
                    onChange={(e) => setPolicyDirection(e.target.value as typeof policyDirection)}
                    className="h-4 w-4 text-fw-link focus:ring-fw-active border-fw-secondary"
                  />
                  <span className="ml-2 text-sm text-fw-body">Both Directions</span>
                </label>
              </div>
            </FormField>

            {/* Action-Specific Options */}
            <div className="bg-fw-wash p-4 rounded-lg">
              <h4 className="text-sm font-medium text-fw-body mb-3">
                {selectedAction === 'allow' ? 'Allow Options' :
                 selectedAction === 'deny' ? 'Deny Options' :
                 selectedAction === 'manipulate' ? 'Manipulation Options' :
                 'Advertisement Options'}
              </h4>
              <div className="space-y-2">
                {selectedAction === 'allow' && (
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.matchingRoutes}
                        onChange={(e) => setSpecificOptions({...specificOptions, matchingRoutes: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Matching Routes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.communityValueFilter}
                        onChange={(e) => setSpecificOptions({...specificOptions, communityValueFilter: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Community Value Filter</span>
                    </label>
                  </>
                )}
                {selectedAction === 'deny' && (
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.matchingRoutes}
                        onChange={(e) => setSpecificOptions({...specificOptions, matchingRoutes: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Matching Routes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.blockDefaultRoutes}
                        onChange={(e) => setSpecificOptions({...specificOptions, blockDefaultRoutes: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Block Default Routes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.communityValueFilter}
                        onChange={(e) => setSpecificOptions({...specificOptions, communityValueFilter: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Community Value Filter</span>
                    </label>
                  </>
                )}
                {selectedAction === 'manipulate' && (
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.prependASN}
                        onChange={(e) => setSpecificOptions({...specificOptions, prependASN: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Prepend Advertisements with Extra BGP ASNs</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={specificOptions.cvTagging}
                        onChange={(e) => setSpecificOptions({...specificOptions, cvTagging: e.target.checked})}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-fw-body">Selective CV Tagging to Routes/Prefixes</span>
                    </label>
                  </>
                )}
                {selectedAction === 'advertise' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={specificOptions.advertiseStatic}
                      onChange={(e) => setSpecificOptions({...specificOptions, advertiseStatic: e.target.checked})}
                      className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-fw-body">Advertise Static Routes</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-fw-heading border-b border-fw-secondary pb-2">
              Apply To Resources
            </h3>

            <FormField label="Target Resources" required>
              <select
                className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                value={selectedAppliesTo}
                onChange={(e) => {
                  setSelectedAppliesTo(e.target.value as PolicyAppliesTo);
                  setSelectedTargetIds([]);
                }}
              >
                <option value="all">All Resources</option>
                <option value="links">Specific Links</option>
                <option value="cloudrouters">Specific Cloud Routers</option>
                <option value="vnfs">Specific VNFs</option>
              </select>
            </FormField>

            {/* Show resource selection when not "all" */}
            {selectedAppliesTo === 'links' && allLinks.length > 0 && (
              <div className="bg-fw-wash p-4 rounded-lg">
                <h4 className="text-sm font-medium text-fw-body mb-3">Select Links</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allLinks.map((link) => (
                    <label key={link.id} className="flex items-center p-2 hover:bg-fw-base rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTargetIds.includes(link.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetIds([...selectedTargetIds, link.id]);
                          } else {
                            setSelectedTargetIds(selectedTargetIds.filter(id => id !== link.id));
                          }
                        }}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-fw-body">{link.name}</div>
                        <div className="text-xs text-fw-bodyLight">
                          VLAN {link.vlanId} • {link.status === 'active' ? 'Active' : 'Inactive'}
                          {link.ipSubnet && ` • ${link.ipSubnet}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-xs text-fw-bodyLight">
                  {selectedTargetIds.length} of {allLinks.length} links selected
                </div>
              </div>
            )}

            {selectedAppliesTo === 'cloudrouters' && cloudRouters.length > 0 && (
              <div className="bg-fw-wash p-4 rounded-lg">
                <h4 className="text-sm font-medium text-fw-body mb-3">Select Cloud Routers</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cloudRouters.map((cr) => (
                    <label key={cr.id} className="flex items-center p-2 hover:bg-fw-base rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTargetIds.includes(cr.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetIds([...selectedTargetIds, cr.id]);
                          } else {
                            setSelectedTargetIds(selectedTargetIds.filter(id => id !== cr.id));
                          }
                        }}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-fw-body">{cr.name}</div>
                        <div className="text-xs text-fw-bodyLight">
                          {cr.provider} • BGP ASN: {cr.bgpAsn}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-xs text-fw-bodyLight">
                  {selectedTargetIds.length} of {cloudRouters.length} cloud routers selected
                </div>
              </div>
            )}

            {selectedAppliesTo === 'vnfs' && vnfs.length > 0 && (
              <div className="bg-fw-wash p-4 rounded-lg">
                <h4 className="text-sm font-medium text-fw-body mb-3">Select VNFs</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {vnfs.map((vnf) => (
                    <label key={vnf.id} className="flex items-center p-2 hover:bg-fw-base rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTargetIds.includes(vnf.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetIds([...selectedTargetIds, vnf.id]);
                          } else {
                            setSelectedTargetIds(selectedTargetIds.filter(id => id !== vnf.id));
                          }
                        }}
                        className="rounded border-fw-secondary text-fw-link focus:ring-fw-active h-4 w-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-fw-body">{vnf.name}</div>
                        <div className="text-xs text-fw-bodyLight">
                          {vnf.type} • {vnf.provider}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-xs text-fw-bodyLight">
                  {selectedTargetIds.length} of {vnfs.length} VNFs selected
                </div>
              </div>
            )}
          </div>

          {/* Conditions Section */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-fw-heading border-b border-fw-secondary pb-2">
              Policy Conditions
            </h3>
            <p className="text-sm text-fw-bodyLight">
              Define conditions that must be met for this policy to apply. Leave empty to match all traffic.
            </p>

            <div className="space-y-3">
              <FormField label="Source Prefix">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  placeholder="e.g., 10.0.0.0/8"
                />
              </FormField>

              <FormField label="Destination Prefix">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  placeholder="e.g., 192.168.0.0/16"
                />
              </FormField>

              <FormField label="BGP Community">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  placeholder="e.g., 65000:100"
                />
              </FormField>

              <FormField label="AS Path (Regex)">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active"
                  placeholder="e.g., ^65001"
                />
              </FormField>
            </div>
          </div>
        </div>
      </SideDrawer>
    </div>
  );
}
