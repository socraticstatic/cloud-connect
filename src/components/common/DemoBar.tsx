import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../store/slices/roleSlice';
import { RoleName } from '../../types/rbac';
import { ROLE_CATALOG } from '../../data/roleCatalog';
import { Shield, Users, Wrench } from 'lucide-react';

const SCENARIOS = [
  { id: 'platform-admin', label: 'AT&T Platform', icon: Shield, tenantId: 'TNT-001', role: 'super-admin' as UserRole, navigateTo: '/manage' },
  { id: 'reseller', label: 'Reseller', icon: Users, tenantId: 'TNT-004', role: 'admin' as UserRole, navigateTo: '/reseller' },
];

const PERSONAS: { id: RoleName; short: string }[] = [
  { id: 'Viewer',          short: 'Viewer' },
  { id: 'NetworkEngineer', short: 'Net Eng' },
  { id: 'BillingAdmin',    short: 'Billing' },
  { id: 'SecurityAdmin',   short: 'Security' },
  { id: 'TenantAdmin',     short: 'Tenant' },
  { id: 'PlatformAdmin',   short: 'Platform' },
];

const pill = (active: boolean) =>
  `px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
    active ? 'bg-fw-heading/10 text-fw-heading' : 'text-fw-bodyLight hover:bg-fw-wash'
  }`;

export function DemoBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTenantId = useStore(s => s.activeTenantId);
  const setActiveTenant = useStore(s => s.setActiveTenant);
  const activePersona = useStore(s => s.activePersona);
  const setRole = useStore(s => s.setRole);
  const setActivePersona = useStore(s => s.setActivePersona);
  const maintenanceFreeze = useStore(s => s.maintenanceFreeze);
  const setMaintenanceFreeze = useStore(s => s.setMaintenanceFreeze);
  // Summoned from the feedback panel; auto-dismisses after 15s of no interaction.
  const demoBarVisible = useStore(s => s.demoBarVisible);
  const setDemoBarVisible = useStore(s => s.setDemoBarVisible);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDemoBarVisible(false), 15000);
  }, [setDemoBarVisible]);

  useEffect(() => {
    if (demoBarVisible) resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [demoBarVisible, resetTimer]);

  if (!demoBarVisible) return null;

  const activeScenario = activeTenantId === 'TNT-004' || location.pathname === '/reseller' ? 'reseller' : 'platform-admin';

  return (
    <div
      onMouseEnter={resetTimer}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-fw-base/90 backdrop-blur-sm border border-fw-secondary/50 shadow-sm"
    >
      {SCENARIOS.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => { setActiveTenant(s.tenantId); setRole(s.role); setTimeout(() => navigate(s.navigateTo), 50); }}
            className={`flex items-center gap-1 ${pill(activeScenario === s.id)}`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
      <div className="w-px h-4 bg-fw-secondary/50 mx-1" />
      {PERSONAS.map(p => (
        <button
          key={p.id}
          onClick={() => setActivePersona(p.id)}
          className={pill(activePersona === p.id)}
        >
          {p.short}
        </button>
      ))}
      <div className="w-px h-4 bg-fw-secondary/50 mx-1" />
      <button
        onClick={() => setMaintenanceFreeze(!maintenanceFreeze)}
        className={`flex items-center gap-1 ${pill(maintenanceFreeze)}`}
      >
        <Wrench className="h-3 w-3" />
        <span className="hidden sm:inline">Maintenance</span>
      </button>
    </div>
  );
}
