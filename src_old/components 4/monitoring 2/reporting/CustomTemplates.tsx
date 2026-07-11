import { useState } from 'react';
import { FileText, Edit, Trash2, Copy, Download, Plus, Settings, Layout, Filter, Star, Clock, LayoutGrid, List } from 'lucide-react';
import { Button } from '../../common/Button';
import { Modal } from '../../common/Modal';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'Performance' | 'Security' | 'Usage' | 'Billing' | 'Custom';
  lastModified: string;
  format: 'PDF' | 'CSV' | 'Excel' | 'JSON';
  createdBy: string;
  isDefault: boolean;
  usageCount: number;
  sections: string[];
  filters?: {
    connections?: string[];
    dateRange?: string;
    metrics?: string[];
  };
}

const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Executive Summary Dashboard',
    description: 'High-level overview of NetBond connections, IPE capacity, utilization, revenue, and service reliability',
    type: 'Performance',
    lastModified: '2024-03-10T15:30:00Z',
    format: 'PDF',
    createdBy: 'System',
    isDefault: true,
    usageCount: 145,
    sections: ['Connection Inventory', 'IPE Capacity', 'Utilization Analysis', 'Revenue Metrics', 'Link Status']
  },
  {
    id: '2',
    name: 'Detailed Security Audit',
    description: 'Comprehensive security analysis for NetBond connections including access logs, threats, and compliance',
    type: 'Security',
    lastModified: '2024-03-09T12:45:00Z',
    format: 'PDF',
    createdBy: 'System',
    isDefault: true,
    usageCount: 87,
    sections: ['Security Events', 'Connection Access', 'Threat Analysis', 'Compliance Status']
  },
  {
    id: '3',
    name: 'Monthly Bandwidth Report',
    description: 'Detailed analysis of NetBond connection utilization per IPE with bandwidth consumption patterns',
    type: 'Usage',
    lastModified: '2024-03-08T09:15:00Z',
    format: 'Excel',
    createdBy: 'System',
    isDefault: true,
    usageCount: 112,
    sections: ['Connection Utilization', 'IPE Capacity', 'Peak Times', 'Growth Trends', 'Capacity Planning']
  },
  {
    id: '4',
    name: 'Cost Analysis & Optimization',
    description: 'NetBond revenue metrics, ARPC trends, billed connections, and MBC analysis with optimization recommendations',
    type: 'Billing',
    lastModified: '2024-03-07T14:20:00Z',
    format: 'Excel',
    createdBy: 'finance@company.com',
    isDefault: false,
    usageCount: 64,
    sections: ['Revenue Breakdown', 'ARPC Trends', 'MBC Analysis', 'Optimization Opportunities', 'Forecasts']
  },
  {
    id: '5',
    name: 'SLA Performance Report',
    description: 'NetBond service reliability with link status, service disruptions per site/region, and downtime analysis',
    type: 'Performance',
    lastModified: '2024-03-06T11:10:00Z',
    format: 'PDF',
    createdBy: 'ops@company.com',
    isDefault: false,
    usageCount: 53,
    sections: ['Link Status', 'Connection Status', 'Service Disruptions', 'Downtime Analysis', 'SLA Compliance']
  },
  {
    id: '6',
    name: 'Network Telemetry Export',
    description: 'Raw NetBond connection metrics, IPE utilization, and link status export for external analytics',
    type: 'Custom',
    lastModified: '2024-03-05T16:45:00Z',
    format: 'JSON',
    createdBy: 'data@company.com',
    isDefault: false,
    usageCount: 28,
    sections: ['Connection Metrics', 'IPE Utilization', 'Link Status', 'Time Series Data', 'Event Logs', 'Metadata']
  },
  {
    id: '7',
    name: 'Capacity Planning Report',
    description: 'IPE capacity analysis, connection utilization trends, provider coverage, and growth projections',
    type: 'Performance',
    lastModified: '2024-03-04T10:30:00Z',
    format: 'PDF',
    createdBy: 'netops@company.com',
    isDefault: false,
    usageCount: 41,
    sections: ['IPE Capacity', 'Current Utilization', 'Provider Coverage', 'Growth Trends', 'Projections', 'Recommendations']
  },
  {
    id: '8',
    name: 'Incident Response Summary',
    description: 'NetBond service disruptions per site/region, connections impacted, downtime analysis, and remediation',
    type: 'Security',
    lastModified: '2024-03-03T08:15:00Z',
    format: 'PDF',
    createdBy: 'incidents@company.com',
    isDefault: false,
    usageCount: 37,
    sections: ['Service Disruptions', 'Connections Impacted', 'IPE Impact', 'Downtime Minutes', 'Root Cause', 'Remediation']
  },
  {
    id: '9',
    name: 'ARPC Optimization Report',
    description: 'Average Revenue Per Connection analysis by provider, connection type, region, and bandwidth tier with revenue optimization recommendations',
    type: 'Billing',
    lastModified: '2024-03-10T13:20:00Z',
    format: 'Excel',
    createdBy: 'finance@company.com',
    isDefault: false,
    usageCount: 52,
    sections: ['ARPC by Connection Type', 'ARPC by Provider', 'ARPC by Region', 'ARPC by Bandwidth', 'Optimization Opportunities', 'Trends']
  },
  {
    id: '10',
    name: 'MBC Cost Analysis Dashboard',
    description: 'Maximum Billable Capacity analysis with utilization vs MBC comparison, cost per Gbps, and upgrade/downgrade recommendations',
    type: 'Billing',
    lastModified: '2024-03-10T11:45:00Z',
    format: 'Excel',
    createdBy: 'finance@company.com',
    isDefault: false,
    usageCount: 48,
    sections: ['MBC vs Utilization', 'Cost per Connection Type', 'Upgrade Recommendations', 'Downgrade Opportunities', 'MBC Trends', 'Savings Analysis']
  },
  {
    id: '11',
    name: 'Provider Revenue Comparison',
    description: 'Comprehensive cost comparison across cloud providers showing revenue, ARPC, market share, and cost efficiency by region and connection type',
    type: 'Billing',
    lastModified: '2024-03-09T16:30:00Z',
    format: 'PDF',
    createdBy: 'strategy@company.com',
    isDefault: false,
    usageCount: 61,
    sections: ['Provider Revenue', 'Cost by Region', 'Cost by Connection Type', 'Efficiency Metrics', 'Market Share', 'Growth Trends']
  },
  {
    id: '12',
    name: 'IPE Profitability Analysis',
    description: 'Revenue and profitability metrics per IPE including capacity ROI, revenue per Gbps, and site rankings',
    type: 'Billing',
    lastModified: '2024-03-08T14:15:00Z',
    format: 'Excel',
    createdBy: 'operations@company.com',
    isDefault: false,
    usageCount: 39,
    sections: ['Revenue per IPE', 'Regional Revenue', 'Capacity ROI', 'Profitability Rankings', 'Growth Metrics', 'Optimization']
  },
  {
    id: '13',
    name: 'Revenue Forecast & Projections',
    description: '12-month revenue forecast based on historical trends, new connection pipeline, MBC upgrades, and customer growth projections',
    type: 'Billing',
    lastModified: '2024-03-07T10:00:00Z',
    format: 'PDF',
    createdBy: 'strategy@company.com',
    isDefault: false,
    usageCount: 44,
    sections: ['12-Month Forecast', 'Provider Projections', 'Pipeline Impact', 'MBC Upgrade Trends', 'Regional Growth', 'Confidence Analysis']
  },
  {
    id: '14',
    name: 'Link Economics Report',
    description: 'Cost per Link analysis, revenue per Link, Link utilization economics, and cost efficiency by connection type and provider',
    type: 'Billing',
    lastModified: '2024-03-10T09:30:00Z',
    format: 'Excel',
    createdBy: 'finance@company.com',
    isDefault: false,
    usageCount: 35,
    sections: ['Cost per Link', 'Link Utilization', 'Links per Provider', 'Link Efficiency', 'Optimization Opportunities', 'Trends']
  },
  {
    id: '15',
    name: 'Customer Spend Analysis',
    description: 'Per-customer revenue analysis with spend per month, ARPU breakdown, connection distribution, and customer value metrics',
    type: 'Billing',
    lastModified: '2024-03-09T15:45:00Z',
    format: 'PDF',
    createdBy: 'sales@company.com',
    isDefault: false,
    usageCount: 58,
    sections: ['Customer Revenue', 'Spend per Region', 'ARPU Analysis', 'Customer Segmentation', 'Value Metrics', 'Growth Opportunities']
  },
  {
    id: '16',
    name: 'Cost Optimization Dashboard',
    description: 'Comprehensive cost optimization analysis combining MBC utilization, Link efficiency, provider costs, and actionable savings recommendations',
    type: 'Billing',
    lastModified: '2024-03-10T14:00:00Z',
    format: 'Excel',
    createdBy: 'cfo@company.com',
    isDefault: true,
    usageCount: 72,
    sections: ['Optimization Summary', 'MBC Opportunities', 'Link Optimization', 'Provider Optimization', 'Cost Savings', 'Action Plan']
  },
  {
    id: '17',
    name: 'Data Center Provider Report',
    description: 'Comprehensive analysis by data center provider (Cisco Jasper, Equinix, Databank, CoreWeave) with IPE count, connections, Links, VNFs, capacity, and revenue metrics',
    type: 'Performance',
    lastModified: '2024-03-10T12:30:00Z',
    format: 'Excel',
    createdBy: 'infrastructure@company.com',
    isDefault: false,
    usageCount: 46,
    sections: ['Provider Overview', 'Revenue by Provider', 'Cloud Provider On-Ramps', 'Efficiency Metrics', 'Top IPEs', 'Growth Analysis']
  },
  {
    id: '18',
    name: 'Cloud Router Aggregation Dashboard',
    description: 'Cloud Router level analysis showing Links aggregated within each Cloud Router, VNFs per Link, capacity utilization, and optimization opportunities',
    type: 'Performance',
    lastModified: '2024-03-10T09:15:00Z',
    format: 'PDF',
    createdBy: 'netops@company.com',
    isDefault: false,
    usageCount: 54,
    sections: ['Cloud Router Distribution', 'Capacity & Utilization', 'Links per CR', 'VNF Distribution', 'Optimization Opportunities', 'Trends']
  },
  {
    id: '19',
    name: 'Connection Hierarchy Report',
    description: 'Full hierarchy view: Connections > Cloud Routers > Links > VNFs/IPEs with resource distribution, averages at each level, and capacity analysis',
    type: 'Performance',
    lastModified: '2024-03-09T14:45:00Z',
    format: 'PDF',
    createdBy: 'architecture@company.com',
    isDefault: true,
    usageCount: 68,
    sections: ['Hierarchy Overview', 'Resource Distribution', 'Links per Connection', 'VNF Distribution', 'IPE Associations', 'Capacity Analysis']
  },
  {
    id: '20',
    name: 'IPE & Data Center Capacity',
    description: 'IPE capacity analysis by data center provider showing installed capacity, utilization, Links per IPE, VNFs per IPE, and expansion recommendations',
    type: 'Performance',
    lastModified: '2024-03-10T11:00:00Z',
    format: 'Excel',
    createdBy: 'capacity@company.com',
    isDefault: false,
    usageCount: 41,
    sections: ['IPE Capacity', 'Data Center Provider', 'Links per IPE', 'VNFs per IPE', 'Utilization', 'Expansion Planning']
  }
];

