import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy, memo } from 'react';
import { startLmccLifecycleClock } from './data/lmccLifecycleClock';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { DashboardLayout } from './components/common/layouts';
import { SubNav } from './components/navigation/SubNav';
import { ConnectionGrid } from './components/ConnectionGrid';
import { ToastContainer, AnnouncementBanner, AlertDialog, WarningDialog, ConfirmDialog } from './components/common/notifications';
import { ConnectionTabs } from './components/connection/ConnectionTabs';
import { useStore } from './store/useStore';
import { ThemeProvider } from './components/ThemeProvider';
import { MobileMenu } from './components/navigation/MobileMenu';
// SmartAssistant removed per user request
import { FeedbackWidget } from './components/feedback/FeedbackWidget';
import { NavigationStateProvider } from './components/common/layouts/NavigationStateProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GroupGrid } from './components/GroupGrid';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { AsyncBoundary } from './components/common/AsyncBoundary';
import { ProductTour } from './components/tour/ProductTour';
import { useTour } from './hooks/useTour';
import { mainAppTour } from './data/tourSteps';
import { MobileManagePage } from './components/MobileManagePage';
import { useIsMobile } from './hooks/useMobileDetection';
import { MobileConfigureHub } from './components/configure/MobileConfigureHub';
import { MobileDesktopOnly } from './components/common/MobileDesktopOnly';
import { GlobalKeyboardShortcuts } from './components/common/GlobalKeyboardShortcuts';
import { ImpersonationBanner } from './components/common/ImpersonationBanner';
import { PWAUpdatePrompt, usePWAUpdate } from './components/common/PWAUpdatePrompt';
import { MaintenanceModal } from './components/common/MaintenanceModal';
import { DemoBar } from './components/common/DemoBar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LayoutTemplate } from 'lucide-react';

// ── Design Assets layout (shared by /demo and /aws-workflow) ──────────────────

function DesignDisclaimer({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-fw-heading/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-fw-secondary bg-fw-base">
        <div className="h-1 bg-fw-primary" />
        <div className="px-10 py-10">
          <div className="flex items-start gap-5 mb-7">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-fw-accent border border-fw-active/30 flex items-center justify-center">
              <LayoutTemplate className="w-6 h-6 text-fw-link" />
            </div>
            <div>
              <p className="text-figma-xs font-semibold text-fw-link uppercase tracking-[0.08em] mb-1.5">Product Design Assets</p>
              <h2 className="text-figma-2xl font-bold text-fw-heading tracking-[-0.03em] leading-tight">
                Not part of the AT&T Cloud Connect portal
              </h2>
            </div>
          </div>
          <div className="space-y-4 text-figma-base text-fw-body leading-relaxed mb-9">
            <p>
              These are <strong className="font-semibold text-fw-heading">product design assets for the AT&T AWS LMCC Interconnect</strong> — not a shipping product, live system, or official AT&T interface.
            </p>
            <p>
              They translate the LMCC Product Notes (04092026) into interactive format so stakeholders can review flow logic, copy, error states, and billing behavior before engineering begins. Every word, status label, and data constraint traces directly to the product specification.
            </p>
            <p className="text-fw-bodyLight">
              Data shown is illustrative. No real connections, accounts, or billing records are created or modified.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-xl bg-fw-primary text-white text-figma-base font-semibold hover:bg-fw-linkHover transition-colors"
          >
            I understand — view the design assets
          </button>
        </div>
      </div>
    </div>
  );
}

function DesignAssetsPage() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="min-h-screen bg-fw-wash">
      {!dismissed && <DesignDisclaimer onDismiss={() => setDismissed(true)} />}
      <div className="h-12 bg-fw-base border-b border-fw-secondary flex items-center px-6 gap-3 shrink-0">
        <span className="text-base font-bold tracking-[-0.03em] text-brand-accent">AT&T</span>
        <span className="text-base font-bold text-fw-heading tracking-[-0.03em]">
          Cloud Connect
        </span>
        <span className="h-4 border-l border-fw-secondary" />
        <span className="text-figma-xs text-fw-bodyLight">LMCC Product Design Assets</span>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <AsyncBoundary fallback={<LoadingFallback />}>
          <Suspense fallback={<LoadingFallback />}>
            <LazyLMCCRequirementsPage />
          </Suspense>
        </AsyncBoundary>
      </div>
    </div>
  );
}

