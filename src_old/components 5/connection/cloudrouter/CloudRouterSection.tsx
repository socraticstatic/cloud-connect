import { useState } from 'react';
import { Plus, GitBranch } from 'lucide-react';
import { Button } from '../../common/Button';
import { CloudRouter } from '../../../types/cloudrouter';
import { CloudRouterTable } from './CloudRouterTable';
import { VNF } from '../../../types/vnf';
import { Connection } from '../../../types';

interface CloudRouterSectionProps {
  cloudRouters: CloudRouter[];
  vnfs?: VNF[];
  onAdd: () => void;
  onEdit: (cloudRouter: CloudRouter) => void;
  onDelete: (cloudRouter: CloudRouter) => void;
  connectionId: string;
  connection?: Connection;
}

export function CloudRouterSection({
  cloudRouters,
  vnfs = [],
  onAdd,
  onEdit,
  onDelete,
  connection
}: CloudRouterSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate bandwidth usage
  const calculateTotalUsedBandwidth = () => {
    let totalUsed = 0;
    cloudRouters.forEach(router => {
      if (router.links && router.links.length > 0) {
        router.links.forEach(link => {
          if (link.bandwidth) {
            const bandwidthMatch = link.bandwidth.match(/(\d+(\.\d+)?)/);
            if (bandwidthMatch) {
              totalUsed += parseFloat(bandwidthMatch[0]);
            }
          }
        });
      }
    });
    return totalUsed;
  };

  const getConnectionBandwidth = (): string => {
    return connection?.bandwidth || '10 Gbps';
  };

  const totalUsedBandwidth = calculateTotalUsedBandwidth();
  const connectionBandwidthValue = parseFloat(getConnectionBandwidth().replace(/[^\d.]/g, ''));
  const availableBandwidth = connectionBandwidthValue - totalUsedBandwidth;

  // Filter cloud routers
  const filteredCloudRouters = cloudRouters.filter(router => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      router.name.toLowerCase().includes(searchLower) ||
      router.description?.toLowerCase().includes(searchLower) ||
      router.location?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cloud Routers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage cloud routers and their network configurations
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={onAdd}
        >
          Add Cloud Router
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Active Cloud Routers</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {cloudRouters.filter(r => r.status === 'active').length}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Total Links</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {cloudRouters.reduce((sum, r) => sum + (r.links?.length || 0), 0)}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Bandwidth</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {availableBandwidth.toFixed(1)} <span className="text-sm font-normal">Gbps free</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">{totalUsedBandwidth.toFixed(1)} used</p>
              <p className="text-xs text-gray-600">{getConnectionBandwidth()} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search routers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {filteredCloudRouters.length === 0 ? (
          <div className="text-center py-16">
            <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No routers found' : 'No cloud routers'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first cloud router'}
            </p>
            {!searchQuery && (
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
                Add Cloud Router
              </Button>
            )}
          </div>
        ) : (
          <CloudRouterTable
            cloudRouters={filteredCloudRouters}
            vnfs={vnfs}
            onEdit={onEdit}
            onDelete={onDelete}
            connectionBandwidth={getConnectionBandwidth()}
            usedBandwidth={totalUsedBandwidth}
          />
        )}
      </div>
    </div>
  );
}
