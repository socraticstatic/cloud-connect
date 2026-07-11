import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Activity, Shield, DollarSign, AlertTriangle, Mail, Smartphone, Monitor, CheckCircle, Archive, Trash2, Eye, EyeOff, Volume2, VolumeX, Moon, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { NotificationChannel } from '../../types/notification';
import { Button } from '../common/Button';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences' | 'settings'>('notifications');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const { notifications, preferences, settings, updatePreferences, updateSettings, toggleChannel, markAsRead, markAllAsRead, archiveNotification, deleteNotification } = useStore();

  const categoryConfig = [
    {
      key: 'system' as const,
      title: 'System Notifications',
      icon: Settings,
      description: 'Updates about system maintenance and changes',
      color: 'text-fw-link',
      bgColor: 'bg-fw-blue-light',
      settings: [
        { key: 'maintenance', label: 'Scheduled Maintenance' },
        { key: 'updates', label: 'System Updates' },
        { key: 'performance', label: 'Performance Alerts' },
      ]
    },
    {
      key: 'activity' as const,
      title: 'Activity Notifications',
      icon: Activity,
      description: 'Updates about your network activity',
      color: 'text-fw-success',
      bgColor: 'bg-green-50',
      settings: [
        { key: 'statusChanges', label: 'Connection Status Changes' },
        { key: 'bandwidthAlerts', label: 'Bandwidth Utilization Alerts' },
        { key: 'thresholdAlerts', label: 'Performance Threshold Alerts' },
        { key: 'configChanges', label: 'Configuration Changes' },
      ]
    },
    {
      key: 'security' as const,
      title: 'Security Notifications',
      icon: Shield,
      description: 'Important security-related updates',
      color: 'text-fw-error',
      bgColor: 'bg-red-50',
      settings: [
        { key: 'securityAlerts', label: 'Security Alerts & Warnings' },
        { key: 'compliance', label: 'Compliance Updates' },
        { key: 'accessChanges', label: 'Access Changes' },
        { key: 'patches', label: 'Security Patch Notifications' },
      ]
    },
    {
      key: 'billing' as const,
      title: 'Billing Notifications',
      icon: DollarSign,
      description: 'Updates about billing and payments',
      color: 'text-fw-warn',
      bgColor: 'bg-orange-50',
      settings: [
        { key: 'invoices', label: 'Invoice Notifications' },
        { key: 'paymentFailures', label: 'Payment Failures' },
        { key: 'budgetAlerts', label: 'Budget Alerts' },
        { key: 'usageThresholds', label: 'Usage Threshold Alerts' },
      ]
    },
    {
      key: 'alert' as const,
      title: 'System Alerts',
      icon: AlertTriangle,
      description: 'Critical system alerts and warnings',
      color: 'text-fw-warn',
      bgColor: 'bg-orange-50',
      settings: [
        { key: 'criticalOnly', label: 'Critical Alerts Only' },
      ]
    }
  ];

  const channelIcons = {
    email: <Mail className="h-4 w-4" />,
    sms: <Smartphone className="h-4 w-4" />,
    app: <Bell className="h-4 w-4" />,
    browser: <Monitor className="h-4 w-4" />,
  };

  const handleToggleSetting = (category: keyof typeof preferences, setting: string) => {
    updatePreferences({
      [category]: {
        ...preferences[category],
        [setting]: !preferences[category][setting as keyof typeof preferences[typeof category]],
      },
    });

    window.addToast({
      type: 'success',
      title: 'Preference Updated',
      message: `${categoryConfig.find(c => c.key === category)?.title} preference has been updated`,
      duration: 3000
    });
  };

  const handleToggleCategory = (category: keyof typeof preferences) => {
    updatePreferences({
      [category]: {
        ...preferences[category],
        enabled: !preferences[category].enabled,
      },
    });

    window.addToast({
      type: 'success',
      title: preferences[category].enabled ? 'Category Disabled' : 'Category Enabled',
      message: `${categoryConfig.find(c => c.key === category)?.title} ${preferences[category].enabled ? 'disabled' : 'enabled'}`,
      duration: 3000
    });
  };

  const handleToggleChannel = (category: keyof typeof preferences, channel: NotificationChannel) => {
    toggleChannel(category, channel);

    window.addToast({
      type: 'success',
      title: 'Channel Updated',
      message: `${channel.toUpperCase()} notification channel updated`,
      duration: 3000
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Settings className="h-5 w-5" />;
      case 'activity':
        return <Activity className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'billing':
        return <DollarSign className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications
    .filter(notif => !notif.archived)
    .filter(notif => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'unread') return !notif.read;
      if (filterStatus === 'read') return notif.read;
      return true;
    });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-sm text-gray-600 hover:text-brand-blue mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your notification preferences and delivery channels</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Recent Notifications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                General Settings
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'notifications' && (
            <div>
              {/* Notification Actions Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({notifications.filter(n => !n.archived).length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('unread')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === 'unread'
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus('read')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === 'read'
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Read ({notifications.filter(n => n.read && !n.archived).length})
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                      window.addToast({
                        type: 'success',
                        title: 'All Marked as Read',
                        message: `${unreadCount} notifications marked as read`,
                        duration: 3000
                      });
                    }}
                    className="text-sm text-brand-blue hover:text-brand-darkBlue font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-sm text-gray-500">
                    {filterStatus === 'unread' && 'You have no unread notifications'}
                    {filterStatus === 'read' && 'You have no read notifications'}
                    {filterStatus === 'all' && 'You have no notifications'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                        notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start">
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                          notification.type === 'security' ? 'bg-red-100 text-red-600' :
                          notification.type === 'activity' ? 'bg-green-100 text-green-600' :
                          notification.type === 'billing' ? 'bg-yellow-100 text-yellow-600' :
                          notification.type === 'alert' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                  {notification.title}
                                </h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">{getRelativeTime(notification.timestamp)}</span>
                                {notification.actionUrl && notification.actionLabel && (
                                  <a
                                    href={notification.actionUrl}
                                    className="text-xs text-brand-blue hover:text-brand-darkBlue font-medium"
                                  >
                                    {notification.actionLabel} →
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    window.addToast({
                                      type: 'success',
                                      title: 'Marked as Read',
                                      message: 'Notification marked as read',
                                      duration: 2000
                                    });
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  archiveNotification(notification.id);
                                  window.addToast({
                                    type: 'success',
                                    title: 'Archived',
                                    message: 'Notification archived',
                                    duration: 2000
                                  });
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  deleteNotification(notification.id);
                                  window.addToast({
                                    type: 'success',
                                    title: 'Deleted',
                                    message: 'Notification deleted',
                                    duration: 2000
                                  });
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="absolute top-4 left-0 w-1 h-8 bg-brand-blue rounded-r" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {categoryConfig.map((category) => {
                const Icon = category.icon;
                const categoryPrefs = preferences[category.key];

                return (
                  <div key={category.key} className="border border-gray-200 rounded-lg">
                    {/* Category Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`p-2 ${category.bgColor} rounded-lg mr-4`}>
                            <Icon className={`h-6 w-6 ${category.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={categoryPrefs.enabled}
                            onChange={() => handleToggleCategory(category.key)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>

                      {/* Delivery Channels */}
                      {categoryPrefs.enabled && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Delivery Channels</p>
                          <div className="flex flex-wrap gap-2">
                            {(['email', 'sms', 'app', 'browser'] as NotificationChannel[]).map((channel) => (
                              <button
                                key={channel}
                                onClick={() => handleToggleChannel(category.key, channel)}
                                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  categoryPrefs.channels.includes(channel)
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'
                                }`}
                              >
                                {channelIcons[channel]}
                                <span className="ml-1.5 capitalize">{channel}</span>
                                {categoryPrefs.channels.includes(channel) && (
                                  <CheckCircle className="h-3 w-3 ml-1.5" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Settings */}
                    {categoryPrefs.enabled && (
                      <div className="p-6">
                        <div className="space-y-3">
                          {category.settings.map((setting) => {
                            const isEnabled = categoryPrefs[setting.key as keyof typeof categoryPrefs];
                            return (
                              <div key={setting.key} className="flex items-center justify-between">
                                <label className="text-sm text-gray-700">{setting.label}</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={Boolean(isEnabled)}
                                    onChange={() => handleToggleSetting(category.key, setting.key)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Do Not Disturb */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Moon className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Do Not Disturb</h3>
                      <p className="text-sm text-gray-500 mt-1">Pause all notifications temporarily</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.doNotDisturb}
                      onChange={() => {
                        updateSettings({ doNotDisturb: !settings.doNotDisturb });
                        window.addToast({
                          type: 'success',
                          title: settings.doNotDisturb ? 'DND Disabled' : 'DND Enabled',
                          message: settings.doNotDisturb ? 'Notifications resumed' : 'Notifications paused',
                          duration: 3000
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>
              </div>

              {/* Sound */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    )}
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Notification Sounds</h3>
                      <p className="text-sm text-gray-500 mt-1">Play sound when notifications arrive</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.soundEnabled}
                      onChange={() => {
                        updateSettings({ soundEnabled: !settings.soundEnabled });
                        window.addToast({
                          type: 'success',
                          title: settings.soundEnabled ? 'Sound Disabled' : 'Sound Enabled',
                          message: settings.soundEnabled ? 'Notification sounds muted' : 'Notification sounds enabled',
                          duration: 3000
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>
              </div>

              {/* Browser Notifications */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Monitor className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Browser Notifications</h3>
                      <p className="text-sm text-gray-500 mt-1">Show notifications in your browser</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.browserNotifications}
                      onChange={() => {
                        updateSettings({ browserNotifications: !settings.browserNotifications });
                        window.addToast({
                          type: 'success',
                          title: settings.browserNotifications ? 'Browser Notifications Disabled' : 'Browser Notifications Enabled',
                          message: settings.browserNotifications ? 'Browser notifications turned off' : 'Browser notifications turned on',
                          duration: 3000
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>
              </div>

              {/* Digest */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Notification Digest</h3>
                      <p className="text-sm text-gray-500 mt-1">Receive a summary of notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.digestEnabled}
                      onChange={() => {
                        updateSettings({ digestEnabled: !settings.digestEnabled });
                        window.addToast({
                          type: 'success',
                          title: settings.digestEnabled ? 'Digest Disabled' : 'Digest Enabled',
                          message: settings.digestEnabled ? 'Notification digest turned off' : 'Notification digest turned on',
                          duration: 3000
                        });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>

                {settings.digestEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={settings.digestFrequency}
                      onChange={(e) => {
                        updateSettings({ digestFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' });
                        window.addToast({
                          type: 'success',
                          title: 'Digest Frequency Updated',
                          message: `Digest will be sent ${e.target.value}`,
                          duration: 3000
                        });
                      }}
                      className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