// Optimized lazy loading with better error handling
const LazyConnectionWizard = lazy(() =>
  import('./components/wizard/ConnectionWizard').then(module => ({
    default: module.ConnectionWizard
  }))
);

const LazyLMCCRequirementsPage = lazy(() =>
  import('./components/pages/LMCCRequirementsPage')
);
const LazyConnectionDetails = lazy(() =>
  import('./components/connection/ConnectionDetails').then(module => ({ 
    default: module.ConnectionDetails 
  }))
);

const LazyMonitoringDashboard = lazy(() => 
  import('./components/monitoring/monitoring/MonitoringDashboard').then(module => ({ 
    default: module.default 
  }))
);

const LazyMobileMonitoringDashboard = lazy(() => 
  import('./components/monitoring/MobileMonitoringDashboard').then(module => ({ 
    default: module.MobileMonitoringDashboard 
  }))
);

const LazyConfigureHub = lazy(() => 
  import('./components/configure/ConfigureHub').then(module => ({ 
    default: module.ConfigureHub 
  }))
);

const LazyUserProfile = lazy(() => 
  import('./components/profile/UserProfile').then(module => ({ 
    default: module.UserProfile 
  }))
);

const LazyNotificationsPage = lazy(() =>
  import('./components/pages/NotificationsPage').then(module => ({
    default: module.NotificationsPage
  }))
);

const LazyNotificationsShowcasePage = lazy(() =>
  import('./components/pages/NotificationsShowcasePage').then(module => ({
    default: module.NotificationsShowcasePage,
  }))
);

const LazyHelpResourcesPage = lazy(() =>
  import('./components/pages/HelpResourcesPage').then(module => ({
    default: module.HelpResourcesPage
  }))
);

const LazyAwsHandoffScreen = lazy(() =>
  import('./components/wizard/screens/AwsHandoffScreen').then(module => ({
    default: module.AwsHandoffScreen
  }))
);

const LazyGlossaryPage = lazy(() =>
  import('./components/pages/GlossaryPage').then(module => ({
    default: module.GlossaryPage
  }))
);

const LazyManageGroupsPage = lazy(() => 
  import('./components/ManageGroupsPage').then(module => ({ 
    default: module.ManageGroupsPage 
  }))
);

const LazyGroupDetailsPage = lazy(() =>
  import('./components/GroupDetailsPage').then(module => ({
    default: module.GroupDetailsPage
  }))
);

const LazyPoolDetailPage = lazy(() =>
  import('./components/pages/PoolDetailPage').then(module => ({
    default: module.PoolDetailPage
  }))
);

const LazyHubDetailPage = lazy(() =>
  import('./components/pages/HubDetailPage').then(module => ({
    default: module.HubDetailPage
  }))
);

const LazyVNFDetailPage = lazy(() =>
  import('./components/pages/VNFDetailPage').then(module => ({
    default: module.VNFDetailPage
  }))
);

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

// Only load these when actually needed
const LazyControlCenterManager = lazy(() =>
  import('./components/control-center/ControlCenterManager').then(module => ({
    default: module.ControlCenterManager
  }))
);

const LazyMarketplace = lazy(() =>
  import('./components/Marketplace').then(module => ({
    default: module.Marketplace
  }))
);

const LazyDetachedVNFTable = lazy(() =>
  import('./components/connection/vnf/DetachedVNFTable').then(module => ({
    default: module.DetachedVNFTable
  }))
);

const LazyDetachedInsights = lazy(() =>
  import('./components/control-center/DetachedInsights').then(module => ({
    default: module.DetachedInsights
  }))
);

const LazyTicketingIndex = lazy(() =>
  import('./components/ticketing/TicketingIndex').then(module => ({
    default: module.TicketingIndex
  }))
);

const LazyCMSBannerEditor = lazy(() =>
  import('./components/support/CMSBannerEditor').then(module => ({
    default: module.CMSBannerEditor
  }))
);

const LazyCreateTicket = lazy(() =>
  import('./components/ticketing/CreateTicket').then(module => ({
    default: module.CreateTicket
  }))
);

const LazyTicketDetail = lazy(() =>
  import('./components/ticketing/TicketDetail').then(module => ({
    default: module.TicketDetail
  }))
);

const LazyLoginPage = lazy(() =>
  import('./components/pages/LoginPage').then(module => ({
    default: module.LoginPage
  }))
);

