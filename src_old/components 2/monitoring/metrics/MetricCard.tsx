import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  status: 'success' | 'warning' | 'error';
  description: string;
  chart: ReactNode;
}

export function MetricCard({ title, value, icon, status, description, chart }: MetricCardProps) {
  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-2 rounded-lg ${
          status === 'success' ? 'bg-green-50' : 
          status === 'warning' ? 'bg-yellow-50' : 
          'bg-red-50'
        }`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center space-x-3 mb-4 px-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="h-24 w-full px-4 pb-4">
        {chart}
      </div>
    </div>
  );
}