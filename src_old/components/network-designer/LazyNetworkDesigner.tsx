import { Suspense, lazy, useState } from 'react';
import { Connection, NetworkNode, NetworkEdge } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBoundary } from '../common/ErrorBoundary';

// Lazy load the main component with retry logic
const importNetworkDesigner = () => import('./NetworkDesigner')
  .then(module => ({ default: module.NetworkDesigner }))
  .catch(error => {
    console.error('Failed to load NetworkDesigner component:', error);
    throw error;
  });

const NetworkDesignerComponent = lazy(importNetworkDesigner);

interface LazyNetworkDesignerProps {
  onComplete: (config: Connection[]) => void;
  onCancel: () => void;
  initialNodes?: NetworkNode[];
  initialEdges?: NetworkEdge[];
  editMode?: boolean;
  connectionId?: string;
}

function LazyNetworkDesigner({ 
  onComplete, 
  onCancel,
  initialNodes = [],
  initialEdges = [],
  editMode = false,
  connectionId
}: LazyNetworkDesignerProps) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Error fallback component
  const NetworkDesignerErrorFallback = () => (
    <div className="min-h-[800px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="text-center max-w-md p-8">
        <h3 className="text-xl font-bold text-red-800 mb-4">Unable to load Network Designer</h3>
        <p className="text-gray-600 mb-6">We encountered an error loading the network designer component.</p>
        
        {retryCount < 2 ? (
          <button
            onClick={() => {
              setHasError(false);
              setRetryCount(count => count + 1);
            }}
            className="px-6 py-3 bg-brand-blue text-white rounded-full hover:bg-brand-darkBlue mb-4 w-full"
          >
            Retry Loading
          </button>
        ) : null}
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 mb-4 w-full"
        >
          Refresh Page
        </button>
        
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Loading fallback
  const LoadingFallback = (
    <div className="min-h-[800px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="text-center">
        <LoadingSpinner size="lg" color="brand" />
        <p className="mt-4 text-gray-600">Loading Network Designer...</p>
      </div>
    </div>
  );

  if (hasError) {
    return <NetworkDesignerErrorFallback />;
  }

  // Add debug logging
  console.log("LazyNetworkDesigner rendering with:", {
    initialNodesLength: initialNodes.length,
    initialEdgesLength: initialEdges.length,
    editMode,
    connectionId
  });

  return (
    <ErrorBoundary
      onReset={() => {
        setHasError(false);
        setRetryCount(count => count + 1);
      }}
      fallback={<NetworkDesignerErrorFallback />}
    >
      <Suspense fallback={LoadingFallback}>
        <NetworkDesignerComponent 
          onComplete={onComplete} 
          onCancel={onCancel}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          editMode={editMode}
          connectionId={connectionId}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

// Add default export for lazy loading
export default LazyNetworkDesigner;