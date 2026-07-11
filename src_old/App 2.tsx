import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy, memo } from 'react';
import { DashboardLayout } from './components/common/layouts';
import { SubNav } from './components/navigation/SubNav';
import { ConnectionGrid } from './components/ConnectionGrid';
import { ToastContainer } from './components/common/ToastContainer';
import { ConnectionTabs } from './components/connection/ConnectionTabs';
import { useStore } from './store/useStore';
import { ThemeProvider } from './components/ThemeProvider';
import { MobileMenu } from './components/navigation/MobileMenu';
import { SmartAssistant } from './components/SmartAssistant';
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

// Optimized lazy loading with better error handling
const LazyConnectionWizard = lazy(() =>
  import('./components/wizard/ConnectionWizard').then(module => ({
    default: module.ConnectionWizard
  }))
);

const LazyAPIToolbox = lazy(() =>
  import('./components/api-toolbox/APIToolbox').then(module => ({
    default: module.APIToolbox
  }))
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

const LazyHelpResourcesPage = lazy(() =>
  import('./components/pages/HelpResourcesPage').then(module => ({
    default: module.HelpResourcesPage
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

const LazyCloudRouterDetailPage = lazy(() =>
  import('./components/pages/CloudRouterDetailPage').then(module => ({
    default: module.CloudRouterDetailPage
  }))
);

const LazyVNFDetailPage = lazy(() =>
  import('./components/pages/VNFDetailPage').then(module => ({
    default: module.VNFDetailPage
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

const LazyPlatformAdminPage = lazy(() =>
  import('./components/platform-admin/PlatformAdminPage').then(module => ({
    default: module.PlatformAdminPage
  }))
);

const LazyAWSWorkflowPage = lazy(() =>
  import('./components/pages/AWSWorkflowPage').then(module => ({
    default: module.default
  }))
);

const LazyTenantDetailPage = lazy(() =>
  import('./components/platform-admin/TenantDetailPage').then(module => ({
    default: module.TenantDetailPage
  }))
);

// Optimized loading fallback
const LoadingFallback = memo(() => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" color="brand" />
  </div>
));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const connections = useStore(state => state.connections);
  const groups = useStore(state => state.groups);
  const [activeTab, setActiveTab] = useState<'connections' | 'marketplace' | 'groups' | 'control-center'>('connections');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const tour = useTour('main-app');
  const pwaUpdate = usePWAUpdate();

  // Check if current route is a detached window
  const isDetachedWindow = location.pathname.startsWith('/detached/');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const initApp = () => setTimeout(() => {
      setIsInitializing(false);
      if (!tour.hasCompleted && !isMobile) {
        setTimeout(() => tour.startTour(), 1000);
      }
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
          <ImpersonationBanner />
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

            {/* Main app routes - with layout wrapper */}
            <Route path="*" element={
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
                        title="Create Connection"
                        description="Set up a new network connection"
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

                <Route path="/api-toolbox" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyAPIToolbox />
                    </Suspense>
                  </AsyncBoundary>
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
                      title="Network Connections"
                      description="Manage your network connections across clouds and data centers"
                    >
                      <div className="mb-8">
                        <ConnectionTabs
                          activeTab={activeTab}
                          onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                          connectionCount={safeConnections.length}
                          groupCount={safeGroups.length}
                        />
                      </div>
                      {activeTab === 'connections' ? (
                        <ConnectionGrid connections={safeConnections} />
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
                        title="Network Monitoring"
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
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyNotificationsPage />
                    </Suspense>
                  </AsyncBoundary>
                } />

                <Route path="/support" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Help & Resources"
                      description="Access documentation, support, and resources"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyHelpResourcesPage />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/aws-workflow" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyAWSWorkflowPage />
                    </Suspense>
                  </AsyncBoundary>
                } />

                <Route path="/glossary" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyGlossaryPage />
                    </Suspense>
                  </AsyncBoundary>
                } />

                <Route path="/connections/:id/*" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <Suspense fallback={<LoadingFallback />}>
                      <LazyConnectionDetails />
                    </Suspense>
                  </AsyncBoundary>
                } />

                <Route path="/groups" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyManageGroupsPage />
                  </Suspense>
                } />
                
                <Route path="/groups/:id/*" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyGroupDetailsPage />
                  </Suspense>
                } />

                <Route path="/pools/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyPoolDetailPage />
                  </Suspense>
                } />

                <Route path="/cloud-routers/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyCloudRouterDetailPage />
                  </Suspense>
                } />

                <Route path="/vnfs/:id" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LazyVNFDetailPage />
                  </Suspense>
                } />

                <Route path="/configure/platform/tenants/:id/*" element={
                  <AsyncBoundary fallback={<LoadingFallback />}>
                    <SubNav
                      title="Tenant Details"
                      description="View and manage tenant configuration"
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <LazyTenantDetailPage />
                      </Suspense>
                    </SubNav>
                  </AsyncBoundary>
                } />

                <Route path="/" element={<Navigate to="/manage" />} />
                
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md p-8">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <h2 className="text-xl font-medium text-gray-800 mb-6">Page Not Found</h2>
                      <button 
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-brand-blue text-white rounded-full hover:bg-brand-darkBlue"
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
        
        {!isDetachedWindow && (
          <>
            <MobileMenu
              isOpen={false}
              onClose={() => {}}
              userInfo={userInfo}
              notifications={3}
            />
            <SmartAssistant />
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