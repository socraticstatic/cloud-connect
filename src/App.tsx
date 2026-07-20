import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy, memo } from 'react';
import { startLmccLifecycleClock } from './data/lmccLifecycleClock';
import { restoreFromLocation } from './features/share/shareLink';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { DashboardLayout } from './components/common/layouts';
import { ToastContainer, AnnouncementBanner, AlertDialog, WarningDialog, ConfirmDialog } from './components/common/notifications';
import { useStore } from './store/useStore';
import { ThemeProvider } from './components/ThemeProvider';
import { MobileMenu } from './components/navigation/MobileMenu';
// SmartAssistant + FeedbackWidget removed — legacy prototype chrome
import { NavigationStateProvider } from './components/common/layouts/NavigationStateProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProductTour } from './components/tour/ProductTour';
import { useTour } from './hooks/useTour';
import { mainAppTour } from './data/tourSteps';
import { GlobalKeyboardShortcuts } from './components/common/GlobalKeyboardShortcuts';
import { ImpersonationBanner } from './components/common/ImpersonationBanner';
import { PWAUpdatePrompt, usePWAUpdate } from './components/common/PWAUpdatePrompt';
import { MaintenanceModal } from './components/common/MaintenanceModal';

// Curated Cloud Connect flow pages (the six live screens + /netops).
const LazyDiscoverPage = lazy(() =>
  import('./features/discover/DiscoverPage').then(module => ({
    default: module.DiscoverPage
  }))
);

const LazyConnectPage = lazy(() =>
  import('./features/connect/ConnectPage').then(module => ({
    default: module.ConnectPage
  }))
);

const LazyGovernPage = lazy(() =>
  import('./features/govern/GovernPage').then(module => ({
    default: module.GovernPage
  }))
);

const LazyObservePage = lazy(() =>
  import('./features/observe/ObservePage').then(module => ({
    default: module.ObservePage
  }))
);

const LazyCostPage = lazy(() =>
  import('./features/cost/CostPage').then(module => ({
    default: module.CostPage
  }))
);

const LazyAiFabricPage = lazy(() =>
  import('./features/ai-fabric/AiFabricPage').then(module => ({
    default: module.AiFabricPage
  }))
);

// /netops is no longer in the curated nav (see navItems.ts) but the route
// stays live and deep-linkable — the page is already built and reviewed.
const LazyNetOpsPage = lazy(() =>
  import('./features/netops/NetOpsPage').then(module => ({
    default: module.NetOpsPage
  }))
);

const LazyOnboardingWizard = lazy(() =>
  import('./components/onboarding/OnboardingWizard').then(module => ({
    default: module.OnboardingWizard
  }))
);

const LazyNoInternetPage = lazy(() =>
  import('./components/pages/NoInternetPage').then(module => ({
    default: module.NoInternetPage
  }))
);

const LazyMaintenancePage = lazy(() =>
  import('./components/pages/MaintenancePage').then(module => ({
    default: module.MaintenancePage
  }))
);

// Optimized loading fallback
const LoadingFallback = memo(() => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" color="brand" />
  </div>
));

