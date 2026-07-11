import { LucideIcon } from 'lucide-react';

interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function QuickStatCard({ title, value, icon: Icon, variant = 'default' }: QuickStatCardProps) {
  const variantColors = {
    default: 'text-gray-400',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className={`h-5 w-5 ${variantColors[variant]}`} />
      </div>
      <p className="text-lg font-medium text-gray-900">{value}</p>
    </div>
  );
}
