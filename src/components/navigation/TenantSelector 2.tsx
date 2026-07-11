import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Settings, Check, User } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'AT&T Enterprise', avatar: undefined, role: 'Admin' },
  { id: '2', name: 'AT&T Business', avatar: undefined, role: 'Viewer' },
  { id: '3', name: 'AT&T Government', avatar: undefined, role: 'Editor' },
  { id: '4', name: 'AT&T Healthcare', avatar: undefined, role: 'Admin' },
  { id: '5', name: 'AT&T Financial', avatar: undefined, role: 'Viewer' },
  { id: '6', name: 'AT&T Retail', avatar: undefined, role: 'Editor' },
];

interface TenantSelectorProps {
  className?: string;
  onProfileClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
  ];
  const index = parseInt(id, 10) % colors.length;
  return colors[index];
}

export function TenantSelector({ className = '', onProfileClick }: TenantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(MOCK_TENANTS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredTenants = MOCK_TENANTS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-fw-wash transition-colors"
      >
        <User className="h-5 w-5 text-fw-heading" />
        <ChevronDown className={`w-4 h-4 text-fw-bodyLight transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[304px] max-h-[624px] bg-fw-base rounded-3xl border border-fw-secondary shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-2 border-b border-fw-secondary">
            <p className="text-figma-sm font-medium text-fw-bodyLight tracking-[-0.03em] mb-3">
              Switch Account
            </p>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fw-bodyLight" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search accounts..."
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-fw-secondary bg-fw-wash text-figma-base text-fw-body tracking-[-0.03em] placeholder:text-fw-bodyLight focus:outline-none focus:ring-2 focus:ring-fw-link focus:border-transparent"
              />
            </div>
          </div>

          {/* Tenant List */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredTenants.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">No accounts found</p>
              </div>
            ) : (
              filteredTenants.map(tenant => {
                const isSelected = tenant.id === selectedTenant.id;
                return (
                  <button
                    key={tenant.id}
                    onClick={() => handleSelect(tenant)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? 'bg-fw-primary/5' : 'hover:bg-fw-wash'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(tenant.id)} flex items-center justify-center shrink-0`}>
                      <span className="text-[12px] font-bold text-white">
                        {getInitials(tenant.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-figma-base font-medium tracking-[-0.03em] truncate ${
                        isSelected ? 'text-fw-link' : 'text-fw-heading'
                      }`}>
                        {tenant.name}
                      </p>
                      <p className="text-figma-sm text-fw-bodyLight tracking-[-0.03em]">
                        {tenant.role}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-fw-link shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-fw-secondary px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="flex items-center gap-2 text-figma-sm font-medium text-fw-link tracking-[-0.03em] hover:underline"
            >
              <Settings className="w-4 h-4" />
              Manage Accounts
            </button>
            {onProfileClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onProfileClick();
                }}
                className="flex items-center gap-2 text-figma-sm font-medium text-fw-link tracking-[-0.03em] hover:underline"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}