export function CustomTemplates() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const getTypeColor = (type: Template['type']) => {
    switch (type) {
      case 'Performance': return 'bg-blue-100 text-blue-800';
      case 'Security': return 'bg-indigo-100 text-indigo-800';
      case 'Usage': return 'bg-green-100 text-green-800';
      case 'Billing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      lastModified: new Date().toISOString(),
      createdBy: 'current-user@company.com',
      isDefault: false,
      usageCount: 0
    };
    setTemplates(prev => [newTemplate, ...prev]);

    window.addToast?.({
      type: 'success',
      title: 'Template Duplicated',
      message: `"${template.name}" has been copied`,
      duration: 3000
    });
  };

  const handleDelete = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) {
      window.addToast?.({
        type: 'error',
        title: 'Cannot Delete',
        message: 'Default templates cannot be deleted',
        duration: 3000
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${template?.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      window.addToast?.({
        type: 'success',
        title: 'Template Deleted',
        message: `"${template?.name}" has been removed`,
        duration: 3000
      });
    }
  };

  const handleDownload = (template: Template) => {
    window.addToast?.({
      type: 'success',
      title: 'Generating Report',
      message: `Creating report using "${template.name}"`,
      duration: 3000
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ['all', 'Performance', 'Security', 'Usage', 'Billing', 'Custom'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create and customize report templates with specific metrics, filters, and layouts
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {templates.length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Default Templates</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {templates.filter(t => t.isDefault).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Custom Templates</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {templates.filter(t => !t.isDefault).length}
              </p>
            </div>
            <Layout className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'card'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-500'
            }`}
            title="Card View"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'table'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-500'
            }`}
            title="Table View"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Templates View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {template.name}
                    </h4>
                    {template.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                {template.type}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {template.format}
              </span>
              <span className="text-xs text-gray-500">
                {template.usageCount} uses
              </span>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Sections included:</div>
              <div className="flex flex-wrap gap-1">
                {template.sections.map((section, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded">
                    {section}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Created by {template.createdBy}</span>
              <span>Modified {new Date(template.lastModified).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  window.addToast?.({
                    type: 'info',
                    title: 'Edit Template',
                    message: `Opening editor for "${template.name}"`,
                    duration: 2000
                  });
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit template"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDuplicate(template)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Duplicate template"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDownload(template)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Generate report"
              >
                <Download className="h-5 w-5" />
              </button>
              {!template.isDefault && (
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload(template)}
                className="ml-auto"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-gray-100 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          {template.isDefault && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.format} • {template.createdBy}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {template.usageCount} uses
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(template.lastModified).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          window.addToast?.({
                            type: 'info',
                            title: 'Edit Template',
                            message: `Opening editor for "${template.name}"`,
                            duration: 2000
                          });
                        }}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(template)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Report Template"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Template builder interface would include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-6">
              <li>Template name and description</li>
              <li>Report type selection</li>
              <li>Output format (PDF, CSV, Excel, JSON)</li>
              <li>Section builder with drag-and-drop</li>
              <li>Metric selector</li>
              <li>Filter configuration</li>
              <li>Layout and styling options</li>
              <li>Preview functionality</li>
            </ul>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowCreateModal(false);
                  window.addToast?.({
                    type: 'success',
                    title: 'Template Created',
                    message: 'Your new report template has been created',
                    duration: 3000
                  });
                }}
              >
                Create Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
