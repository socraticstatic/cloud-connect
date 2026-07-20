import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CC } from '../../engine';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';

const ACTIONS = ['deny', 'inspect', 'route-private', 'allow'] as const;
const PORTS = ['any', '443', '5432', '8443'] as const;

/* A structured group destination is encoded in the single <select> as
   "group:<id>" so one control expresses both destination families. Nothing
   downstream sees the prefix — spec() turns it back into {group}. */
const GROUP_DST_PREFIX = 'group:';

/* id of the "pick a source group" warning — shared between the <p> that
   renders it and the aria-describedby on the two controls it concerns
   (#rb-dst, #rb-group), so assistive tech gets the same signal a sighted
   user gets from reading the page. */
const GROUP_WARNING_ID = 'rb-group-warning';

/* id of the "source group resolves to branches only" warning — a branch
   carries no governance tag (srcTag is null on every branch flow, by
   design), so a rule combining a branch-only group with a tag can never
   match anything. Shared between the <p> that renders it and the
   aria-describedby on the two controls it concerns (#rb-group, #rb-tag). */
const TAG_GROUP_WARNING_ID = 'rb-tag-group-warning';

/* How many matched flows the dry-run surface names before it summarises the
   rest. Enough to recognise the blast radius; not so many the form becomes
   a table. */
const NAMED_FLOW_LIMIT = 6;

const INITIAL_FORM = {
  name: '',
  tag: 'any',
  cloud: 'any',
  group: 'any',
  dst: 'any',
  ports: 'any',
  action: 'deny',
};

interface Group {
  id: string;
  label: string;
  kind: string;
}

interface MatchedFlow {
  flow: {
    id: string;
    srcName?: string;
    srcVpc?: string;
    srcBranch?: string;
    dst: string;
    dstVpc?: string;
    gbps: number;
  };
  v: string;
  bad: boolean;
}

interface Preview {
  matched: MatchedFlow[];
  gbps: number;
  blocked: number;
  pending: number;
  shadowed: unknown[];
}

/* Names, resolved live from the engine — never a lookup table copied into
   the component. A workload renamed in the estate is renamed here. */
function vpcName(id?: string): string | null {
  if (!id) return null;
  const byRegion = (CC.vpcs || {}) as unknown as Record<string, { id: string; name: string }[]>;
  for (const list of Object.values(byRegion)) {
    const hit = list.find(v => v.id === id);
    if (hit) return hit.name;
  }
  return null;
}

/* What a matched flow is TALKING TO. A group flow carries a concrete
   dstVpc; a legacy flow only carries its destination class. Prefer the
   concrete workload, fall back to the human phrasing of the class. */
function flowDstLabel(flow: MatchedFlow['flow']): string {
  return vpcName(flow.dstVpc) || (CC.DSTS as Record<string, string>)[flow.dst] || flow.dst;
}

interface RuleBuilderProps {
  /** Controlled open state. When provided, the parent owns the trigger and
   *  this component renders only the form. Omit for the self-contained
   *  variant that renders its own "New rule" button. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RuleBuilder({ open: controlledOpen, onOpenChange }: RuleBuilderProps = {}) {
  const actions = useCloudControlActions();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setInternalOpen(v));
  const [name, setName] = useState(INITIAL_FORM.name);
  const [tag, setTag] = useState(INITIAL_FORM.tag);
  const [cloud, setCloud] = useState(INITIAL_FORM.cloud);
  const [group, setGroup] = useState(INITIAL_FORM.group);
  const [dst, setDst] = useState(INITIAL_FORM.dst);
  const [ports, setPorts] = useState<string>(INITIAL_FORM.ports);
  const [action, setAction] = useState<string>(INITIAL_FORM.action);
  const [preview, setPreview] = useState<Preview | null>(null);

  // Subscribed via useCloudControl (not useCloudControlActions, which hands
  // back the engine handle without wiring a re-render). A group added or
  // renamed in the estate while the builder is open shows up here without
  // needing an unrelated field edit to force a re-render first.
  const groups = useCloudControl(cc => cc.groupList()) as Group[];

  /* src.group is OMITTED rather than set to 'any' when no group is chosen:
     the engine treats any truthy src.group as a filter, so the literal
     string 'any' would match nothing at all. */
  const spec = () => ({
    name,
    src: group === 'any' ? { tag, cloud } : { tag, cloud, group },
    dst: dst.startsWith(GROUP_DST_PREFIX) ? { group: dst.slice(GROUP_DST_PREFIX.length) } : dst,
    ports,
    action,
    chain: [] as string[],
  });