const LazyMagicLinkLogin = lazy(() =>
  import('./components/pages/MagicLinkLogin')
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

const LazyNewsPage = lazy(() =>
  import('./components/pages/NewsPage').then(module => ({
    default: module.NewsPage
  }))
);

const LazyExecutiveBriefPage = lazy(() =>
  import('./components/pages/ExecutiveBriefPage').then(module => ({
    default: module.ExecutiveBriefPage
  }))
);

const LazyMonthlyBriefPage = lazy(() =>
  import('./components/pages/MonthlyBriefPage').then(module => ({
    default: module.MonthlyBriefPage
  }))
);

// Optimized loading fallback
const LoadingFallback = memo(() => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" color="brand" />
  </div>
));

// Param-preserving redirect from the legacy /cloud-routers/:id path to /hubs/:id.
// react-router's <Navigate to="/hubs/:id"> does NOT substitute :id, so we read it here.
function LegacyHubRedirect() {
  const { id } = useParams();
  return <Navigate to={`/hubs/${id}`} replace />;
}

function App() {
  // Demo lifecycle clock: Provisioning resolves to Live; reduced paths self-heal.
  useEffect(() => { startLmccLifecycleClock(useStore); }, []);
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
            {/* Detached windows - no layout wrapper */}
            <Route path="/detached/vnf/:connectionId/:windowId" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyDetachedVNFTable />
              </Suspense>
            } />
            <Route path="/detached/insights" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyDetachedInsights />
              </Suspense>
            } />

            {/* Magic Link Login - standalone, no layout */}
            <Route path="/login" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyMagicLinkLogin />
              </Suspense>
            } />

            {/* SSO Login (demo) - standalone, no layout */}
            <Route path="/sso-login" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyLoginPage />
              </Suspense>
            } />

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

            {/* LMCC Product Design Assets - standalone, no auth, with disclaimer */}
            <Route path="/demo" element={<DesignAssetsPage />} />
            <Route path="/aws-workflow" element={<DesignAssetsPage />} />

            {/* Executive Brief - standalone, no auth */}
            <Route path="/brief" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyExecutiveBriefPage />
              </Suspense>
            } />

            {/* Monthly Brief - standalone one-page scorecard, no auth */}
            <Route path="/scorecard" element={
              <Suspense fallback={<LoadingFallback />}>
                <LazyMonthlyBriefPage />
              </Suspense>
            } />

            {/* Main app routes - with layout wrapper, auth-gated */}
            <Route path="*" element={
              <ProtectedRoute>
              <DashboardLayout>
                <main id="main-content" tabIndex={-1} className="min-h-screen">
                  <Routes>
                <Route path="/create" element={
                  isMobile ? (
                    <MobileDesktopOnly
                      feature="Create Connection"
                      description="Creating connections requires multiple complex configuration steps that work best on a desktop or laptop screen."
                      alternativeAction={{
                        label: "View Connections",
                        path: "/manage"
                      }}
                    />
                  ) : (
                    <AsyncBoundary fallback={<LoadingFallback />}>
                      <SubNav
                        title={(location.state as any)?.initialStep != null || (location.state as any)?.mode === 'paste-key' ? '' : 'Create Connection'}
                        description={(location.state as any)?.initialStep != null || (location.state as any)?.mode === 'paste-key' ? '' : 'Set up a new network connection'}
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyConnectionWizard
                            onComplete={(config) => {
                              try {
                                const connectionName = typeof config === 'object' && config !== null
                                  ? (config as any).name || 'New Connection'
                                  : 'New Connection';

                                window.addToast?.({
                                  type: 'success',
                                  title: 'Connection Created',
                                  message: `Connection "${connectionName}" created successfully`,
                                  duration: 3000
                                });
                                navigate('/manage');
                              } catch (error) {
                                console.error('Error handling connection completion:', error);
                                navigate('/manage');
                              }
                            }}
                            onCancel={() => navigate('/manage')}
                          />
                        </Suspense>
                      </SubNav>
                    </AsyncBoundary>
                  )
                } />

                <Route path="/aws-handoff" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyAwsHandoffScreen />
                    </Suspense>
                  </AsyncBoundary>
                } />

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

                <Route path="/manage" element={
                  isMobile ? (
                    <MobileManagePage
                      connections={safeConnections}
                      groups={safeGroups}
                      activeTab={activeTab}
                      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                    />
                  ) : (
                    <SubNav
                      title="Networks"
                      description="Manage your network connections across clouds and data centers"
                    >
                      <div className="mb-8">
                        <ConnectionTabs
                          activeTab={activeTab}
                          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                          hubCount={hubs.length}
                          connectionCount={safeConnections.length}
                          groupCount={safeGroups.length}
                        />
                      </div>
                      {activeTab === 'hubs' ? (
                        <ConnectionGrid routers={hubs} viewEntity="routers" />
                      ) : activeTab === 'connections' ? (
                        <ConnectionGrid routers={hubs} viewEntity="connections" />
                      ) : activeTab === 'groups' ? (
                        <GroupGrid groups={safeGroups} />
                      ) : activeTab === 'control-center' ? (
                        <AsyncBoundary fallback={<LoadingFallback />}>
                          <Suspense fallback={<LoadingFallback />}>
                            <LazyControlCenterManager connections={safeConnections} />
                          </Suspense>
                        </AsyncBoundary>
                      ) : (
                        <AsyncBoundary fallback={<LoadingFallback />}>
                          <Suspense fallback={<LoadingFallback />}>
                            <LazyMarketplace onSelectItem={() => {}} />
                          </Suspense>
                        </AsyncBoundary>
                      )}
                    </SubNav>
                  )
                } />

                <Route path="/monitor" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    {isMobile ? (
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyMobileMonitoringDashboard connections={safeConnections} />
                      </Suspense>
                    ) : (
                      <SubNav
                        title="Performance"
                        description="Near real-time monitoring and analytics for your network connections"
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyMonitoringDashboard connections={safeConnections} />
                        </Suspense>
                      </SubNav>
                    )}
                  </AsyncBoundary>
                } />

                <Route path="/configure/*" element={
                  isMobile ? (
                    <MobileConfigureHub />
                  ) : (
                    <AsyncBoundary fallback={<LoadingFallback />}>
                      <SubNav
                        title="System Configuration"
                        description="Configure system settings and preferences"
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <LazyConfigureHub defaultTab="connections" />
                        </Suspense>
                      </SubNav>
                    </AsyncBoundary>
                  )
                } />

                <Route path="/profile" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="User Profile"
                      description="Manage your profile and preferences"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyUserProfile />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/notifications" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyNotificationsPage />
                      </Suspense>
                    </div>
                  </AsyncBoundary>
                } />

                <Route path="/notifications/showcase" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyNotificationsShowcasePage />
                    </Suspense>
                  </AsyncBoundary>
                } />

                <Route path="/support" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Information Center"
                      description="Access documentation, support, and resources"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyHelpResourcesPage />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/support/banners" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Banner Management"
                      description="Manage promotional and informational banners"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyCMSBannerEditor />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/glossary" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyGlossaryPage />
                      </Suspense>
                    </div>
                  </AsyncBoundary>
                } />

                <Route path="/news" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="News & Announcements"
                      description="Platform updates, maintenance windows, and service announcements"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyNewsPage />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/tickets" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Ticketing"
                      description="Manage support tickets and service requests"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyTicketingIndex />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/tickets/create" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Create a new ticket"
                      description="Submit a new support request"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyCreateTicket />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/tickets/:id" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Ticket Detail"
                      description="View ticket information and activity"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyTicketDetail />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />


                <Route path="/connections/:id/*" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyConnectionDetails />
                      </Suspense>
                    </div>
                  </AsyncBoundary>
                } />

                <Route path="/groups" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyManageGroupsPage />
                    </Suspense>
                  </div>
                } />

                <Route path="/groups/:id/*" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyGroupDetailsPage />
                    </Suspense>
                  </div>
                } />

                <Route path="/pools/:id" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyPoolDetailPage />
                    </Suspense>
                  </div>
                } />

                <Route path="/hubs/:id" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyHubDetailPage />
                    </Suspense>
                  </div>
                } />
                {/* Legacy redirects: preserve bookmarks/links to the old /cloud-routers and /gateways paths */}
                <Route path="/cloud-routers/:id" element={<LegacyHubRedirect />} />
                <Route path="/gateways/:id" element={<LegacyHubRedirect />} />

                <Route path="/vnfs/:id" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyVNFDetailPage />
                    </Suspense>
                  </div>
                } />

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
              </ProtectedRoute>
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
            {/* SmartAssistant removed */}
            <FeedbackWidget onStartTour={tour.startTour} />
            <DemoBar />
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