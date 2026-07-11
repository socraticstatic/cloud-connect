import { UserCheck, X, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from './Button';
import { useEffect, useState } from 'react';

export function ImpersonationBanner() {
  const { impersonation, exitImpersonation } = useStore();
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    if (!impersonation.isImpersonating || !impersonation.startTime) return;

    const updateElapsed = () => {
      const start = new Date(impersonation.startTime!);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;

      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [impersonation.isImpersonating, impersonation.startTime]);

  if (!impersonation.isImpersonating || !impersonation.targetUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span className="font-medium">Viewing as:</span>
            </div>
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-semibold">{impersonation.targetUser.name}</p>
                <p className="text-xs text-amber-100">{impersonation.targetUser.email}</p>
              </div>
              <div className="h-8 w-px bg-white/30" />
              <div className="flex items-center space-x-1.5 text-sm">
                <Clock className="h-4 w-4" />
                <span>{elapsedTime}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exitImpersonation}
            className="bg-white text-orange-600 hover:bg-orange-50 border-white"
            icon={X}
          >
            Exit Impersonation
          </Button>
        </div>
      </div>
    </div>
  );
}
