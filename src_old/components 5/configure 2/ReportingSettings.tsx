import { useState } from 'react';
import { Settings, Database, Palette, Shield } from 'lucide-react';
import { VerticalTabGroup } from '../navigation/VerticalTabGroup';
import { TabItem } from '../../types/navigation';
import { Button } from '../common/Button'; 

export function ReportingSettings() {
  const [activeView, setActiveView] = useState<'preferences' | 'retention' | 'branding' | 'compliance'>('preferences');
  const [preferences, setPreferences] = useState({
    defaultFormat: 'PDF',
    autoExport: true,
    includeCharts: true,
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  const [retention, setRetention] = useState({
    reportHistory: '90',
    exportHistory: '30',
    logRetention: '365',
    archiveLocation: 'Cloud Storage'
  });

  const tabs: TabItem[] = [
    { id: 'preferences', label: 'Preferences', icon: <Settings className="h-5 w-5 mr-2" /> },
    { id: 'retention', label: 'Data Retention', icon: <Database className="h-5 w-5 mr-2" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="h-5 w-5 mr-2" /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield className="h-5 w-5 mr-2" /> }
  ];

  const handleSavePreferences = () => {
    window.addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Report preferences updated successfully',
      duration: 3000
    });
  };

  return (
    <div className="p-6">
      {/* Help Banner */}
      <div className="mb-6 bg-gradient-to-r from-fw-wash to-fw-base border border-fw-secondary rounded-lg p-4">
        <div className="flex items-start">
          <Settings className="h-6 w-6 text-fw-link mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-fw-heading">Account-Level Reporting Configuration</h3>
            <p className="text-sm text-fw-bodyLight mt-1">
              Configure global reporting settings, data retention policies, and compliance options for your entire account. For generating and scheduling specific reports, visit the <strong>Monitoring</strong> section.
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        <VerticalTabGroup
          tabs={tabs}
          activeTab={activeView}
          onChange={(tab) => setActiveView(tab as typeof activeView)}
        />

        <div className="flex-1 pl-6">
          {/* General Preferences */}
          {activeView === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">General Report Preferences</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-fw-body mb-2">Default Export Format</label>
                      <select
                        value={preferences.defaultFormat}
                        onChange={(e) => setPreferences({...preferences, defaultFormat: e.target.value})}
                        className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Excel">Excel</option>
                        <option value="CSV">CSV</option>
                        <option value="JSON">JSON</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fw-body mb-2">Time Zone</label>
                      <select
                        value={preferences.timeZone}
                        onChange={(e) => setPreferences({...preferences, timeZone: e.target.value})}
                        className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fw-body mb-2">Date Format</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                        className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fw-body mb-2">Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                        className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-fw-secondary">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.autoExport}
                        onChange={(e) => setPreferences({...preferences, autoExport: e.target.checked})}
                        className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                      />
                      <span className="text-sm text-fw-body">Automatically export reports to configured storage</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.includeCharts}
                        onChange={(e) => setPreferences({...preferences, includeCharts: e.target.checked})}
                        className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded"
                      />
                      <span className="text-sm text-fw-body">Include charts and visualizations in exported reports</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Data Retention */}
          {activeView === 'retention' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Data Retention Policies</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Configure how long different types of data are retained in your account.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Report History Retention</label>
                    <select
                      value={retention.reportHistory}
                      onChange={(e) => setRetention({...retention, reportHistory: e.target.value})}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="-1">Indefinite</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">How long to keep generated report files</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Export History Retention</label>
                    <select
                      value={retention.exportHistory}
                      onChange={(e) => setRetention({...retention, exportHistory: e.target.value})}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    >
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">How long to keep manually exported files</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Activity Log Retention</label>
                    <select
                      value={retention.logRetention}
                      onChange={(e) => setRetention({...retention, logRetention: e.target.value})}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    >
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="1825">5 years</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">How long to retain audit and activity logs</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Archive Storage Location</label>
                    <select
                      value={retention.archiveLocation}
                      onChange={(e) => setRetention({...retention, archiveLocation: e.target.value})}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    >
                      <option value="Cloud Storage">Cloud Storage</option>
                      <option value="Local Storage">Local Storage</option>
                      <option value="AWS S3">AWS S3</option>
                      <option value="Azure Blob">Azure Blob Storage</option>
                      <option value="Custom">Custom Location</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">Where archived reports should be stored</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSavePreferences}>
                    Save Retention Policy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Branding */}
          {activeView === 'branding' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Report Branding</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Customize the appearance of exported reports with your organization's branding.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Company Name</label>
                    <input
                      type="text"
                      placeholder="Your Company Name"
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Company Logo</label>
                    <div className="border-2 border-dashed border-fw-secondary rounded-lg p-8 text-center">
                      <Palette className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-fw-bodyLight mb-2">Upload your company logo</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                      <p className="text-xs text-fw-bodyLight mt-2">Recommended: PNG or SVG, max 2MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Report Header Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        defaultValue="#0066CC"
                        className="h-10 w-20 rounded border border-fw-secondary"
                      />
                      <span className="text-sm text-fw-bodyLight">Choose a color for report headers and accents</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fw-body mb-2">Footer Text</label>
                    <textarea
                      placeholder="Custom footer text for all reports (e.g., copyright, contact info)"
                      rows={3}
                      className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSavePreferences}>
                    Save Branding
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Compliance */}
          {activeView === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-fw-base rounded-lg border border-fw-secondary p-6">
                <h3 className="text-lg font-semibold text-fw-heading mb-4">Compliance & Audit Settings</h3>
                <p className="text-sm text-fw-bodyLight mb-6">
                  Configure compliance requirements and audit trail settings for regulatory reporting.
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Compliance Standards</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">SOC 2 Type II Reporting</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">HIPAA Compliance Reporting</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">PCI DSS Requirements</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">GDPR Data Processing Records</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-fw-secondary">
                    <h4 className="text-sm font-semibold text-fw-heading mb-3">Audit Trail Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">Log all report generation activities</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">Track report access and downloads</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">Require digital signatures on sensitive reports</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-fw-link focus:ring-fw-link border-gray-300 rounded" />
                        <span className="text-sm text-fw-body">Maintain tamper-proof audit logs</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-fw-secondary">
                    <label className="block text-sm font-medium text-fw-body mb-2">Data Classification Level</label>
                    <select className="w-full px-4 py-2 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-link focus:border-fw-link">
                      <option>Public</option>
                      <option>Internal</option>
                      <option selected>Confidential</option>
                      <option>Restricted</option>
                    </select>
                    <p className="text-xs text-fw-bodyLight mt-1">Default classification level for generated reports</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" onClick={handleSavePreferences}>
                    Save Compliance Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}