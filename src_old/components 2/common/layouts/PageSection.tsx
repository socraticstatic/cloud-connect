import { ReactNode } from 'react';

interface PageSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

function PageSection({
  title,
  description,
  action,
  className = '',
  children
}: PageSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}