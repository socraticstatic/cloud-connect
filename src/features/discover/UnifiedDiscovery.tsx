import { useEffect, useState } from 'react';
import { ChevronRight, Globe, Link2, MapPin, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { useRevealStagger } from './useRevealStagger';
import { FlowBar } from '../../components/flow/FlowBar';
import { AttentionTag } from '../../components/viz/AttentionTag';
import { ProviderLogo } from '../../components/brand/ProviderLogo';
import { VpcMap } from './VpcMap';
import { DiscoveryWizard } from './DiscoveryWizard';
import { cloudConnection, regionConnection, connMeta } from './connectionState';
import {
  allKeys,
  cloudRegionCount,
  cloudVpcCount,
  cloudKey,
  regionKey,
  vpcKey,
  estateStats,
  openSummary,
  regionsOf,
  vpcsOf,
  tagHex,
  tagLabel,
  toggleKey,
  branchKey,
  branchesOf,
  selectionKind,
  selectionMemberIds,
  type Branch,
  type Cloud,
  type Region,
  type Vpc,
  type Tag,
} from './discoveryModel';
import {
  ID_RENAME_WARNING,
  KIND_LABEL,
  groupIdFromName,
  kindNoun,
} from '../govern/groupLanguage';
import type { CloudControl } from '../../engine/types';

/* ------------------------------ atoms ------------------------------ */

function StatTiles({ items }: { items: { v: React.ReactNode; l: string }[] }) {
  return (
    <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
      {items.map((it, i) => (
        <div key={i} className="min-w-[54px] rounded-lg border border-fw-secondary bg-fw-wash px-2.5 py-1 text-center">
          <div className="text-figma-sm font-semibold leading-tight text-fw-heading tabular-nums">{it.v}</div>
          <div className="whitespace-nowrap text-[10px] uppercase tracking-wide text-fw-bodyLight">{it.l}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Connection-state indicator for cloud & region rows (Pure Discovery D2).
 * Connected reads "via the AT&T fabric" (green, link); not-connected reads
 * "public internet" (slate, globe). The specific on-ramp is abstracted away.
 * This supersedes the older Private/Public badge on cloud & region rows so the
 * row conveys connected-state once, cleanly.
 */
function ConnIndicator({ cc, cloudId, regionId }: { cc: CloudControl; cloudId: string; regionId?: string }) {
  const state = regionId ? regionConnection(cc, cloudId, regionId) : cloudConnection(cc, cloudId);
  const meta = connMeta(state);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        meta.connected
          ? 'border-fw-success bg-fw-successLight text-fw-success'
          : 'border-fw-secondary bg-fw-wash text-fw-bodyLight'
      }`}
      title={meta.connected ? 'Reached over the AT&T fabric' : 'Reachable over the public internet'}
    >
      {meta.connected ? <Link2 size={12} aria-hidden="true" /> : <Globe size={12} aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

/** Leaf (VPC) attach badge — the detailed Private/Public signal stays here. */
function Badge({ attached }: { attached: boolean }) {
  return attached ? (
    <span className="inline-flex items-center rounded-full border border-fw-success bg-fw-successLight px-2 py-0.5 text-[11px] font-medium text-fw-success">
      Private
    </span>
  ) : (
    <AttentionTag icon="globe">Public</AttentionTag>
  );
}

const AiFlag = () => (
  <span className="rounded-full border border-fw-primary/30 bg-fw-accent px-1.5 py-px text-[10px] font-medium text-fw-primary">
    GPU / AI
  </span>
);

const Chevron = ({ open }: { open: boolean }) => (
  <ChevronRight
    size={16}
    className={`shrink-0 text-fw-bodyLight transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    aria-hidden="true"
  />
);

/* --------------------------- selection --------------------------- */

/** The pick control. A checkbox, not a row click: expanding a node to look
 *  inside it and choosing it are different acts, and one control cannot
 *  honestly mean both. Sits OUTSIDE the disclosure button — a checkbox
 *  nested in a button is not operable. */
function SelectBox({
  id,
  name,
  selected,
  onToggle,
}: {
  id: string;
  name: string;
  selected: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={selected}
      onChange={() => onToggle(id)}
      aria-label={`Select ${name}`}
      className="h-4 w-4 shrink-0 rounded border-fw-secondary accent-[#0057b8]"
    />
  );
}

/** Customer premises. Deliberately NOT inside the cloud tree: a branch is a
 *  building the customer owns, not a resource any hyperscaler holds, and
 *  nesting it under a cloud would assert a containment that is not true.
 *  It sits above the clouds because that is where the traffic starts. */
function SitesPanel({
  branches,
  selected,
  onToggle,
}: {
  branches: Branch[];
  selected: ReadonlySet<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div
      data-testid="discover-sites"
      data-tour="discover-sites"
      className="rounded-2xl border border-fw-secondary bg-fw-base"
    >
      <div className="flex items-center gap-2 border-b border-fw-secondary px-4 py-3">
        <MapPin size={16} className="shrink-0 text-fw-bodyLight" aria-hidden="true" />
        <span className="font-semibold text-fw-heading">Your sites</span>
        <span className="text-figma-xs text-fw-bodyLight">
          {branches.length} premises · your own buildings, not a cloud
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map(b => {
          const key = branchKey(b.id);
          const on = selected.has(key);
          return (
            <li
              key={b.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                on ? 'border-fw-active bg-fw-ctaGhost' : 'border-fw-secondary bg-fw-wash/40'
              }`}
            >
              <SelectBox id={key} name={b.name} selected={on} onToggle={onToggle} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-figma-sm font-medium text-fw-heading">{b.name}</div>
                <div className="truncate text-[11px] text-fw-bodyLight">
                  {b.city} · <span className="font-mono">{(b.cidrs || []).join(', ')}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** What the selection is, and the one thing you can do with it. Naming what
 *  you found is the only mutation Discover sanctions — there is no attach,
 *  fix or provision here, deliberately. */
/* id of the id-preview note — swapped into the name input's aria-describedby
   when the id is not taken. Same idiom as GroupBuilder's gb-id-note /
   ID_TAKEN_WARNING_ID (GroupBuilder.tsx:29-34): without this, the generated
   id and the "already taken" warning are visible only, and a screen-reader
   user typing a name never hears either. */
const ID_NOTE_ID = 'disc-id-note';
const ID_TAKEN_WARNING_ID = 'disc-id-taken-warning';

function SelectionBar({
  cc,
  selected,
  onClear,
  onCreated,
}: {
  cc: CloudControl;
  selected: ReadonlySet<string>;
  onClear: () => void;
  onCreated: (label: string, id: string) => void;
}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [failed, setFailed] = useState(false);

  const kind = selectionKind(selected);
  const members = selectionMemberIds(selected);
  const id = groupIdFromName(name);
  const taken = !!id && (cc.groupList() as { id: string }[]).some(g => g.id === id);

  // Same engine function the saved group will use, so what the bar promises
  // and what the group holds cannot drift.
  const resolved = cc.resolveGroupSpec({ kind, members, predicates: [] }) as { count: number };

  const create = () => {
    if (!id || taken) return;
    const made = cc.addGroup({ id, label: name.trim(), kind, members, predicates: [], desc: 'Named from Discover' });
    if (!made) {
      setFailed(true);
      return;
    }
    setName('');
    setNaming(false);
    setFailed(false);
    onCreated(name.trim(), id);
  };

  // A failed create describes a specific, now-stale attempt (a specific id,
  // claimed the instant it was submitted). Editing the name or backing out
  // of the form makes that description belong to nothing that was actually
  // attempted, so both close the banner it would otherwise leave behind.
  const changeName = (next: string) => {
    setName(next);
    setFailed(false);
  };
  const cancelNaming = () => {
    setNaming(false);
    setFailed(false);
  };

  return (
    <div
      data-testid="discover-selection"
      className="sticky top-2 z-20 rounded-xl border border-fw-active bg-fw-base p-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-figma-sm font-semibold text-fw-heading">
          {selected.size} selected
        </span>
        <span
          data-testid="selection-kind"
          className="inline-flex items-center rounded-full border border-fw-secondary bg-fw-wash px-2 py-0.5 text-[11px] font-medium text-fw-body"
        >
          {KIND_LABEL[kind]}
        </span>
        <span className="text-figma-xs text-fw-bodyLight">
          {resolved.count} {kindNoun(kind, resolved.count)}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {!naming && (
            <button
              type="button"
              onClick={() => setNaming(true)}
              className="inline-flex h-8 items-center rounded-full bg-fw-active px-3.5 text-figma-xs font-medium text-white transition-colors hover:bg-fw-linkHover"
            >
              Group these
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-fw-secondary text-fw-bodyLight transition-colors hover:bg-fw-wash"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {naming && (
        <div className="mt-3 space-y-2 border-t border-fw-secondary pt-3">
          <div>
            <label className="block text-figma-xs text-fw-bodyLight" htmlFor="disc-group-name">
              Group name
            </label>
            <input
              id="disc-group-name"
              value={name}
              onChange={e => changeName(e.target.value)}
              aria-describedby={taken ? ID_TAKEN_WARNING_ID : ID_NOTE_ID}
              className="h-9 w-full max-w-sm rounded-lg border border-fw-secondary bg-fw-wash px-3 text-figma-sm"
            />
          </div>
          {/* The id, before the commit — it is what every policy stores, and
              showing it after saving would be showing it too late. */}
          <p id={ID_NOTE_ID} className="text-figma-xs text-fw-bodyLight">
            Policies will store this group as{' '}
            <code
              data-testid="discover-group-id"
              className="rounded bg-fw-neutral px-1.5 py-0.5 font-mono text-fw-heading"
            >
              {id || '—'}
            </code>
          </p>
          <p data-testid="discover-group-warning" className="text-figma-xs text-fw-bodyLight">
            {ID_RENAME_WARNING}
          </p>
          {taken && (
            <p id={ID_TAKEN_WARNING_ID} role="alert" className="text-figma-xs text-fw-body">
              “{id}” is already taken. Policies reference this id, so it has to be unique — pick a
              different name.
            </p>
          )}
          {failed && (
            <p role="alert" className="text-figma-xs text-fw-body">
              Could not create “{id}” — that id was claimed the instant this was submitted. Nothing
              was lost; pick a different name.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={create}
              disabled={!id || taken}
              aria-disabled={!id || taken}
              className="h-8 rounded-full bg-fw-active px-4 text-figma-xs font-medium text-white transition-colors hover:bg-fw-linkHover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-fw-active"
            >
              Create group
            </button>
            <button
              type="button"
              onClick={cancelNaming}
              className="h-8 rounded-full border border-fw-secondary px-4 text-figma-xs font-medium text-fw-body transition-colors hover:bg-fw-wash"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ view ------------------------------ */

export function UnifiedDiscovery() {
  const cc = useCloudControlActions();
  // Subscribe the whole tree to engine mutations (attach / fix / sim) so
  // badges, stat tiles and map violations re-render when posture changes.
  useCloudControl(() => 0);

  const clouds = cc.clouds as Cloud[];
  const tags = cc.TAGS as Record<string, Tag>;
  const stats = estateStats(cc);
  const publicWorkloads = clouds.filter(c => !c.attached).reduce((s, c) => s + c.workloads, 0);

  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['aws']));
  const toggle = (key: string) => setOpen(o => toggleKey(o, key));

  /* Selection is its own set. toggleKey is reused for the immutable flip —
     the same operation on a different set — but the two sets never merge:
     expanding a region must not select it, and clearing a selection must
     not collapse the tree. */
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const toggleSelect = (key: string) => setSelected(s => toggleKey(s, key));
  const [named, setNamed] = useState<{ label: string; id: string } | null>(null);
  const branches = branchesOf(cc);

  // "+ Connect a cloud" wizard + the "discovered just now" flash it triggers.
  const [wizardOpen, setWizardOpen] = useState(false);
  const [justDiscovered, setJustDiscovered] = useState<string | null>(null);
  useEffect(() => {
    if (!justDiscovered) return;
    const t = setTimeout(() => setJustDiscovered(null), 2800);
    return () => clearTimeout(t);
  }, [justDiscovered]);
  const onDiscovered = (cloudId: string) => {
    setOpen(o => new Set(o).add(cloudKey(cloudId)));
    setJustDiscovered(cloudId);
  };

  // Reveal stagger runs on the top-level cloud rows (+1 slot for the finding strip).
  const stagger = useRevealStagger(clouds.length + 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-figma-2xl font-semibold text-fw-heading">Discover</h1>
          <p className="text-figma-sm text-fw-bodyLight">
            Your estate across every cloud — connect an account, scan it, browse every region, VPC and subnet.
          </p>
        </div>
        <button
          type="button"
          data-tour="discover-connect"
          onClick={() => setWizardOpen(true)}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#0057b8] px-4 text-figma-sm font-semibold text-white transition-colors hover:bg-[#00478f]"
        >
          <Plus size={16} aria-hidden="true" /> Connect a cloud
        </button>
      </div>

      <FlowBar
        cta={
          publicWorkloads > 0
            ? { label: `Attach ${publicWorkloads} public workloads`, to: '/connect?from=discover' }
            : undefined
        }
      />

      {/* Estate header — full-width now the fabric rail is gone */}
      <div data-tour="discover-estate" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map(s => (
          <div key={s.key} className="rounded-xl border border-fw-secondary bg-fw-base px-3 py-2.5">
            <div className="text-figma-lg font-semibold text-fw-heading tabular-nums">{s.value}</div>
            <div className="text-[11px] uppercase tracking-wide text-fw-bodyLight">{s.label}</div>
          </div>
        ))}
      </div>

      <SitesPanel branches={branches} selected={selected} onToggle={toggleSelect} />

      {selected.size > 0 && (
        <SelectionBar
          cc={cc}
          selected={selected}
          onClear={() => setSelected(new Set())}
          onCreated={(label, id) => {
            setSelected(new Set());
            setNamed({ label, id });
          }}
        />
      )}

      {/* Naming what you found is the only mutation Discover makes, and it
          changes nothing about the estate — so the confirmation points at
          where the group now lives rather than offering to act on it. */}
      {named && selected.size === 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-fw-secondary bg-fw-wash px-4 py-3 text-figma-sm text-fw-body"
        >
          <span>
            “{named.label}” is now a group. Nothing in the estate changed — you named what you
            found.
          </span>
          <Link
            to="/govern?tab=groups"
            className="font-medium text-fw-link underline underline-offset-2"
          >
            See it in Govern → Groups
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {/* Tree controls */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wide text-fw-bodyLight">{openSummary(open)}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(new Set(allKeys(cc)))}
              className="h-7 rounded-full border border-fw-secondary bg-fw-base px-3 text-figma-xs font-medium text-fw-body transition-colors hover:bg-fw-wash"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setOpen(new Set())}
              className="h-7 rounded-full border border-fw-secondary bg-fw-base px-3 text-figma-xs font-medium text-fw-body transition-colors hover:bg-fw-wash"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* Cloud tree */}
        <div className="space-y-2.5">
          {clouds.map((c, i) => {
            const ck = cloudKey(c.id);
            const cOpen = open.has(ck);
            const flash = justDiscovered === c.id;
            return (
              <div
                key={flash ? `${c.id}-flash` : c.id}
                style={stagger(i)}
                className={`rounded-2xl border border-fw-secondary bg-fw-base transition-all ${flash ? 'discovered-flash' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(ck)}
                  aria-expanded={cOpen}
                  aria-label={c.name}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fw-wash/60"
                >
                  <Chevron open={cOpen} />
                  <ProviderLogo id={c.id} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-fw-heading">{c.name}</span>
                      {c.ai && <AiFlag />}
                    </div>
                    <div className="text-figma-xs text-fw-bodyLight">
                      {cloudRegionCount(cc, c.id)} regions · {cloudVpcCount(cc, c.id)} VPC/VNet · {c.workloads} workloads
                    </div>
                  </div>
                  <StatTiles
                    items={[
                      { v: cloudRegionCount(cc, c.id), l: 'Regions' },
                      { v: cloudVpcCount(cc, c.id), l: 'VPC/VNet' },
                      { v: c.workloads, l: 'Workloads' },
                    ]}
                  />
                  <ConnIndicator cc={cc} cloudId={c.id} />
                </button>

                {cOpen && (
                  <div className="space-y-2 border-t border-fw-secondary py-2 pl-4 pr-2 sm:pl-6">
                    {regionsOf(cc, c.id).length === 0 && (
                      <div className="px-3 py-2 text-[11px] text-fw-bodyLight">No regions discovered in this cloud yet.</div>
                    )}
                    {regionsOf(cc, c.id).map((r: Region) => {
                      const rk = regionKey(c.id, r.id);
                      const rOpen = open.has(rk);
                      return (
                        <div
                          key={r.id}
                          className="rounded-xl border border-fw-secondary bg-fw-wash/40 transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggle(rk)}
                            aria-expanded={rOpen}
                            aria-label={r.name}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-fw-wash"
                          >
                            <Chevron open={rOpen} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-figma-sm font-medium text-fw-heading">{r.name}</span>
                                {r.ai && <AiFlag />}
                              </div>
                              <div className="text-[11px] text-fw-bodyLight">{r.sub}</div>
                            </div>
                            <StatTiles
                              items={[
                                { v: vpcsOf(cc, r.id).length, l: 'VPC/VNet' },
                                { v: r.subnets, l: 'Subnets' },
                                { v: `${r.lat}ms`, l: 'Latency' },
                              ]}
                            />
                            <ConnIndicator cc={cc} cloudId={c.id} regionId={r.id} />
                          </button>

                          {rOpen && (
                            <div className="space-y-2 border-t border-fw-secondary px-2 py-2 sm:px-3">
                              {vpcsOf(cc, r.id).length === 0 && (
                                <div className="px-3 py-2 text-[11px] text-fw-bodyLight">No VPCs or VNets in this region yet.</div>
                              )}
                              {vpcsOf(cc, r.id).map((v: Vpc) => {
                                const vk = vpcKey(c.id, r.id, v.id);
                                const vOpen = open.has(vk);
                                const vSel = selected.has(vk);
                                return (
                                  <div
                                    key={v.id}
                                    className={`rounded-xl border bg-fw-base ${
                                      vSel ? 'border-fw-active' : 'border-fw-secondary'
                                    }`}
                                  >
                                    <div className={`flex items-center gap-2 pl-3 ${vSel ? 'bg-fw-ctaGhost' : ''} rounded-t-xl`}>
                                    <SelectBox id={vk} name={v.name} selected={vSel} onToggle={toggleSelect} />
                                    <button
                                      type="button"
                                      onClick={() => toggle(vk)}
                                      aria-expanded={vOpen}
                                      aria-label={v.name}
                                      className="flex flex-1 items-center gap-3 py-2.5 pr-3 text-left transition-colors hover:bg-fw-wash/60"
                                    >
                                      <Chevron open={vOpen} />
                                      <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-fw-secondary bg-fw-wash px-1.5 text-[10px] font-bold text-fw-body">
                                        {v.vnet ? 'VN' : 'VPC'}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-figma-sm font-medium text-fw-heading">{v.name}</span>
                                          {v.ai && <AiFlag />}
                                        </div>
                                        <div className="text-[11px] text-fw-bodyLight">
                                          {v.role} · <span className="font-mono">{v.cidr}</span>
                                        </div>
                                        {v.tags && v.tags.length > 0 && (
                                          <div className="mt-1 flex flex-wrap gap-1">
                                            {v.tags.map(t => {
                                              const hex = tagHex(t, tags);
                                              return (
                                                <span
                                                  key={t}
                                                  className="inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium"
                                                  style={{ color: hex, borderColor: `${hex}40`, background: `${hex}14` }}
                                                >
                                                  {tagLabel(t, tags)}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                      <StatTiles
                                        items={[
                                          { v: v.azs, l: 'AZs' },
                                          { v: v.subnets, l: 'Subnets' },
                                        ]}
                                      />
                                      <Badge attached={v.attached} />
                                    </button>
                                    </div>

                                    {vOpen && (
                                      <div className="px-3 pb-3">
                                        <VpcMap
                                          vpc={v}
                                          cloud={{ id: c.id, name: c.name, color: c.color }}
                                          region={{ id: r.id, name: r.name, sub: r.sub }}
                                          tags={tags}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {publicWorkloads > 0 && (
          <div
            role="alert"
            style={stagger(clouds.length)}
            className="flex items-center gap-2 rounded-2xl border border-l-2 border-[#cbd5e1] border-l-[#94a3b8] bg-[#f8fafc] px-4 py-3 text-figma-sm font-medium text-[#475569]"
          >
            <Globe size={15} className="shrink-0 text-[#64748b]" aria-hidden="true" />
            {publicWorkloads} workload{publicWorkloads === 1 ? '' : 's'} reachable over the public internet
          </div>
        )}
      </div>

      {wizardOpen && (
        <DiscoveryWizard onClose={() => setWizardOpen(false)} onDiscovered={onDiscovered} />
      )}
    </div>
  );
}
