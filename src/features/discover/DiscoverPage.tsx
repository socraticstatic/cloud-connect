import { UnifiedDiscovery } from './UnifiedDiscovery';
import { StackPanel } from './StackPanel';
import { AssessmentBanner } from '../assessment/AssessmentBanner';

/**
 * Two columns, and the order is the argument. The page opens on "Discover"
 * because that is what the route promises: the estate, and the tree you came
 * to read. The assessment invitation and the stack cross-section are context
 * for that reading, not a preamble to it - so they sit beside it in a rail
 * rather than pushing the heading 900px down the page.
 *
 * Below lg there is no side, so the rail falls under the tree. That keeps the
 * one thing this layout is for: the page still starts where "Discover" is.
 */
export function DiscoverPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* A div, not a <main>: App.tsx already owns the one main landmark
            (#main-content), and this column renders inside it. */}
        <div className="min-w-0 flex-1">
          <UnifiedDiscovery />
        </div>
        <aside
          aria-label="Assessment and the stack"
          data-testid="discover-rail"
          className="w-full shrink-0 space-y-4 lg:w-[360px] xl:w-[400px]"
        >
          <AssessmentBanner />
          {/* rail: the panel's rows stack instead of splitting left/right,
              because Tailwind's sm: is a viewport query and this column is
              360px wide inside a 1440px window. */}
          <StackPanel rail />
        </aside>
      </div>
    </div>
  );
}
