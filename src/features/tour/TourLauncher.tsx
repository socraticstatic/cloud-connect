import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTour } from '../../hooks/useTour';
import { ProductTour, TourStep } from '../../components/tour/ProductTour';
import { activeCloudConnectTour } from './cloudConnectTour';

/**
 * Launches the guided AI-grade network tour — Discover -> Connect -> Govern ->
 * Observe -> Cost -> AI Fabric — reusing NetBond's `useTour`/`ProductTour`
 * infra. Each step in `cloudConnectTour` carries a `route`; `onStepChange`
 * navigates there before ProductTour's spotlight looks for the step's
 * `targetSelector` on the new page.
 */
export function TourLauncher() {
  const { isOpen, startTour, closeTour } = useTour('cloud-connect');
  const navigate = useNavigate();

  /* The steps of THIS run. Recomputed at every launch, not at module load:
     a step's `when` predicate (the tour's skip mechanism — see
     cloudConnectTour.ts) reads the estate and the DOM as they are the
     moment the viewer presses play, and both move between rehearsals. */
  const [steps, setSteps] = useState<TourStep[]>(activeCloudConnectTour);

  const handleStart = useCallback(() => {
    setSteps(activeCloudConnectTour());
    startTour();
  }, [startTour]);

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
        onClick={handleStart}
        aria-label="Start guided tour"
        title="Guided tour"
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-fw-bodyLight hover:text-fw-body hover:bg-fw-wash transition-colors"
      >
        <Play className="h-[18px] w-[18px]" />
      </button>

      <ProductTour
        steps={steps}
        isOpen={isOpen}
        onClose={closeTour}
        onComplete={closeTour}
        onStepChange={handleStepChange}
        storageKey="tour-cloud-connect-completed"
        resetOnOpen
      />
    </>
  );
}
