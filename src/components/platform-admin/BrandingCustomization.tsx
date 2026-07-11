import { useState, useEffect } from 'react';
import { Upload, RotateCcw, Eye, Save, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { Tenant } from '../../data/mockTenants';
import { useStore } from '../../store/useStore';
import { applyBranding, DEFAULT_BRANDING } from '../../utils/theme';

interface BrandingCustomizationProps {
  tenant: Tenant;
}

export function BrandingCustomization({ tenant }: BrandingCustomizationProps) {
  const tenantBranding = useStore(state => state.tenantBranding);
  const updateTenantBranding = useStore(state => state.updateTenantBranding);

  const [primaryColor, setPrimaryColor] = useState(tenantBranding.primaryColor || '#0066CC');
  const [secondaryColor, setSecondaryColor] = useState(tenantBranding.accentColor || '#00A0E3');
  const [fontFamily, setFontFamily] = useState(tenantBranding.fontFamily || 'Inter');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  // Sync from store when tenant changes
  useEffect(() => {
    setPrimaryColor(tenantBranding.primaryColor);
    setSecondaryColor(tenantBranding.accentColor);
    setFontFamily(tenantBranding.fontFamily);
  }, [tenantBranding]);

  const colorPresets = [
    { name: 'AT&T Blue', primary: '#0066CC', secondary: '#00A0E3' },
    { name: 'Forest Green', primary: '#10B981', secondary: '#34D399' },
    { name: 'Navy Gold', primary: '#1E3A8A', secondary: '#F59E0B' },
    { name: 'Teal White', primary: '#0D9488', secondary: '#14B8A6' },
    { name: 'Purple Pink', primary: '#7C3AED', secondary: '#EC4899' },
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
  ];

  const handleSave = () => {
    // Persist to store and apply CSS variables live
    updateTenantBranding({
      primaryColor,
      accentColor: secondaryColor,
      fontFamily,
    });
    window.addToast({
      type: 'success',
      title: 'Branding Saved',
      message: 'Branding updated. Changes are live across the platform.',
      duration: 3000,
    });
  };

  const handleReset = () => {
    setPrimaryColor(DEFAULT_BRANDING.primaryColor);
    setSecondaryColor(DEFAULT_BRANDING.accentColor);
    setFontFamily(DEFAULT_BRANDING.fontFamily);
    updateTenantBranding({
      primaryColor: DEFAULT_BRANDING.primaryColor,
      accentColor: DEFAULT_BRANDING.accentColor,
      fontFamily: DEFAULT_BRANDING.fontFamily,
    });
    window.addToast({
      type: 'info',
      title: 'Branding Reset',
      message: 'Branding has been reset to AT&T defaults',
      duration: 3000,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Logo Section */}
        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ImageIcon className="h-5 w-5 text-fw-link" />
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Logo</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Primary Logo</label>
              <div className="border-2 border-dashed border-fw-secondary rounded-lg p-8 text-center hover:border-fw-active transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-fw-bodyLight mx-auto mb-2" />
                <p className="text-figma-sm font-medium text-fw-bodyLight">Click to upload or drag and drop</p>
                <p className="text-figma-sm font-medium text-fw-bodyLight mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Favicon</label>
              <div className="border-2 border-dashed border-fw-secondary rounded-lg p-6 text-center hover:border-fw-active transition-colors cursor-pointer">
                <Upload className="h-6 w-6 text-fw-bodyLight mx-auto mb-2" />
                <p className="text-figma-sm font-medium text-fw-bodyLight">32x32 PNG or ICO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Color Scheme Section */}
        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="h-5 w-5 text-fw-link" />
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Color Scheme</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-16 rounded border border-fw-secondary cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 h-9 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active font-mono text-figma-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Secondary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-16 rounded border border-fw-secondary cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 h-9 border border-fw-secondary rounded-lg focus:ring-2 focus:ring-fw-active focus:border-fw-active font-mono text-figma-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Color Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-lg border border-fw-secondary hover:border-fw-active transition-colors"
                  >
                    <div className="flex space-x-1">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="h-6 w-6 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-figma-sm font-medium text-fw-body">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Type className="h-5 w-5 text-fw-link" />
            <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Typography</h3>
          </div>

          <div>
            <label className="block text-figma-base font-medium text-fw-body tracking-[-0.03em] mb-2">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 h-9 border border-fw-secondary rounded-lg text-figma-base focus:ring-2 focus:ring-fw-active focus:border-fw-active"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            <p className="text-figma-sm font-medium text-fw-bodyLight mt-2">
              Preview text with selected font
            </p>
            <div
              className="mt-3 p-4 bg-fw-wash rounded-lg border border-fw-secondary"
              style={{ fontFamily }}
            >
              <p className="text-figma-xl font-bold mb-2">The quick brown fox</p>
              <p className="text-figma-base font-medium">jumps over the lazy dog</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button variant="primary" icon={Save} onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" icon={RotateCcw} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-fw-base rounded-2xl border border-fw-secondary p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-fw-link" />
              <h3 className="text-figma-lg font-bold text-fw-heading tracking-[-0.03em]">Live Preview</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode('light')}
                className={`px-3 py-1 rounded-lg text-figma-sm font-medium ${
                  previewMode === 'light'
                    ? 'bg-fw-active text-white'
                    : 'bg-fw-wash text-fw-body'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setPreviewMode('dark')}
                className={`px-3 py-1 rounded-lg text-figma-sm font-medium ${
                  previewMode === 'dark'
                    ? 'bg-fw-active text-white'
                    : 'bg-fw-wash text-fw-body'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div
            className="border-2 border-fw-secondary rounded-lg overflow-hidden"
            style={{ fontFamily }}
          >
            {/* Mock Navigation Bar */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-4">
                <div className="h-8 w-32 bg-white/20 rounded" />
                <div className="flex space-x-3">
                  {['Manage', 'Monitor', 'Configure'].map((item) => (
                    <div key={item} className="text-white text-figma-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-8 w-8 bg-white/20 rounded-full" />
            </div>

            {/* Mock Content Area */}
            <div className={previewMode === 'dark' ? 'bg-fw-heading' : 'bg-fw-wash'}>
              <div className="p-6">
                <h2
                  className={`text-figma-xl font-bold mb-4 ${
                    previewMode === 'dark' ? 'text-white' : 'text-fw-heading'
                  }`}
                >
                  {tenant.name} Dashboard
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg ${
                        previewMode === 'dark'
                          ? 'bg-fw-body border border-fw-bodyLight'
                          : 'bg-white border border-fw-secondary'
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded mb-2"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <div
                        className={`text-figma-xl font-bold ${
                          previewMode === 'dark' ? 'text-white' : 'text-fw-heading'
                        }`}
                      >
                        {i * 12}
                      </div>
                      <div
                        className={`text-figma-sm font-medium ${
                          previewMode === 'dark' ? 'text-fw-bodyLight' : 'text-fw-bodyLight'
                        }`}
                      >
                        Metric {i}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    className="px-4 py-2 rounded-full text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full font-medium ${
                      previewMode === 'dark'
                        ? 'bg-fw-body text-white border border-fw-bodyLight'
                        : 'bg-white text-fw-body border border-fw-secondary'
                    }`}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-figma-sm font-medium text-fw-bodyLight mt-4">
            Preview shows how your branding will appear across the platform. Changes are applied immediately to the preview.
          </p>
        </div>
      </div>
    </div>
  );
}
