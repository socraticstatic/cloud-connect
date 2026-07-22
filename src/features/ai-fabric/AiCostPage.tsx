import { AiDomainPage } from './AiDomainPage';
import { TokenBudgets } from './TokenBudgets';

/**
 * AI Fabric · Cost. The budget half of the token policies that live on
 * /ai/govern, read back as consumption: what each identity has spent today
 * against the ceiling its policy sets.
 */
export function AiCostPage() {
  return (
    <AiDomainPage
      verb="Cost"
      description="Cost control at the token layer: every identity carries a budget, and the fabric meters spend against it as requests are routed."
    >
      <TokenBudgets />
    </AiDomainPage>
  );
}
