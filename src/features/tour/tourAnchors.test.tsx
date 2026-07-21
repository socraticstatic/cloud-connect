import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { CC } from '../../engine';
import { cloudConnectTour } from './cloudConnectTour';
import { UnifiedDiscovery } from '../discover/UnifiedDiscovery';
import { FabricHero } from '../connect/FabricHero';
import { RulesPanel } from '../govern/RulesPanel';
import { GroupsPanel } from '../govern/GroupsPanel';
import { ObservabilityShell } from '../observe/ObservabilityShell';
import { networkBinding } from '../observe/networkBinding';
import { CostPage } from '../cost/CostPage';
import { TokenPolicies } from '../ai-fabric/TokenPolicies';

/**
 * Every guided-tour step targets a `data-tour` anchor. The Discover and Observe
 * rebuilds (EstateTable→UnifiedDiscovery, TelemetryCharts→ObservabilityShell)
 * previously deleted `discover-estate` and `observe-telemetry`, silently
 * breaking the tour. This renders the screen that HOSTS each step's anchor and
 * asserts the selector resolves to a real DOM node — it fails if any anchor is
 * missing, not just if the selector string changes.
 */
const screenFor: Record<string, () => ReactElement> = {
  discover: () => <UnifiedDiscovery />,
  'discover-sites': () => <UnifiedDiscovery />,
  connect: () => <FabricHero model={CC.fabricModel()} />,
  govern: () => <RulesPanel />,
  'govern-groups': () => <GroupsPanel />,
  // The payoff beat points back at the rules table — the rule it authors has
  // to land somewhere a viewer can read it.
  'group-policy': () => <RulesPanel />,
  observe: () => <ObservabilityShell binding={networkBinding(CC)} />,
  cost: () => <CostPage />,
  'ai-fabric': () => <TokenPolicies />,
};

describe('guided-tour anchors resolve in the DOM', () => {
  for (const step of cloudConnectTour) {
    it(`step "${step.id}" anchor ${step.targetSelector} exists on its screen`, () => {
      const build = screenFor[step.id];
      expect(build, `no screen mapped for tour step "${step.id}"`).toBeTruthy();
      const { container } = render(<MemoryRouter>{build()}</MemoryRouter>);
      expect(step.targetSelector).toBeTruthy();
      expect(
        container.querySelector(step.targetSelector!),
        `anchor ${step.targetSelector} missing from "${step.id}" screen`,
      ).not.toBeNull();
    });
  }
});