  const resetForm = () => {
    setName(INITIAL_FORM.name);
    setTag(INITIAL_FORM.tag);
    setCloud(INITIAL_FORM.cloud);
    setGroup(INITIAL_FORM.group);
    setDst(INITIAL_FORM.dst);
    setPorts(INITIAL_FORM.ports);
    setAction(INITIAL_FORM.action);
    setPreview(null);
  };

  const cancel = () => {
    resetForm();
    setOpen(false);
  };

  const submit = () => {
    // Defense in depth: the Add rule button is disabled in this state, but
    // a disabled control is a UI affordance, not a contract — refuse here
    // too so the silent-zero-match rule stays unreachable even if submit()
    // is ever reached some other way.
    if (groupNeeded || tagGroupMismatch) return;
    actions.addRule({ ...spec(), enforceNow: false });
    resetForm();
    setOpen(false);
  };

  const runDry = () => setPreview(CC.dryRun(spec()) as Preview);

  // Any field edit invalidates the last dry-run readout: it described a
  // spec that no longer matches what's on screen.
  const onField = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPreview(null);
  };

  if (!open) {
    // Controlled: the parent owns the trigger (it lives in the card header,
    // where a create action belongs — not trailing the table).
    if (isControlled) return null;
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center h-9 px-4 rounded-full text-figma-sm font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors"
      >
        New rule
      </button>
    );
  }

  const selectClass =
    'w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm';

  const groupNeeded = (dst === 'intra-group' || dst === 'not-intra-group') && group === 'any';

  /* Precise condition: NOT "group and tag both set" in general — a group
     resolving to at least one VPC (e.g. west-workloads) can legitimately
     combine with a tag, since the tag still narrows the VPC side. Only a
     group that resolves to branches with zero VPCs guarantees a silent
     zero, because every branch flow carries srcTag: null. Mutually
     exclusive with groupNeeded above: this requires group !== 'any', that
     requires group === 'any'. */
  const groupInfo = group !== 'any' ? (CC.resolveGroup(group) as { vpcIds: string[]; branchIds: string[] }) : null;
  const tagGroupMismatch = !!groupInfo && tag !== 'any' && groupInfo.vpcIds.length === 0 && groupInfo.branchIds.length > 0;

  return (
    <div className="rounded-2xl border border-fw-secondary bg-fw-base p-5 space-y-3">
      <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-name">
        Rule name
      </label>
      <input
        id="rb-name"
        value={name}
        onChange={e => onField(setName)(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm"
      />

      <div className="grid grid-cols-2 gap-3">
        {/* Source group leads the source fields: naming a group is the
            expressive way to say who a policy is about; tag and cloud
            narrow it further rather than the other way round. */}
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-group">Source group</label>
          <select id="rb-group" value={group} onChange={e => onField(setGroup)(e.target.value)}
            aria-describedby={groupNeeded ? GROUP_WARNING_ID : tagGroupMismatch ? TAG_GROUP_WARNING_ID : undefined}
            className={selectClass}>
            <option value="any">any source</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-tag">Source tag</label>
          <select id="rb-tag" value={tag} onChange={e => onField(setTag)(e.target.value)}
            aria-describedby={tagGroupMismatch ? TAG_GROUP_WARNING_ID : undefined}
            className={selectClass}>
            <option value="any">any workload</option>
            {Object.keys(CC.TAGS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-cloud">Cloud</label>
          <select id="rb-cloud" value={cloud} onChange={e => onField(setCloud)(e.target.value)}
            className={selectClass}>
            <option value="any">any cloud</option>
            {CC.clouds.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          {/* Every destination the engine can match is offered here now,
              including the two group-relative ones. They used to be
              filtered out because the form had no way to name the source
              group they are relative to; it does. */}
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-dst">Destination</label>
          <select id="rb-dst" value={dst} onChange={e => onField(setDst)(e.target.value)}
            aria-describedby={groupNeeded ? GROUP_WARNING_ID : undefined}
            className={selectClass}>
            {Object.entries(CC.DSTS).map(([k, v]) => (
              <option key={k} value={k}>{v as string}</option>
            ))}
            <optgroup label="Groups">
              {groups.map(g => (
                <option key={g.id} value={`${GROUP_DST_PREFIX}${g.id}`}>{g.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-action">Action</label>
          <select id="rb-action" value={action} onChange={e => onField(setAction)(e.target.value)}
            className={selectClass}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-ports">Ports</label>
          <select id="rb-ports" value={ports} onChange={e => onField(setPorts)(e.target.value)}
            className={selectClass}>
            {PORTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* "the same group" / "outside the group" are relative to a source
          group, and the engine deliberately matches nothing without one.
          Say that in the form rather than letting a person watch an empty
          dry run and guess why. */}
      {groupNeeded && (
        <p id={GROUP_WARNING_ID} role="alert" className="text-figma-xs text-fw-body">
          Pick a source group — “{(CC.DSTS as Record<string, string>)[dst]}” is relative to one, and
          matches nothing until this rule names which group it is about.
        </p>
      )}

      {/* A branch carries no governance tag — srcTag is null on every
          branch-originated flow, by design. A group that resolves to
          branches only (zero VPCs) combined with any tag other than "any"
          is therefore unsatisfiable, the same silent-zero-match failure the
          relative-destination warning above exists to prevent. */}
      {tagGroupMismatch && (
        <p id={TAG_GROUP_WARNING_ID} role="alert" className="text-figma-xs text-fw-body">
          “{groups.find(g => g.id === group)?.label ?? group}” resolves to branches only, and a branch
          carries no governance tag — combined with “{tag}” this rule matches nothing. Clear the tag or
          pick a group that includes a workload.
        </p>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={groupNeeded || tagGroupMismatch}
          aria-disabled={groupNeeded || tagGroupMismatch}
          title={groupNeeded ? 'Pick a source group before adding this rule'
            : tagGroupMismatch ? 'This source group and tag combination matches nothing' : undefined}
          className="h-9 px-4 rounded-full text-figma-sm font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-fw-active">
          Add rule
        </button>
        <button type="button" onClick={runDry}
          className="h-9 px-4 rounded-full text-figma-sm font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors">
          Dry run
        </button>
        <button type="button" onClick={cancel}
          className="h-9 px-4 rounded-full text-figma-sm font-medium border border-fw-secondary text-fw-body hover:bg-fw-wash transition-colors">
          Cancel
        </button>
      </div>

      {/* The dry run is the most valuable moment in a governance product:
          the blast radius, before anything changes. It gets a result
          surface with the flows NAMED — a bare count is not something a
          person can check their intent against. rounded-xl, not
          rounded-full: this is a panel, not a chip. */}
      {preview && (
        <div
          data-testid="dry-run-result"
          className="rounded-xl border border-fw-secondary bg-fw-wash overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-fw-secondary">
            <div className="text-figma-xs uppercase tracking-wide text-fw-bodyLight">
              Dry run · nothing has changed yet
            </div>
            <div className="mt-0.5 text-figma-base font-medium text-fw-heading">
              {preview.matched.length} flow{preview.matched.length === 1 ? '' : 's'} matched
              {' · '}{preview.gbps} Gbps
              {' · '}{preview.blocked} blocked
              {preview.pending > 0 && ` · ${preview.pending} pending a private path`}
              {preview.shadowed.length > 0 && ` · ${preview.shadowed.length} shadowed by a higher-priority rule`}
            </div>
          </div>

          {preview.matched.length === 0 ? (
            <p className="px-4 py-3 text-figma-sm text-fw-body">
              No flow in the estate matches this rule. Enforcing it would change nothing — widen the
              source or the destination before adding it.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-fw-secondary">
                {preview.matched.slice(0, NAMED_FLOW_LIMIT).map(m => (
                  <li key={m.flow.id} className="flex items-center gap-2 px-4 py-2 text-figma-sm">
                    <span className="font-medium text-fw-heading truncate">
                      {m.flow.srcName || m.flow.srcVpc || m.flow.srcBranch}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-fw-bodyLight" aria-hidden="true" />
                    <span className="text-fw-body truncate">{flowDstLabel(m.flow)}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-figma-xs text-fw-bodyLight">
                      {m.flow.gbps} Gbps
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center h-5 px-2 rounded-full text-figma-xs font-medium ${
                        m.bad ? 'bg-fw-neutral text-fw-bodyLight' : 'bg-fw-successLight text-fw-success'
                      }`}
                    >
                      {m.v}
                    </span>
                  </li>
                ))}
              </ul>
              {preview.matched.length > NAMED_FLOW_LIMIT && (
                <div className="px-4 py-2 text-figma-xs text-fw-bodyLight border-t border-fw-secondary">
                  + {preview.matched.length - NAMED_FLOW_LIMIT} more flow
                  {preview.matched.length - NAMED_FLOW_LIMIT === 1 ? '' : 's'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
