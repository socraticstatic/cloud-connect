interface StatusBadgeProps {
  status: 'active' | 'Active' | 'inactive' | 'Inactive' | 'suspended' | 'Suspended' | 'Pending' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const statusStyles = {
    active: 'bg-green-50 text-fw-success border-fw-success',
    inactive: 'bg-fw-wash text-fw-body border-fw-secondary',
    suspended: 'bg-red-50 text-fw-error border-fw-error',
    pending: 'bg-orange-50 text-fw-warn border-fw-warn'
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending'
  };

  const style = statusStyles[normalizedStatus as keyof typeof statusStyles] || statusStyles.inactive;
  const label = statusLabels[normalizedStatus as keyof typeof statusLabels] || status;

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium border ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        normalizedStatus === 'active' ? 'bg-fw-green-600' :
        normalizedStatus === 'inactive' ? 'bg-fw-gray-500' :
        normalizedStatus === 'suspended' ? 'bg-fw-red-600' :
        'bg-fw-orange-600'
      }`} />
      {label}
    </span>
  );
}
