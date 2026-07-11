import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Building, Shield, Edit3, Camera, CheckCircle, Save, X, Home, Settings, BarChart2, Network, Cpu, Globe, Link2, Type, Users, UserCheck, Eye, FileText } from 'lucide-react';
import { UserIcon } from '../common/UserIcon';
import { Button } from '../common/Button';
import { useStore } from '../../store/useStore';
import { FONT_SIZES } from '../../store/slices/fontSizeSlice';
import { UserRole } from '../../store/slices/roleSlice';
import { RoleCapabilityMatrix } from '../common/RoleCapabilityMatrix';
import { AuditLogPanel } from '../common/AuditLogPanel';
import { PermissionBadge } from '../common/PermissionBadge';
import { ResourceFilterBadge } from '../common/ResourceFilterBadge';
import { permissionChecker } from '../../utils/permissionChecker';

export function UserProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Font size and role from store
  const { fontSize, setFontSize, currentRole, setRole, startImpersonation, impersonation } = useStore();

  // Mock users for impersonation
  const mockUsers = [
    { id: '1', name: 'John Smith', email: 'john.smith@att.com', role: 'user' as UserRole },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@att.com', role: 'admin' as UserRole },
    { id: '3', name: 'Michael Chen', email: 'michael.chen@att.com', role: 'user' as UserRole },
    { id: '4', name: 'Emily Rodriguez', email: 'emily.rodriguez@att.com', role: 'user' as UserRole },
    { id: '5', name: 'David Kim', email: 'david.kim@att.com', role: 'admin' as UserRole },
  ];

  const [selectedImpersonationUser, setSelectedImpersonationUser] = useState<string>('');

  const [formData, setFormData] = useState({
    name: 'Emilio Estevez',
    email: 'emilio.estevez@att.com',
    phone: '(555) 123-4567',
    company: 'AT&T',
    department: 'Cloud Solutions',
    role: 'Administrator'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    passwordLastChanged: '2023-12-15',
    sessionTimeout: 30,
    notificationPreferences: {
      email: true,
      sms: false,
      app: true
    }
  });

  const [businessCenterIntegration, setBusinessCenterIntegration] = useState({
    enabled: false,
    username: 'eestevez',
    lastSync: null as string | null,
    syncStatus: 'Not connected' as 'Not connected' | 'Connected' | 'Syncing' | 'Error'
  });

  // User preferences
  const [preferences, setPreferences] = useState({
    landingPage: 'manage', // Default landing page
    theme: 'light',
    language: 'en-US',
    dataRefreshRate: '15m'
  });

  const refreshRateOptions = [
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' }
  ];

  const landingPageOptions = [
    { value: 'manage', label: 'Manage Connections', icon: <Network className="h-5 w-5 text-brand-blue" /> },
    { value: 'monitor', label: 'Monitoring Dashboard', icon: <BarChart2 className="h-5 w-5 text-brand-blue" /> },
    { value: 'configure', label: 'System Configuration', icon: <Settings className="h-5 w-5 text-brand-blue" /> },
    { value: 'marketplace', label: 'Marketplace', icon: <Globe className="h-5 w-5 text-brand-blue" /> },
    { value: 'control-center', label: 'Insights', icon: <Cpu className="h-5 w-5 text-brand-blue" /> }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));

    // In a real app, this would save to backend/localStorage
    if (name === 'landingPage') {
      window.addToast({
        type: 'success',
        title: 'Landing Page Updated',
        message: `Your default landing page has been set to ${landingPageOptions.find(opt => opt.value === value)?.label}`,
        duration: 3000
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save logic would go here
      window.addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        duration: 3000
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-fw-base rounded-lg shadow">
        {/* Profile Header */}
        <div className="px-6 py-8 border-b border-fw-secondary">
          <div className="flex items-start">
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={profileImage} 
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-blue text-white shadow-lg"
                aria-label="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="ml-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-fw-heading">{formData.name}</h1>
                  <p className="text-sm text-fw-bodyLight">{formData.role} at {formData.company}</p>
                </div>
                <Button
                  variant="primary"
                  icon={isEditing ? Save : Edit3}
                  onClick={handleEditToggle}
                  className="ml-auto"
                >
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-fw-bodyLight">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center text-sm text-fw-bodyLight">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center text-sm text-fw-bodyLight">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{formData.department}</span>
                </div>
                <div className="flex items-center text-sm text-fw-bodyLight">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{securitySettings.twoFactorEnabled ? 'Two-factor enabled' : 'Two-factor disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-medium text-fw-heading mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-fw-body mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-fw-body mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-fw-body mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-fw-body mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* User Preferences - New Section */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-fw-heading">User Preferences</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: 'Preferences',
                  message: 'Your preferences have been updated',
                  duration: 3000
                });
              }}
            >
              Save Preferences
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Landing Page Selection */}
            <div>
              <label className="block text-sm font-medium text-fw-body mb-3">
                Default Landing Page
              </label>
              <div className="space-y-2">
                {landingPageOptions.map(option => (
                  <div 
                    key={option.value}
                    className={`
                      relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${preferences.landingPage === option.value 
                        ? 'border-brand-blue bg-brand-lightBlue' 
                        : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                      }
                    `}
                    onClick={() => handlePreferenceChange('landingPage', option.value)}
                  >
                    <div className={`
                      p-2 rounded-full
                      ${preferences.landingPage === option.value ? 'bg-brand-blue' : 'bg-gray-100'}
                    `}>
                      {option.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`
                        text-sm font-medium 
                        ${preferences.landingPage === option.value ? 'text-brand-blue' : 'text-fw-heading'}
                      `}>
                        {option.label}
                      </p>
                      <p className="text-xs text-fw-bodyLight mt-1">
                        Set as default page on login
                      </p>
                    </div>
                    {preferences.landingPage === option.value && (
                      <div className="absolute right-4">
                        <CheckCircle className="h-5 w-5 text-brand-blue" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Other Preferences */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-fw-body mb-1">
                  Theme
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.theme === 'light'}
                      onChange={() => handlePreferenceChange('theme', 'light')}
                      className="h-4 w-4 text-brand-blue border-gray-300 focus:ring-brand-blue"
                    />
                    <span className="ml-2 text-sm text-fw-body">Light</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.theme === 'dark'}
                      onChange={() => handlePreferenceChange('theme', 'dark')}
                      className="h-4 w-4 text-brand-blue border-gray-300 focus:ring-brand-blue"
                    />
                    <span className="ml-2 text-sm text-fw-body">Dark</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={preferences.theme === 'system'}
                      onChange={() => handlePreferenceChange('theme', 'system')}
                      className="h-4 w-4 text-brand-blue border-gray-300 focus:ring-brand-blue"
                    />
                    <span className="ml-2 text-sm text-fw-body">System</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-fw-body mb-1">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fw-body mb-1">
                  Data Refresh Rate
                </label>
                <select
                  value={preferences.dataRefreshRate}
                  onChange={(e) => handlePreferenceChange('dataRefreshRate', e.target.value)}
                  className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                >
                  {refreshRateOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-fw-bodyLight">
                  How often monitoring data should be refreshed automatically
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Font Size Settings */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-fw-heading">Font Size</h2>
              <p className="text-sm text-fw-bodyLight mt-1">Adjust text size for better readability</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-fw-bodyLight">
              <Type className="h-4 w-4" />
              <span>Currently: {fontSize}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Small */}
            <div
              onClick={() => setFontSize(FONT_SIZES.SMALL)}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all
                ${fontSize === FONT_SIZES.SMALL
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Type className={`h-6 w-6 mb-3 ${fontSize === FONT_SIZES.SMALL ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${fontSize === FONT_SIZES.SMALL ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Small
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">87.5% (14px)</p>
              {fontSize === FONT_SIZES.SMALL && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>

            {/* Normal */}
            <div
              onClick={() => setFontSize(FONT_SIZES.NORMAL)}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all
                ${fontSize === FONT_SIZES.NORMAL
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Type className={`h-7 w-7 mb-3 ${fontSize === FONT_SIZES.NORMAL ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${fontSize === FONT_SIZES.NORMAL ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Normal
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">100% (16px)</p>
              {fontSize === FONT_SIZES.NORMAL && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>

            {/* Large */}
            <div
              onClick={() => setFontSize(FONT_SIZES.LARGE)}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all
                ${fontSize === FONT_SIZES.LARGE
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Type className={`h-8 w-8 mb-3 ${fontSize === FONT_SIZES.LARGE ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${fontSize === FONT_SIZES.LARGE ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Large
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">112.5% (18px)</p>
              {fontSize === FONT_SIZES.LARGE && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>

            {/* Extra Large */}
            <div
              onClick={() => setFontSize(FONT_SIZES.EXTRA_LARGE)}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all
                ${fontSize === FONT_SIZES.EXTRA_LARGE
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Type className={`h-9 w-9 mb-3 ${fontSize === FONT_SIZES.EXTRA_LARGE ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${fontSize === FONT_SIZES.EXTRA_LARGE ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Extra Large
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">125% (20px)</p>
              {fontSize === FONT_SIZES.EXTRA_LARGE && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-brand-lightBlue/30 rounded-lg border border-brand-blue/20">
            <div className="flex items-start space-x-3">
              <Type className="h-5 w-5 text-brand-blue mt-0.5" />
              <div>
                <p className="text-sm text-fw-heading font-medium">Accessibility Feature</p>
                <p className="text-xs text-fw-bodyLight mt-1">
                  Font size preference is saved and will apply across all pages. Changes sync automatically across all open tabs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-fw-heading">Security Settings</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.addToast({
                  type: 'info',
                  title: 'Security Settings',
                  message: 'Security settings page coming soon',
                  duration: 3000
                });
              }}
            >
              Manage Security
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">Two-factor Authentication</h3>
                <p className="text-xs text-fw-bodyLight">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center">
                {securitySettings.twoFactorEnabled ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: true
                      });
                    }}
                  >
                    Enable
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">Password</h3>
                <p className="text-xs text-fw-bodyLight">
                  Last changed {new Date(securitySettings.passwordLastChanged).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.addToast({
                    type: 'info',
                    title: 'Change Password',
                    message: 'Password change dialog coming soon',
                    duration: 3000
                  });
                }}
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">Session Timeout</h3>
                <p className="text-xs text-fw-bodyLight">
                  Your session will timeout after {securitySettings.sessionTimeout} minutes of inactivity
                </p>
              </div>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => {
                  const newTimeout = parseInt(e.target.value);
                  if (newTimeout >= 15) {
                    setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: newTimeout
                    });
                    window.addToast({
                      type: 'success',
                      title: 'Session Timeout Updated',
                      message: `Session timeout set to ${newTimeout} minutes`,
                      duration: 3000
                    });
                  }
                }}
                className="rounded-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
                <option value={180}>180 minutes</option>
                <option value={240}>240 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Center Integration */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-fw-heading">Business Center Integration</h2>
              <p className="text-sm text-fw-bodyLight mt-1">Connect to AT&T Business Center for unified account management</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={businessCenterIntegration.enabled}
                onChange={() => {
                  const newEnabled = !businessCenterIntegration.enabled;
                  setBusinessCenterIntegration({
                    ...businessCenterIntegration,
                    enabled: newEnabled,
                    syncStatus: newEnabled ? 'Connected' : 'Not connected',
                    lastSync: newEnabled ? new Date().toISOString() : null
                  });
                  window.addToast({
                    type: newEnabled ? 'success' : 'info',
                    title: `Business Center ${newEnabled ? 'Connected' : 'Disconnected'}`,
                    message: newEnabled
                      ? 'Your profile is now synced with Business Center'
                      : 'Business Center integration has been disabled',
                    duration: 3000
                  });
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fw-base after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
            </label>
          </div>

          {businessCenterIntegration.enabled && (
            <div className="space-y-4 bg-brand-lightBlue/30 p-4 rounded-lg border border-brand-blue/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-brand-blue rounded-lg">
                    <Link2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-fw-heading">Connection Status</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        businessCenterIntegration.syncStatus === 'Connected'
                          ? 'bg-green-100 text-green-800'
                          : businessCenterIntegration.syncStatus === 'Syncing'
                          ? 'bg-blue-100 text-blue-800'
                          : businessCenterIntegration.syncStatus === 'Error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {businessCenterIntegration.syncStatus}
                      </span>
                    </div>
                    <p className="text-xs text-fw-bodyLight mt-1">
                      {businessCenterIntegration.lastSync
                        ? `Last synced: ${new Date(businessCenterIntegration.lastSync).toLocaleString()}`
                        : 'Not yet synced'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusinessCenterIntegration({
                      ...businessCenterIntegration,
                      syncStatus: 'Syncing',
                    });
                    setTimeout(() => {
                      setBusinessCenterIntegration({
                        ...businessCenterIntegration,
                        syncStatus: 'Connected',
                        lastSync: new Date().toISOString()
                      });
                      window.addToast({
                        type: 'success',
                        title: 'Sync Complete',
                        message: 'Your profile data has been synchronized with Business Center',
                        duration: 3000
                      });
                    }, 2000);
                  }}
                >
                  Sync Now
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-brand-blue/20">
                <div>
                  <label className="block text-sm font-medium text-fw-body mb-1">
                    Business Center Username
                  </label>
                  <input
                    type="text"
                    value={businessCenterIntegration.username}
                    onChange={(e) => setBusinessCenterIntegration({
                      ...businessCenterIntegration,
                      username: e.target.value
                    })}
                    className="rounded-full w-full border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue text-sm"
                    placeholder="Enter Business Center username"
                  />
                  <p className="mt-1 text-xs text-fw-bodyLight">
                    Your AT&T Business Center account username
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-fw-body mb-1">
                    Password
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="rounded-full w-full border-gray-300 shadow-sm bg-fw-wash text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.addToast({
                          type: 'info',
                          title: 'Update Password',
                          message: 'Password update dialog coming soon',
                          duration: 3000
                        });
                      }}
                    >
                      Update
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-fw-bodyLight">
                    Securely stored and encrypted
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-blue/20">
                <h4 className="text-sm font-medium text-fw-heading mb-2">Synchronized Data</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    Account Info
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    Billing Data
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    Service Status
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    Support Tickets
                  </div>
                </div>
              </div>
            </div>
          )}

          {!businessCenterIntegration.enabled && (
            <div className="bg-fw-wash p-4 rounded-lg border border-fw-secondary">
              <p className="text-sm text-gray-600">
                Enable Business Center integration to access unified account management, billing data synchronization, and streamlined support workflows.
              </p>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-fw-heading">Notification Preferences</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              Manage Notifications
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-fw-secondary">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">Email Notifications</h3>
                <p className="text-xs text-fw-bodyLight">Get updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={securitySettings.notificationPreferences.email}
                  onChange={() => {
                    setSecuritySettings({
                      ...securitySettings,
                      notificationPreferences: {
                        ...securitySettings.notificationPreferences,
                        email: !securitySettings.notificationPreferences.email
                      }
                    });
                  }}
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fw-base after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-fw-secondary">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">SMS Notifications</h3>
                <p className="text-xs text-fw-bodyLight">Get updates via text message</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={securitySettings.notificationPreferences.sms}
                  onChange={() => {
                    setSecuritySettings({
                      ...securitySettings,
                      notificationPreferences: {
                        ...securitySettings.notificationPreferences,
                        sms: !securitySettings.notificationPreferences.sms
                      }
                    });
                  }}
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fw-base after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-fw-secondary">
              <div>
                <h3 className="text-sm font-medium text-fw-heading">App Notifications</h3>
                <p className="text-xs text-fw-bodyLight">Get in-app notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="sr-only peer"
                  checked={securitySettings.notificationPreferences.app}
                  onChange={() => {
                    setSecuritySettings({
                      ...securitySettings,
                      notificationPreferences: {
                        ...securitySettings.notificationPreferences,
                        app: !securitySettings.notificationPreferences.app
                      }
                    });
                  }}
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fw-base after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
              </label>
            </div>
          </div>
        </div>

        {/* RBAC Information */}
        <div className="px-6 py-6 border-t border-fw-secondary">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-fw-link" />
              <div>
                <h2 className="text-lg font-medium text-fw-heading">Access Control</h2>
                <p className="text-sm text-fw-bodyLight">Your current role and permissions</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setShowPermissionMatrix(true)}
            >
              View Details
            </Button>
          </div>

          <div className="space-y-4">
            {/* Current Role */}
            <div className="flex items-center justify-between p-4 bg-fw-wash rounded-lg border border-fw-secondary">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-fw-link" />
                <div>
                  <p className="text-xs font-medium text-fw-bodyLight uppercase tracking-wide">Current Role</p>
                  <p className="text-base font-semibold text-fw-heading capitalize mt-0.5">
                    {currentRole.replace('-', ' ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-fw-bodyLight">
                  {currentRole === 'super-admin' && 'Platform Administrator'}
                  {currentRole === 'admin' && 'Tenant Administrator'}
                  {currentRole === 'user' && 'Standard User'}
                </p>
              </div>
            </div>

            {/* Resource Scope */}
            <div className="flex items-center justify-between p-4 bg-fw-wash rounded-lg border border-fw-secondary">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-fw-link" />
                <div>
                  <p className="text-xs font-medium text-fw-bodyLight uppercase tracking-wide">Resource Scope</p>
                  <div className="mt-1">
                    <ResourceFilterBadge filter={permissionChecker.getDefaultScope(currentRole)} showIcon={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Permissions */}
            <div className="p-4 bg-fw-wash rounded-lg border border-fw-secondary">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-fw-link" />
                <p className="text-xs font-medium text-fw-bodyLight uppercase tracking-wide">Key Permissions</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fw-body">Connections</span>
                  <div className="flex gap-2">
                    <PermissionBadge requirement={{ permission: 'view', resource: 'connection' }} variant="compact" showTooltip={false} />
                    <PermissionBadge requirement={{ permission: 'edit', resource: 'connection' }} variant="compact" showTooltip={false} />
                    <PermissionBadge requirement={{ permission: 'delete', resource: 'connection' }} variant="compact" showTooltip={false} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fw-body">Pools</span>
                  <div className="flex gap-2">
                    <PermissionBadge requirement={{ permission: 'view', resource: 'pool' }} variant="compact" showTooltip={false} />
                    <PermissionBadge requirement={{ permission: 'create', resource: 'pool' }} variant="compact" showTooltip={false} />
                    <PermissionBadge requirement={{ permission: 'edit', resource: 'pool' }} variant="compact" showTooltip={false} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fw-body">Billing</span>
                  <div className="flex gap-2">
                    <PermissionBadge requirement={{ permission: 'view', resource: 'billing' }} variant="compact" showTooltip={false} />
                    <PermissionBadge requirement={{ permission: 'edit', resource: 'billing' }} variant="compact" showTooltip={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Simulator - Only for Demo/Testing */}
        <div className="px-6 py-6 border-t border-fw-secondary bg-gradient-to-br from-fw-wash to-fw-base">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-fw-heading">Role Simulator</h2>
              <p className="text-sm text-fw-bodyLight mt-1">Switch between roles to preview different user experiences</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => setShowPermissionMatrix(true)}
              >
                View Permissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FileText}
                onClick={() => setShowAuditLog(true)}
              >
                Audit Log
              </Button>
              <div className="flex items-center space-x-2 px-3 py-1 bg-fw-base rounded-full border border-fw-secondary">
                <Users className="h-4 w-4 text-fw-bodyLight" />
                <span className="text-xs font-medium text-fw-body">Demo Mode</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setRole('super-admin')}
              className={`
                relative flex flex-col items-start p-6 rounded-lg border-2 cursor-pointer transition-all
                ${currentRole === 'super-admin'
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Shield className={`h-8 w-8 mb-3 ${currentRole === 'super-admin' ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-base font-medium ${currentRole === 'super-admin' ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Super Admin
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">Manage all tenants and platform</p>
              {currentRole === 'super-admin' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>

            <div
              onClick={() => setRole('admin')}
              className={`
                relative flex flex-col items-start p-6 rounded-lg border-2 cursor-pointer transition-all
                ${currentRole === 'admin'
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <Settings className={`h-8 w-8 mb-3 ${currentRole === 'admin' ? 'text-brand-blue' : 'text-gray-400'}`} />
              <p className={`text-base font-medium ${currentRole === 'admin' ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Tenant Admin
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">Manage tenant resources and users</p>
              {currentRole === 'admin' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>

            <div
              onClick={() => setRole('user')}
              className={`
                relative flex flex-col items-start p-6 rounded-lg border-2 cursor-pointer transition-all
                ${currentRole === 'user'
                  ? 'border-brand-blue bg-brand-lightBlue shadow-md'
                  : 'border-fw-secondary hover:border-brand-blue/30 hover:bg-brand-lightBlue/20'
                }
              `}
            >
              <UserIcon size="lg" variant={currentRole === 'user' ? 'primary' : 'muted'} className="mb-3" />
              <p className={`text-base font-medium ${currentRole === 'user' ? 'text-brand-blue' : 'text-fw-heading'}`}>
                Standard User
              </p>
              <p className="text-xs text-fw-bodyLight mt-1">View and manage connections</p>
              {currentRole === 'user' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Impersonation - Only visible to admins */}
        {(currentRole === 'admin' || currentRole === 'super-admin') && (
          <div className="px-6 py-6 border-t border-fw-secondary">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-fw-heading">User Impersonation</h2>
                <p className="text-sm text-fw-bodyLight mt-1">View the system from another user's perspective for troubleshooting</p>
              </div>
              <UserCheck className="h-6 w-6 text-fw-link" />
            </div>

            {impersonation.isImpersonating ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <UserCheck className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">Currently Impersonating</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {impersonation.targetUser?.name} ({impersonation.targetUser?.email})
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      Started: {impersonation.startTime ? new Date(impersonation.startTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="impersonate-user" className="block text-sm font-medium text-fw-body mb-2">
                    Select User to Impersonate
                  </label>
                  <select
                    id="impersonate-user"
                    value={selectedImpersonationUser}
                    onChange={(e) => setSelectedImpersonationUser(e.target.value)}
                    className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  >
                    <option value="">Choose a user...</option>
                    {mockUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-fw-bodyLight mt-2">
                    All impersonation sessions are logged for security and compliance
                  </p>
                </div>

                <Button
                  variant="primary"
                  icon={UserCheck}
                  onClick={() => {
                    const user = mockUsers.find(u => u.id === selectedImpersonationUser);
                    if (user) {
                      startImpersonation(user);
                      setSelectedImpersonationUser('');
                    } else {
                      window.addToast({
                        type: 'warning',
                        title: 'No User Selected',
                        message: 'Please select a user to impersonate',
                        duration: 3000,
                      });
                    }
                  }}
                  disabled={!selectedImpersonationUser}
                >
                  Start Impersonation
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Security Notice</p>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>All actions taken during impersonation are logged</li>
                        <li>Sessions automatically expire after 30 minutes</li>
                        <li>Use responsibly for support and troubleshooting only</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-fw-wash flex items-center justify-end space-x-4 border-t border-fw-secondary">
          {isEditing && (
            <Button
              variant="outline"
              icon={X}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            icon={isEditing ? Save : Edit3}
            onClick={handleEditToggle}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Permission Matrix Modal */}
      <RoleCapabilityMatrix
        isOpen={showPermissionMatrix}
        onClose={() => setShowPermissionMatrix(false)}
        currentRole={currentRole}
      />

      {/* Audit Log Panel */}
      <AuditLogPanel
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />
    </div>
  );
}