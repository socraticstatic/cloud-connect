import { AiDomainPage } from './AiDomainPage';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { ObservabilityShell } from '../observe/ObservabilityShell';
import { aiBinding } from '../observe/aiBinding';
import { PromptTrace } from './PromptTrace';
import { GovernanceDecisions } from './GovernanceDecisions';

/**
 * AI Fabric · Observe. Three blocks moved here whole from the old single-page
 * AI Fabric screen: the observability shell (its Observability tab) plus the
 * prompt trace and the decision log (its Trace tab).
 *
 * Order matters and is not cosmetic: GovernanceDecisions' empty state reads
 * "run a trace above to populate this view", so PromptTrace has to render
 * above it or that sentence stops being true.
 */
export function AiObservePage() {
  const observability = useCloudControl(aiBinding);

  return (
    <AiDomainPage
      verb="Observe"
      description="Observability for the token layer: live meters across every identity, then one request walked hop by hop and the decision log those traces write."
    >
      <div className="space-y-4">
        <ObservabilityShell binding={observability} />
        <PromptTrace />
        <GovernanceDecisions />
      </div>
    </AiDomainPage>
  );
}
