import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { nextMove, rankMoves } from './nextMove';

/**
 * The one recommended next step on Govern.
 *
 * PLACEMENT. This band sits INSIDE the rules card, between the card header
 * and the table head — not above the card as a panel of its own. Two reasons.
 * It is a statement about the table directly beneath it, and reading it as a
 * separate card would sever that. And the card header already carries the
 * screen's primary action ("New rule"); a second card would arrive with a
 * second header and a second primary, which is exactly the competing-blue
 * problem that was deliberately taken off this screen once already.
 *
 * WEIGHT. For the same reason the action here is a ghost-cobalt pill, not a
 * solid one. It is the more useful thing to press, but it must not out-shout
 * the header's create action, and two solid cobalt buttons a row apart read
 * as a toolbar rather than as a recommendation.
 *
 * Every figure is a live `CC` derivation taken through the SUBSCRIBING hook,
 * so enforcing anything — here, from a row menu, or from another surface —
 * re-ranks and re-renders. Nothing on this band is cached or hardcoded.
 */
export function NextMoveBand() {
  // One subscribing selector, so the recommendation and the figures it cites
  // are read at the same moment and move together.
  const view = useCloudControl(cc => ({
    move: nextMove(cc),
    remaining: rankMoves(cc).length,
    openViolations: cc.violations().length,
    posture: cc.posture(),
    totalRules: cc.ruleList().length,
  }));
  const actions = useCloudControlActions();

  const { move, remaining, openViolations, posture, totalRules } = view;

  if (!move) {
    /* Everything enforced. A real state this demo reaches, so it is designed:
       it reports the finished position in the same currency the
       recommendation used, and says what would put a card back here. Green,
       because this is the good end — never red, which is reserved for true
       violations. */
    return (
      <div
        data-testid="govern-next-move"
        className="flex items-start gap-3 border-b border-l-2 border-b-fw-secondary border-l-fw-success bg-fw-successLight px-5 py-4"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-fw-success" aria-hidden="true" />
        <div>
          <div className="text-figma-sm font-medium text-fw-heading">
            Nothing left to enforce
          </div>
          <p className="mt-0.5 text-figma-sm text-fw-body">
            All {totalRules} rule{totalRules === 1 ? '' : 's'} are enforced and {openViolations} violation
            {openViolations === 1 ? ' is' : 's are'} open. Posture stands at {posture}. Author a new rule
            and the next recommended move appears here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="govern-next-move"
      className="flex flex-col gap-3 border-b border-l-2 border-b-fw-secondary border-l-fw-active bg-fw-ctaGhost px-5 py-4 sm:flex-row sm:items-center"
    >
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fw-link" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="text-figma-xs font-medium uppercase tracking-wide text-fw-link">
          Start here
        </div>

        {/* The claim, in the currency of the list below it: violations. */}
        <p className="mt-1 text-figma-sm text-fw-body">
          Enforce{' '}
          <span className="font-medium text-fw-heading" data-testid="govern-next-move-rule">
            {move.ruleName}
          </span>{' '}
          — it clears{' '}
          <span className="font-medium text-fw-heading" data-testid="govern-next-move-cleared">
            {move.cleared}
          </span>{' '}
          of the {openViolations} open violation{openViolations === 1 ? '' : 's'}
          {/* Only claim movement when the engine actually projects some. A
              rule can clear a violation and still leave the rounded posture
              where it was, and "moves posture 60 → 60" reads as a broken
              number rather than as the true answer, which is "it doesn't". */}
          {move.postureDelta ? (
            <>
              {' '}
              and lifts posture {posture} → {posture + move.postureDelta}.
            </>
          ) : (
            '.'
          )}
        </p>

        {/* Why this one, said plainly — the ranking is not a black box, and a
            viewer who disagrees with the rule can see what to argue with. */}
        <p className="mt-1 text-figma-xs text-fw-bodyLight">
          Ranked by violations cleared, out of {remaining} unenforced rule
          {remaining === 1 ? '' : 's'}.
          {!move.projected
            ? ' This rule has no bound remediation, so its posture effect is not projected.'
            : move.postureDelta === 0 && ` Posture stays at ${posture}.`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => actions.enforceAny(move.ruleId)}
        className="inline-flex h-8 shrink-0 items-center self-start rounded-full bg-fw-base px-3.5 text-figma-xs font-medium text-fw-link ring-1 ring-inset ring-fw-active transition-colors hover:bg-fw-ctaGhost sm:self-auto"
      >
        Enforce this rule
      </button>
    </div>
  );
}
