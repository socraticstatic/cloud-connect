import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { AttIcon } from '../../components/icons/AttIcon';
import { STACK_LAYERS, type NavLayer } from '../../components/navigation/navItems';
import { useCloudControlLive } from '../../engine/react/useCloudControl';
import { fmtTokens, fmtUsd } from '../ai-fabric/aiSpend';
import {
  aiStratum,
  naasStratum,
  cloudStratum,
  attachOpportunities,
  steerOpportunities,
  stagedDeltas,
  commitMoves,
  type StagedMove,
} from './stackFigures';

/**
 * The living cross-section: the stack as Discover's front door, stating live
 * engine figures per stratum — and, in design mode, a twin you can stage
 * moves on. A staged delta and the committed state read the same getters
 * (stackFigures.ts), so the panel can never promise what the estate denies.
 * Vision strata stay honest: real counts or nothing numeric.
 */

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

function Fig({ label, value, tone = 'plain' }: { label: string; value: string; tone?: 'plain' | 'warn' }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className={`text-figma-sm font-bold tabular-nums ${tone === 'warn' ? 'text-fw-warn' : 'text-fw-heading'}`}>
        {value}
      </span>
      <span className="text-[11px] font-medium text-fw-bodyLight">{label}</span>
    </span>
  );
}

