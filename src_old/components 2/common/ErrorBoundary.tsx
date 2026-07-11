import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  logError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Optional custom error logging
    if (this.props.logError) {
      this.props.logError(error, errorInfo);
    }
    
    this.setState({ errorInfo });
    
    // Report to an error monitoring service if available
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left border-t pt-4">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Technical Details
                </summary>
                <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-[200px] text-left">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Allow for easier typing
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
    };
  }
}