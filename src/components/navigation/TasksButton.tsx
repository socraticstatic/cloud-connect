import { useNavigate } from 'react-router-dom';
import { AttIcon } from '../icons/AttIcon';
import { useCloudControl } from '../../engine/react/useCloudControl';
import { workQueue } from '../../features/work/workQueue';

/**
 * The Tasks badge: the queue's live count in the utility cluster, beside
 * the bell. Tasks are state that follows you, not a place - a tab is
 * silent until visited; this tells you the estate wants attention before
 * you click anything. Red when any promise is violated, cobalt otherwise.
 * Clicking opens the /tasks office. Same derivation Andi and the office
 * read (workQueue) - a lens, never a second list.
 */
export function TasksButton() {
  const navigate = useNavigate();
  const { count, violated } = useCloudControl(cc => {
    const rows = workQueue(cc);
    return {
      count: rows.length,
      violated: rows.some(r => r.status === 'violated'),
    };
  });

  return (
    <button
      type="button"
      data-testid="tasks-badge"
      aria-label={`Tasks: ${count} pending${violated ? ', promises violated' : ''}`}
      title="Every task by lifecycle stage, every standing intent"
      onClick={() => navigate('/tasks')}
      className="flex items-center justify-center h-9 w-9 text-fw-heading hover:text-fw-body transition-colors duration-200 relative"
    >
      <AttIcon name="checklist" className="h-5 w-5" />
      {count > 0 && (
        <span
          data-testid="tasks-badge-count"
          data-violated={violated ? 'true' : 'false'}
          className={`absolute -top-1 -right-1 h-4 min-w-4 px-0.5 text-figma-sm flex items-center justify-center text-white rounded-full ${
            violated ? 'bg-fw-error' : 'bg-fw-cobalt-600'
          }`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
