import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTour } from '../../hooks/useTour';
import { ProductTour, TourStep } from '../../components/tour/ProductTour';
import { cloudConnectTour } from './cloudConnectTour';

/**
 * Launches the guided Cloud Connect tour — Discover -> Connect -> Govern ->
 * Observe -> AI Fabric -> NetOps — reusing NetBond's `useTour`/`ProductTour`
 * infra. Each step in `cloudConnectTour` carries a `route`; `onStepChange`
 * navigates there before ProductTour's spotlight looks for the step's
 * `targetSelector` on the new page.
 */
export function TourLauncher() {
  const { isOpen, startTour, closeTour } = useTour('cloud-connect');
  const navigate = useNavigate();

  const handleStepChange = useCallback(
    (step: TourStep) => {
      const route = (step as TourStep & { route?: string }).route;
      if (route) navigate(route);
    },
    [navigate]
  );

  return (
    <>
      <button
        type="button"
        onClick={startTour}
        className="inline-flex items-center h-9 px-3 rounded-full text-figma-xs font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors"
      >
        <Play className="h-4 w-4 mr-1.5" />
        Tour
      </button>

      <ProductTour
        steps={cloudConnectTour}
        isOpen={isOpen}
        onClose={closeTour}
        onComplete={closeTour}
        onStepChange={handleStepChange}
        storageKey="tour-cloud-connect-completed"
      />
    </>
  );
}
