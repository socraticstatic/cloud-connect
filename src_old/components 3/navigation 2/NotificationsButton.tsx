import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Activity, Shield, Clock } from 'lucide-react';

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
      message: 'New AWS Direct Connect connection has been created',
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
          bg: 'bg-[#e6f6fd]',
          text: 'text-[#009fdb]',
          icon: 'text-[#009fdb]',
          hover: 'hover:bg-[#ccedfa]'
        };
      case 'security':
        return {
          bg: 'bg-[#fef2f2]',
          text: 'text-[#dc2626]',
          icon: 'text-[#dc2626]',
          hover: 'hover:bg-[#fee2e2]'
        };
      case 'system':
        return {
          bg: 'bg-[#f3f4f6]',
          text: 'text-[#4b5563]',
          icon: 'text-[#4b5563]',
          hover: 'hover:bg-[#e5e7eb]'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          icon: 'text-gray-500',
          hover: 'hover:bg-gray-100'
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
        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-[#dc2626] text-white rounded-full">
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

          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1f2937]">Notifications</h3>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                const styles = getTypeStyles(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 transition-colors cursor-pointer ${styles.hover}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${styles.bg}`}>
                        <Icon className={`h-4 w-4 ${styles.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${styles.text}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#f9fafb]">
              <button
                className="w-full text-center text-sm text-[#009fdb] hover:text-[#007fb0] font-medium transition-colors"
                onClick={handleViewAll}
              >
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}