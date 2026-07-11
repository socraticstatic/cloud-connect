import { ReactNode, useState, useEffect } from 'react';
import { MainNav } from '../../navigation/MainNav';
import { SubNav } from '../../navigation/SubNav';
import { ToastContainer } from '../ToastContainer';
import { ErrorBoundary } from '../ErrorBoundary';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  children: ReactNode;
}

export function DashboardLayout({
  title,
  description,
  action,
  children
}: DashboardLayoutProps) {
  const [isSideNavOpen, setSideNavOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // Set page as ready after initial render
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        setPageReady(true);
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Add error handling for any dynamic content
  const renderContent = () => {
    try {
      return children;
    } catch (error) {
      console.error('Error rendering dashboard content:', error);
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Content</h3>
            <p className="text-gray-600 mb-4">We encountered a problem loading this content.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-blue text-white rounded-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-white ${pageReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <ErrorBoundary>
        <MainNav />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <ToastContainer />
      </ErrorBoundary>
      
      {(title || description || action) && (
        <ErrorBoundary>
          <SubNav
            title={title}
            description={description}
            action={action}
          />
        </ErrorBoundary>
      )}

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1">
          <ErrorBoundary>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
              {renderContent()}
            </main>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}