import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  animate?: boolean;
}

const variantStyles = {
  default: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    hoverBorder: 'hover:border-gray-200',
    hoverBg: 'hover:bg-gray-50/30'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBorder: 'hover:border-green-200',
    hoverBg: 'hover:bg-green-50/30'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hoverBorder: 'hover:border-amber-200',
    hoverBg: 'hover:bg-amber-50/30'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    hoverBorder: 'hover:border-red-200',
    hoverBg: 'hover:bg-red-50/30'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-200',
    hoverBg: 'hover:bg-blue-50/30'
  }
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  variant = 'default',
  animate = true
}: MetricCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div className="relative group">
      <div className={`flex flex-col items-center p-3 ${styles.bg} rounded-lg border ${styles.border} transition-all duration-200 ${styles.hoverBorder} ${styles.hoverBg}`}>
        <div className={`p-2 ${styles.iconBg} rounded-lg mb-2 ${animate ? 'group-hover:scale-110' : ''} transition-transform duration-200`}>
          <Icon className={`h-4 w-4 ${styles.iconColor}`} />
        </div>
        <div className="text-base font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {subtitle && (
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
}