function App() {
  // Demo lifecycle clock: Provisioning resolves to Live; reduced paths self-heal.
  useEffect(() => { startLmccLifecycleClock(useStore); }, []);
  // Replay a shared session (?s=... — router-safe under HashRouter) once on mount.
  useEffect(() => { restoreFromLocation(); }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const connections = useStore(state => state.connections);
  const hubs = useStore(state => state.hubs);
  const groups = useStore(state => state.groups);
  const setRole = useStore(state => state.setRole);
  const setActivePersona = useStore(state => state.setActivePersona);
  const [activeTab, setActiveTab] = useState<'hubs' | 'connections' | 'marketplace' | 'groups' | 'control-center'>('hubs');

  // Expose role switcher and persona setter for E2E tests (dev only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__setRole = setRole;
      (window as any).__setActivePersona = setActivePersona;
    }
  }, [setRole, setActivePersona]);

  // Honor activeTab passed via navigation state (e.g. after Confirm & Activate
  // → return to /manage with state: { activeTab: 'connections' }).
  useEffect(() => {
    const nextTab = (location.state as any)?.activeTab;
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const tour = useTour('main-app');
  const pwaUpdate = usePWAUpdate();
  const [showMaintenance, setShowMaintenance] = useState(false);
  const maintenanceFreeze = useStore(s => s.maintenanceFreeze);

  const {
    activeAlert, dismissAlert,
    activeWarning, dismissWarning,
    activeConfirm, dismissConfirm,
    activeBanner, dismissBanner,
  } = useStore();

  const maintenanceSchedule = {
    date: 'March 25, 2026',
    startTime: '2026-03-25T02:00:00',
    endTime: '2026-03-25T06:00:00',
    duration: '4 hours',
    description: 'We will be performing scheduled maintenance to upgrade our network infrastructure. During this time, the management portal will be temporarily unavailable.',
    affectedServices: ['Management Portal', 'API Hub', 'Monitoring Dashboard'],
  };

  // Check if current route is a detached window or standalone page
  const isDetachedWindow = location.pathname.startsWith('/detached/');
  const isStandalonePage = location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/no-internet' || location.pathname === '/maintenance' || location.pathname === '/demo' || location.pathname === '/brief' || location.pathname === '/scorecard';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const initApp = () => setTimeout(() => {
      setIsInitializing(false);
      // Tour no longer auto-starts — it launches from the feedback panel.
    }, 300);

    checkMobile();
    initApp();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const userInfo = {
    name: 'Emilio',
    role: 'Admin',
    account: 'AT&T',
    email: 'emilio.estevez@att.com',
    avatar: null
  };

  if (isInitializing) {
    return <LoadingFallback />;
  }

  // Safe array handling
  const safeConnections = Array.isArray(connections) ? connections : [];
  const safeGroups = Array.isArray(groups) ? groups : [];

  return (
    <NavigationStateProvider>
      <ThemeProvider>
        <ErrorBoundary onReset={() => window.location.reload()}>
          {activeBanner && (
            <AnnouncementBanner
              title={activeBanner.title}
              message={activeBanner.message}
              ctaLabel={activeBanner.ctaLabel}
              ctaHref={activeBanner.ctaHref}
              onDismiss={dismissBanner}
            />
          )}

          {activeAlert && (
            <AlertDialog
              {...activeAlert}
              onAction={() => { activeAlert.onAction?.(); dismissAlert(); }}
              onClose={dismissAlert}
            />
          )}

          {activeWarning && (
            <WarningDialog
              {...activeWarning}
              onAction={() => { activeWarning.onAction?.(); dismissWarning(); }}
              onClose={dismissWarning}
            />
          )}

          {activeConfirm && (
            <ConfirmDialog
              {...activeConfirm}
              onConfirm={() => { activeConfirm.onConfirm(); dismissConfirm(); }}
              onClose={dismissConfirm}
            />
          )}
          <ImpersonationBanner />
          <ScrollToTop />
          <ToastContainer />
          <GlobalKeyboardShortcuts />
          {pwaUpdate.showPrompt && (
            <PWAUpdatePrompt
              onUpdate={pwaUpdate.handleUpdate}
              onDismiss={pwaUpdate.handleDismiss}
            />
          )}
          <Routes>
            {/* Detached windows - legacy fork surface, redirected to the curated flow */}
            <Route path="/detached/vnf/:connectionId/:windowId" element={<Navigate to="/discover" replace />} />
            <Route path="/detached/insights" element={<Navigate to="/discover" replace />} />

            {/* Sign-in retired — the prototype opens straight onto the estate.
                Old links redirect rather than 404. */}
            <Route path="/login" element={<Navigate to="/discover" replace />} />
            <Route path="/sso-login" element={<Navigate to="/discover" replace />} />

            {/* Onboarding - standalone, no layout */}
            <Route path="/onboarding" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyOnboardingWizard />
              </Suspense>
            } />

            {/* No Internet - standalone, no layout */}
            <Route path="/no-internet" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyNoInternetPage />
              </Suspense>
            } />

            {/* Maintenance - standalone, no layout */}
            <Route path="/maintenance" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyMaintenancePage />
              </Suspense>
            } />

            {/* Legacy standalone pages - redirected to the curated flow */}
            <Route path="/demo" element={<Navigate to="/discover" replace />} />
            <Route path="/aws-workflow" element={<Navigate to="/discover" replace />} />
            <Route path="/brief" element={<Navigate to="/discover" replace />} />
            <Route path="/scorecard" element={<Navigate to="/discover" replace />} />

            {/* Main app routes - with layout wrapper, auth-gated */}
            <Route path="*" element={
              <DashboardLayout>
                <main id="main-content" tabIndex={-1} className="min-h-screen">
                  <Routes>
                <Route path="/create" element={<Navigate to="/discover" replace />} />

                <Route path="/aws-handoff" element={<Navigate to="/discover" replace />} />

                <Route path="/discover" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyDiscoverPage />
                  </Suspense>
                } />

                <Route path="/connect" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyConnectPage />
                  </Suspense>
                } />

                <Route path="/govern" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyGovernPage />
                  </Suspense>
                } />

                <Route path="/observe" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyObservePage />
                  </Suspense>
                } />

                <Route path="/cost" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyCostPage />
                  </Suspense>
                } />

                <Route path="/ai-fabric" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyAiFabricPage />
                  </Suspense>
                } />

                <Route path="/netops" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyNetOpsPage />
                  </Suspense>
                } />

                {/* Legacy inherited advanced-app product routes - redirected to the curated flow */}
                <Route path="/manage" element={<Navigate to="/discover" replace />} />
                <Route path="/monitor" element={<Navigate to="/discover" replace />} />
                <Route path="/configure/*" element={<Navigate to="/discover" replace />} />
                <Route path="/profile" element={<Navigate to="/discover" replace />} />
                <Route path="/notifications" element={<Navigate to="/discover" replace />} />
                <Route path="/notifications/showcase" element={<Navigate to="/discover" replace />} />
                <Route path="/support" element={<Navigate to="/discover" replace />} />
                <Route path="/support/banners" element={<Navigate to="/discover" replace />} />
                <Route path="/glossary" element={<Navigate to="/discover" replace />} />
                <Route path="/news" element={<Navigate to="/discover" replace />} />
                <Route path="/tickets" element={<Navigate to="/discover" replace />} />
                <Route path="/tickets/create" element={<Navigate to="/discover" replace />} />
                <Route path="/tickets/:id" element={<Navigate to="/discover" replace />} />
                <Route path="/connections/:id/*" element={<Navigate to="/discover" replace />} />
                <Route path="/groups" element={<Navigate to="/discover" replace />} />
                <Route path="/groups/:id/*" element={<Navigate to="/discover" replace />} />
                <Route path="/pools/:id" element={<Navigate to="/discover" replace />} />
                <Route path="/hubs/:id" element={<Navigate to="/discover" replace />} />
                <Route path="/cloud-routers/:id" element={<Navigate to="/discover" replace />} />
                <Route path="/gateways/:id" element={<Navigate to="/discover" replace />} />
                <Route path="/vnfs/:id" element={<Navigate to="/discover" replace />} />

                <Route path="/" element={<Navigate to="/discover" />} />
                
                <Route path="*" element={
                  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-fw-wash">
                    <div className="flex flex-col items-start max-w-[350px]">
                      <h1 className="text-[48px] font-bold text-fw-heading tracking-[-0.03em] mb-4">Page not found.</h1>
                      <p className="text-[14px] font-medium text-fw-body tracking-[-0.03em] mb-8">
                        We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
                      </p>
                      <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center h-9 px-6 bg-fw-active text-white rounded-full text-[14px] font-medium hover:bg-fw-linkHover transition-colors"
                      >
                        Back to Home
                      </button>
                    </div>
                  </div>
                } />
                  </Routes>
                </main>
              </DashboardLayout>
            } />
          </Routes>
        </ErrorBoundary>
        
        {!isDetachedWindow && !isStandalonePage && (
          <>
            <MobileMenu
              isOpen={false}
              onClose={() => {}}
              userInfo={userInfo}
              notifications={3}
            />
            {/* SmartAssistant + FeedbackWidget/DemoBar removed — legacy prototype
                feedback/usability chrome (Maze study, role switcher). The guided
                tour is launched from the top-bar control. */}
            {/* LMCC ordering flows through Marketplace / Create dropdown into the wizard —
                the NetBondMax auto-demo modal was retired at GA (2026-07-10). */}
            <MaintenanceModal
              isOpen={showMaintenance}
              onClose={() => setShowMaintenance(false)}
              schedule={maintenanceSchedule}
              variant="modal"
            />
            <ProductTour
              steps={mainAppTour}
              isOpen={tour.isOpen}
              onClose={tour.closeTour}
              onComplete={tour.completeTour}
              storageKey="tour-main-app-completed"
            />
          </>
        )}
      </ThemeProvider>
    </NavigationStateProvider>
  );
}

export default memo(App);