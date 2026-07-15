import { TourStep } from '../../components/tour/ProductTour';
import { CC } from '../../engine';
import { DEMO_BEATS } from '../demo/demoScript';

// The Cost beat is the single source of truth for the Cost step's copy — the
// six-beat demo arc (demoScript.ts) owns the narrative; the Tour renders it.
const COST_BEAT = DEMO_BEATS.find(b => b.route === '/cost')!;

/**
 * Guided tour of Cloud Connect — the six-beat MVP demo arc:
 * Discover → Connect → Govern → Observe → Cost → AI Fabric. Step order and the
 * Cost step's copy are bound to `DEMO_BEATS` (demoScript.ts), the single source
 * of truth for the narrative; NetOps is intentionally not part of this arc.
 *
 * Each step's `targetSelector` is a `data-tour` attribute added to the relevant
 * component, and each `route` is the HashRouter path for that section.
 * `ProductTour` is route-agnostic — the consuming `TourLauncher` navigates on
 * `onStepChange` before the spotlight looks for the target on the new page.
 *
 * A step's target is only spotlighted if it's already in the DOM — so every
 * step below targets an element visible on that section's *default* tab.
 */
export const cloudConnectTour: (TourStep & { route: string })[] = [
  {
    id: 'discover',
    title: 'Discover the estate',
    description:
      'A read-only scan mapped the estate — clouds, regions, and VPCs — with no agents installed and nothing changed. This table is the finding: most of it reaches the world over public internet, including the GPU clouds. Bytes → workloads → tokens starts here.',
    route: '/discover',
    targetSelector: '[data-tour="discover-estate"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'connect',
    title: 'Attach — NaaS in one click',
    description:
      'Connectivity as a service: no circuits ordered, no boxes racked. This provisions a NetBond on-ramp and attaches the GPU clouds. Watch the fabric lines turn green and start flowing — private paths replace the public-internet routes from Discover.',
    route: '/connect',
    targetSelector: '[data-tour="connect-onramp"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: 'Provision & attach the GPU clouds',
      onClick: () => CC.activateOnramp('nb2'),
    },
  },
  {
    id: 'govern',
    title: 'Govern with real rules',
    description:
      'Policy the way operators write it: IF traffic FROM tag TO destination THEN action, with a dry-run preview against live flows before anything enforces. Enforcing this rule inserts an inline inspection point — the routes in Discover physically rewire.',
    route: '/govern',
    targetSelector: '[data-tour="govern-rules"]',
    placement: 'top',
    highlightPadding: 12,
    action: {
      label: 'Enforce: inspect classified egress',
      onClick: () => CC.enforceAny('pol-insp'),
    },
  },
  {
    id: 'observe',
    title: 'Observe the bytes',
    description:
      'Telemetry derives from the same model every other tab reads. Attaching an on-ramp steps these latency lines down to the private envelope, and egress shifts toward committed pricing. Hover for the crosshair; the charts are live, not a snapshot.',
    route: '/observe',
    targetSelector: '[data-tour="observe-telemetry"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'cost',
    title: COST_BEAT.title,
    description: COST_BEAT.narration,
    route: '/cost',
    targetSelector: '[data-tour="cost-hero"]',
    placement: 'top',
    highlightPadding: 12,
  },
  {
    id: 'ai-fabric',
    title: 'Token policies under governance',
    description:
      'The tokens layer gets the same treatment as bytes: every app has a budget, a scope, and an optional guardrail. Enforce a policy here and a classified request to an external model is denied at the token layer — the network never carries it.',
    route: '/ai-fabric',
    targetSelector: '[data-tour="aifabric-policies"]',
    placement: 'top',
    highlightPadding: 12,
  },
];
