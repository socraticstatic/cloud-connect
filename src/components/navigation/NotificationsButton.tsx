import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Clock } from 'lucide-react';
import { AttIcon } from '../icons/AttIcon';

interface Notification {
  id: string;
  type: 'activity' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: string;
}

export function NotificationsButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'activity',
      title: 'Connection Created',
      message: 'New AWS Interconnect – last mile connection has been created',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
    },
    {
      id: '2',
      type: 'security',
      title: 'Security Alert',
      message: 'Unusual traffic pattern detected on Azure ExpressRoute',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
    },
    {
      id: '3',
      type: 'system',
      title: 'System Update',
      message: 'Scheduled maintenance in 48 hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    }
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'activity':
        return Activity;
      case 'security':
        return Shield;
      case 'system':
        return Clock;
      default:
        return Bell;
    }
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'activity':
        return {
          bg: 'bg-fw-accent',
          text: 'text-brand-accent',
          icon: 'text-brand-accent',
          hover: 'hover:bg-fw-accent'
        };
      case 'security':
        return {
          bg: 'bg-fw-error/15',
          text: 'text-fw-error',
          icon: 'text-fw-error',
          hover: 'hover:bg-fw-error/10'
        };
      case 'system':
        return {
          bg: 'bg-fw-neutral',
          text: 'text-fw-body',
          icon: 'text-fw-body',
          hover: 'hover:bg-fw-wash'
        };
      default:
        return {
          bg: 'bg-fw-wash',
          text: 'text-fw-body',
          icon: 'text-fw-bodyLight',
          hover: 'hover:bg-fw-neutral'
        };
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/monitor', { state: { defaultTab: 'logs' } });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-9 w-9 text-fw-heading hover:text-fw-body transition-colors duration-200 relative"
      >
        <AttIcon name="bell" className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 text-figma-sm flex items-center justify-center bg-fw-error text-white rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-96 bg-fw-base rounded-lg shadow-lg border border-fw-secondary z-50">
            <div className="p-4 border-b border-fw-secondary">
              <h3 className="text-lg font-semibold text-fw-heading tracking-[-0.03em]">Notifications</h3>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const styles = getTypeStyles(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-fw-secondary transition-colors cursor-pointer ${styles.hover}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${styles.bg}`}>
                        <Icon className={`h-4 w-4 ${styles.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-figma-base font-medium ${styles.text}`}>
                          {notification.title}
                        </p>
                        <p className="text-figma-base text-fw-bodyLight mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-figma-sm text-fw-bodyLight mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-fw-secondary bg-fw-wash flex items-center justify-between">
              <button
                className="tab-button text-figma-base text-fw-link hover:text-fw-linkHover font-medium transition-colors"
                onClick={handleViewAll}
              >
                View All Notifications
              </button>
              <button
                className="tab-button text-figma-base text-fw-link hover:text-fw-linkHover font-medium transition-colors"
                onClick={() => { setIsOpen(false); navigate('/news'); }}
              >
                News & Announcements
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}