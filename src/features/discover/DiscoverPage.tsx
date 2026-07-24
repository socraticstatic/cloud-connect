import { UnifiedDiscovery } from './UnifiedDiscovery';
import { StackPanel } from './StackPanel';
import { AssessmentBanner } from '../assessment/AssessmentBanner';


export function DiscoverPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6">
      <AssessmentBanner />
      <StackPanel />
      <UnifiedDiscovery />
    </div>
  );
}