function LiveBand({
  layer,
  figures,
  children,
}: {
  layer: NavLayer;
  figures: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid={`stack-band-${layer.key}`}
      className="rounded-xl border border-fw-secondary bg-fw-base px-4 py-3"
    >
      <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-figma-base font-bold text-fw-heading tracking-[-0.02em]">{layer.label}</p>
          <p className="text-figma-sm text-fw-bodyLight">{layer.blurb}</p>
        </div>
        <div className="mt-2 sm:mt-0 flex flex-wrap items-center gap-1.5 flex-shrink-0">
          {layer.items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center gap-1.5 rounded-full border border-fw-secondary bg-fw-wash px-3 py-1.5 text-figma-sm font-medium text-fw-body hover:border-fw-active hover:text-fw-link transition-colors"
            >
              <AttIcon name={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div
        data-testid={`stack-figures-${layer.key}`}
        className="mt-2.5 pt-2.5 border-t border-fw-secondary/50 flex flex-wrap items-baseline gap-x-5 gap-y-1"
      >
        {figures}
      </div>
      {children}
    </div>
  );
}

/** One stageable move, as a chip: stage it, unstage it. */
function MoveChip({
  staged,
  onToggle,
  children,
  testid,
}: {
  staged: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  testid: string;
}) {
  return (
    <button
      type="button"
      data-testid={testid}
      aria-pressed={staged}
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-figma-sm font-medium transition-colors ${
        staged
          ? 'border-fw-active bg-fw-accent text-fw-link'
          : 'border-dashed border-fw-secondary bg-fw-base text-fw-body hover:border-fw-active hover:text-fw-link'
      }`}
    >
      {staged ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

export function StackPanel() {
  // The AI band states live token money, so this panel opts into `hits`
  // ticks (see useCloudControlLive's header). The selector returns the
  // engine handle itself; every derivation below re-runs on each engine
  // version, live ticks included.
  const cc = useCloudControlLive(c => c);
  const [ai, naas] = STACK_LAYERS;
  const [designing, setDesigning] = useState(false);
  const [staged, setStaged] = useState<StagedMove[]>([]);
  const [commitNote, setCommitNote] = useState<string | null>(null);

  const aiFig = aiStratum(cc);
  const naasFig = naasStratum(cc);
  const cloudFig = cloudStratum(cc);

  const attaches = designing ? attachOpportunities(cc) : [];
  const steers = designing ? steerOpportunities(cc) : [];
  const deltas = stagedDeltas(cc, staged);

  const isStaged = (m: StagedMove) =>
    staged.some(s =>
      s.kind === 'attach' && m.kind === 'attach'
        ? s.regionId === m.regionId
        : s.kind === 'steer' && m.kind === 'steer' && s.flowId === m.flowId && s.pathId === m.pathId,
    );
  const toggleMove = (m: StagedMove) =>
    setStaged(prev => (isStaged(m) ? prev.filter(s => JSON.stringify(s) !== JSON.stringify(m)) : [...prev, m]));

  const discard = () => {
    setStaged([]);
    setDesigning(false);
    setCommitNote(null);
  };

  const commit = () => {
    const failed = commitMoves(cc, staged);
    setCommitNote(
      failed.length === 0
        ? `${staged.length} move${staged.length === 1 ? '' : 's'} committed to the estate. Undo reverts them.`
        : `${staged.length - failed.length} committed · ${failed.length} refused by the engine.`,
    );
    setStaged([]);
    setDesigning(false);
  };

  return (
    <section
      aria-label="The network stack"
      data-testid="stack-panel"
      className="rounded-2xl border border-fw-secondary bg-fw-base p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-3">
        <div>
          <h2 className="text-figma-base font-bold text-fw-heading tracking-[-0.02em]">The stack</h2>
          <p className="text-figma-sm text-fw-bodyLight">
            Pick the layer you work on. The four verbs are the same on every one.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-testid="design-toggle"
            aria-pressed={designing}
            onClick={() => (designing ? discard() : (setDesigning(true), setCommitNote(null)))}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-figma-sm font-medium transition-colors ${
              designing
                ? 'border-fw-active bg-fw-accent text-fw-link'
                : 'border-fw-secondary bg-fw-wash text-fw-body hover:border-fw-active hover:text-fw-link'
            }`}
          >
            Design on the twin
          </button>
          <Link
            to="/stack"
            className="inline-flex items-center gap-1 text-figma-sm font-medium text-fw-link hover:underline whitespace-nowrap"
          >
            Why it's organized this way <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="space-y-1.5">
        <LiveBand
          layer={ai}
          figures={
            <>
              <Fig value={`${aiFig.modelsReady}/${aiFig.modelsTotal}`} label="model endpoints ready" />
              <Fig value={fmtTokens(aiFig.tokensToday)} label="tokens today" />
              {aiFig.ungovernedTokensToday > 0 && (
                <Fig value={fmtTokens(aiFig.ungovernedTokensToday)} label="rode the public internet" tone="warn" />
              )}
              <Fig value={fmtUsd(aiFig.spendToday)} label={`spend today · ${aiFig.identityCount} identities`} />
            </>
          }
        >
          {designing && (
            <p className="mt-2 text-[11px] font-medium text-fw-bodyLight">
              No stageable moves on this stratum yet — token policy changes live on AI Fabric · Govern.
            </p>
          )}
        </LiveBand>

        {/* Cloud — a vision stratum; it states only what the estate contains. */}
        <div
          data-testid="stack-band-cloud"
          className="rounded-xl border border-dashed border-fw-secondary bg-fw-wash/50 px-4 py-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="min-w-0">
            <p className="text-figma-base font-bold text-fw-bodyLight tracking-[-0.02em]">
              Cloud
              <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.08em] text-fw-bodyLight">
                its own layer, next
              </span>
            </p>
            <p className="text-figma-sm text-fw-bodyLight">
              {cloudFig.clouds} clouds · {cloudFig.regions} regions · {cloudFig.vpcs} VPCs in the estate today.
            </p>
          </div>
          <Link
            to="/naas/connect"
            className="mt-2 sm:mt-0 inline-flex items-center gap-1 text-figma-sm font-medium text-fw-link hover:underline whitespace-nowrap flex-shrink-0"
          >
            Cloud attach lives in NaaS · Connect today <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <LiveBand
          layer={naas}
          figures={
            <>
              <Fig value={`${naasFig.regionsAttached}/${naasFig.regionsTotal}`} label="regions on the fabric" />
              <Fig value={`${naasFig.sites}`} label="sites" />
              <Fig value={`${money(naasFig.egressPubMo)}/mo`} label="egress on public transit" tone={naasFig.egressPubMo > 0 ? 'warn' : 'plain'} />
              <Fig value={`${money(naasFig.availableSavingsMo)}/mo`} label="still on the table" />
            </>
          }
        >
          {designing && (attaches.length > 0 || steers.length > 0) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5" data-testid="naas-moves">
              {attaches.map(o => {
                const move: StagedMove = { kind: 'attach', regionId: o.regionId };
                return (
                  <MoveChip
                    key={o.regionId}
                    testid={`move-attach-${o.regionId}`}
                    staged={isStaged(move)}
                    onToggle={() => toggleMove(move)}
                  >
                    Attach {o.label} · {o.publicMs}→{o.privateMs} ms on the fabric
                    {o.bucketSavingMo !== null && ` · ${money(o.bucketSavingMo)}/mo`}
                  </MoveChip>
                );
              })}
              {steers.map(o => {
                const move: StagedMove = { kind: 'steer', flowId: o.flowId, pathId: o.pathId };
                return (
                  <MoveChip
                    key={`${o.flowId}:${o.pathId}`}
                    testid={`move-steer-${o.flowId}`}
                    staged={isStaged(move)}
                    onToggle={() => toggleMove(move)}
                  >
                    Steer {o.label} onto the fabric
                    {o.egressSavingMo !== null && ` · ${money(o.egressSavingMo)}/mo`}
                  </MoveChip>
                );
              })}
            </div>
          )}
        </LiveBand>

        {/* Transport & Access — media are siblings, not layers of each other. */}
        <div
          data-testid="stack-band-transport"
          className="rounded-xl border border-dashed border-fw-secondary bg-fw-wash/50 px-4 py-2.5"
        >
          <p className="text-figma-base font-bold text-fw-bodyLight tracking-[-0.02em]">
            Transport &amp; Access
            <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.08em] text-fw-bodyLight">
              vision
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {['Fiber', 'Dark fiber', 'Wireless · 5G · FirstNet', 'Satellite'].map(m => (
              <span
                key={m}
                className="rounded-full border border-dashed border-fw-secondary px-3 py-1 text-figma-sm font-medium text-fw-bodyLight select-none"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The tray: what the staged moves would do, in the engine's own figures. */}
      {(designing && staged.length > 0) || commitNote ? (
        <div
          data-testid="design-tray"
          className="mt-3 rounded-xl border border-fw-active bg-fw-accent/60 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4"
        >
          <p aria-live="polite" className="text-figma-sm font-medium text-fw-heading">
            {commitNote ?? (
              <>
                {deltas.moves} move{deltas.moves === 1 ? '' : 's'} staged
                {deltas.worstPath &&
                  ` · ${deltas.worstPath.label} ${deltas.worstPath.publicMs}→${deltas.worstPath.privateMs} ms on the fabric`}
                {deltas.egressSavingMo > 0 && ` · keeps ${money(deltas.egressSavingMo)}/mo of egress`}
                {deltas.unpricedMoves.length > 0 &&
                  ` · ${deltas.unpricedMoves.join(', ')}: the engine prices no saving yet`}
              </>
            )}
          </p>
          {!commitNote && (
            <div className="mt-2 sm:mt-0 flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                data-testid="design-discard"
                onClick={discard}
                className="rounded-full border border-fw-secondary bg-fw-base px-4 py-1.5 text-figma-sm font-medium text-fw-body hover:border-fw-primary"
              >
                Discard
              </button>
              <button
                type="button"
                data-testid="design-commit"
                onClick={commit}
                className="rounded-full bg-fw-ctaPrimary px-4 py-1.5 text-figma-sm font-medium text-white hover:bg-fw-ctaPrimaryHover"
              >
                Commit to the estate
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
