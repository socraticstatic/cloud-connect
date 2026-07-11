import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function PWAUpdatePrompt({ onUpdate, onDismiss }: PWAUpdatePromptProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Download className="w-5 h-5 text-brand-blue" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Update Available
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              A new version is ready. Update now for the latest features.
            </p>

            <div className="flex gap-2">
              <button
                onClick={onUpdate}
                className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-darkBlue transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function usePWAUpdate() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates periodically
        const interval = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Every hour

        return () => clearInterval(interval);
      });

      // Listen for update available
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowPrompt(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    handleUpdate,
    handleDismiss
  };
}
