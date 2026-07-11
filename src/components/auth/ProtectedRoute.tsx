import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const isOfflineCapable =
  window.location.protocol === 'file:' ||
  navigator.userAgent.includes('Electron');

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (isOfflineCapable) return <>{children}</>;

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-fw-wash">
        <div className="h-8 w-8 border-2 border-fw-cobalt-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
