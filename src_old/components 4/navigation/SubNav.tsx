import { ReactNode } from 'react';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface SubNavProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    to?: string;
  };
  children?: ReactNode;
}

export function SubNav({ title, description, action, children }: SubNavProps) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (action?.to) {
      navigate(action.to);
    } else if (action?.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="bg-fw-base border-b border-fw-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fw-heading">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-fw-bodyLight">{description}</p>
              )}
            </div>
            {action && (
              <Button
                variant="primary"
                icon={action.icon ? undefined : PlusCircle}
                onClick={handleActionClick}
              >
                {action.icon && action.icon}
                {action.label}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}