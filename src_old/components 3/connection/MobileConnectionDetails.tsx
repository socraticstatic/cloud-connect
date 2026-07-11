import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Activity, TrendingUp, Clock, MapPin, Globe,
  ChevronDown, ChevronUp, Menu, MoreVertical, Play, Pause,
  Trash2, Edit2, Network, Settings, DollarSign
} from 'lucide-react';
import { Connection } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatMobileDate, formatMobileBandwidth } from '../../utils/mobileHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface MobileConnectionDetailsProps {
  connection: Connection;
}

export function MobileConnectionDetails({ connection }: MobileConnectionDetailsProps) {
  const navigate = useNavigate();
  const updateConnection = useStore(state => state.updateConnection);
  const removeConnection = useStore(state => state.removeConnection);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    performance: true,
    configuration: false,
    billing: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDelete = () => {
    removeConnection(connection.id);
    window.addToast({
      type: 'success',
      title: 'Connection Deleted',
      message: `${connection.name} has been deleted`,
      duration: 3000
    });
    navigate('/manage');
  };

  const handleToggleStatus = () => {
    const newStatus = connection.status === 'active' ? 'inactive' : 'active';
    updateConnection({
      ...connection,
      status: newStatus
    });
    window.addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Connection ${newStatus}`,
      duration: 2000
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{connection.name}</h1>
              <p className="text-sm text-gray-500 truncate">{connection.provider}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 ml-2"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <StatusBadge status={connection.status} size="md" />
          <span className="text-sm text-gray-500">
            Updated {formatMobileDate(connection.lastUpdated || new Date())}
          </span>
        </div>
      </div>

      {/* Actions Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  handleToggleStatus();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {connection.status === 'active' ? (
                  <Pause className="h-5 w-5 text-gray-400 mr-3" />
                ) : (
                  <Play className="h-5 w-5 text-gray-400 mr-3" />
                )}
                <span>{connection.status === 'active' ? 'Pause Connection' : 'Activate Connection'}</span>
              </button>

              <button
                onClick={() => {
                  navigate(`/connections/${connection.id}/edit`);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Edit2 className="h-5 w-5 text-gray-400 mr-3" />
                <span>Edit Connection</span>
              </button>

              <button
                onClick={() => {
                  navigate('/monitor', { state: { selectedConnection: connection.id } });
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Activity className="h-5 w-5 text-gray-400 mr-3" />
                <span>View Monitoring</span>
              </button>

              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center p-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-5 w-5 mr-3" />
                <span>Delete Connection</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium text-gray-500">Bandwidth</h3>
              <Activity className="h-4 w-4 text-brand-blue" />
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {formatMobileBandwidth(connection.bandwidth)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-medium text-gray-500">Utilization</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {connection.utilization?.toFixed(0) || 0}%
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('details')}
          >
            <div className="flex items-center">
              <Network className="h-5 w-5 text-brand-blue mr-2" />
              <h3 className="text-base font-medium text-gray-900">Connection Details</h3>
            </div>
            {expandedSections.details ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900">{connection.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Provider</span>
                    <span className="text-sm font-medium text-gray-900">{connection.provider}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm font-medium text-gray-900">{connection.location}</span>
                  </div>
                  {connection.vlan && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">VLAN</span>
                      <span className="text-sm font-medium text-gray-900">{connection.vlan}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(connection.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('performance')}
          >
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-brand-blue mr-2" />
              <h3 className="text-base font-medium text-gray-900">Performance</h3>
            </div>
            {expandedSections.performance ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.performance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Latency</span>
                      <span className="text-sm font-medium text-gray-900">
                        {connection.latency || 'N/A'} ms
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Packet Loss</span>
                      <span className="text-sm font-medium text-gray-900">
                        {connection.packetLoss || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-500">Uptime</span>
                      <span className="text-sm font-medium text-gray-900">99.9%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/monitor', { state: { selectedConnection: connection.id } })}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    View Detailed Metrics
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('configuration')}
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-brand-blue mr-2" />
              <h3 className="text-base font-medium text-gray-900">Configuration</h3>
            </div>
            {expandedSections.configuration ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.configuration && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Advanced configuration options are available on desktop.
                  </p>
                  <button
                    onClick={() => {
                      window.addToast({
                        type: 'info',
                        title: 'Desktop Only',
                        message: 'This feature is optimized for desktop viewing',
                        duration: 3000
                      });
                    }}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    View on Desktop
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)} />
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="relative bg-white rounded-t-2xl sm:rounded-lg p-6 m-0 sm:m-4 w-full sm:max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Connection?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{connection.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
