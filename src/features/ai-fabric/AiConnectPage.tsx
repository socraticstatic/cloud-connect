import { AiDomainPage } from './AiDomainPage';
import { ModelCatalog } from './ModelCatalog';

/**
 * AI Fabric · Connect. The model catalog, moved here whole from the old
 * single-page AI Fabric screen: these are the endpoints the fabric attaches
 * to, and each row states whether its path is attached yet.
 */
export function AiConnectPage() {
  return (
    <AiDomainPage
      verb="Connect"
      description="Model endpoints and the neoclouds behind them. A model is governed and ready only once its path is attached — until then it is reachable, but not under control."
    >
      <ModelCatalog />
    </AiDomainPage>
  );
}
