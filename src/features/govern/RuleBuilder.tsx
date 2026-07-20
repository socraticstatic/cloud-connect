import { useState } from 'react';
import { CC } from '../../engine';
import { useCloudControlActions } from '../../engine/react/useCloudControl';

const ACTIONS = ['deny', 'inspect', 'route-private', 'allow'] as const;
const PORTS = ['any', '443', '5432', '8443'] as const;

// intra-group / not-intra-group are correct and needed in CC.DSTS - the
// engine matches them today. But this form has no control for src.group
// (only src.tag + src.cloud), so picking either one here would silently
// match zero flows with no explanation - the exact failure the group-aware
// engine was built to avoid. This is a sequencing gate, not an oversight:
// a later task adds a src.group control to the builder and removes this
// filter to re-enable both options. Do not remove them from CC.DSTS.
const DSTS_PENDING_SRC_GROUP_CONTROL = new Set(['intra-group', 'not-intra-group']);

const INITIAL_FORM = {
  name: '',
  tag: 'any',
  cloud: 'any',
  dst: 'any',
  ports: 'any',
  action: 'deny',
};

export function RuleBuilder() {
  const actions = useCloudControlActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(INITIAL_FORM.name);
  const [tag, setTag] = useState(INITIAL_FORM.tag);
  const [cloud, setCloud] = useState(INITIAL_FORM.cloud);
  const [dst, setDst] = useState(INITIAL_FORM.dst);
  const [ports, setPorts] = useState<string>(INITIAL_FORM.ports);
  const [action, setAction] = useState<string>(INITIAL_FORM.action);
  const [preview, setPreview] = useState<{ matched: unknown[]; gbps: number; blocked: number; pending: number; shadowed: unknown[] } | null>(null);

  const spec = () => ({ name, src: { tag, cloud }, dst, ports, action, chain: [] });

  const resetForm = () => {
    setName(INITIAL_FORM.name);
    setTag(INITIAL_FORM.tag);
    setCloud(INITIAL_FORM.cloud);
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
    actions.addRule({ ...spec(), enforceNow: false });
    resetForm();
    setOpen(false);
  };

  const runDry = () => setPreview(CC.dryRun(spec()));

  // Any field edit invalidates the last dry-run readout: it described a
  // spec that no longer matches what's on screen.
  const onField = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPreview(null);
  };

  if (!open) {
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
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-tag">Source tag</label>
          <select id="rb-tag" value={tag} onChange={e => onField(setTag)(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            <option value="any">any workload</option>
            {Object.keys(CC.TAGS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-cloud">Cloud</label>
          <select id="rb-cloud" value={cloud} onChange={e => onField(setCloud)(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            <option value="any">any cloud</option>
            {CC.clouds.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-dst">Destination</label>
          <select id="rb-dst" value={dst} onChange={e => onField(setDst)(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            {Object.entries(CC.DSTS)
              .filter(([k]) => !DSTS_PENDING_SRC_GROUP_CONTROL.has(k))
              .map(([k, v]) => (
                <option key={k} value={k}>{v as string}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-action">Action</label>
          <select id="rb-action" value={action} onChange={e => onField(setAction)(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-ports">Ports</label>
          <select id="rb-ports" value={ports} onChange={e => onField(setPorts)(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            {PORTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={submit}
          className="h-9 px-4 rounded-full text-figma-sm font-medium bg-fw-active text-white hover:bg-fw-linkHover transition-colors">
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

      {preview && (
        <div className="text-figma-xs text-fw-bodyLight">
          {preview.matched.length} flow{preview.matched.length === 1 ? '' : 's'} matched
          {' · '}{preview.gbps} Gbps
          {' · '}{preview.blocked} blocked
          {preview.shadowed.length > 0 && ` · ${preview.shadowed.length} shadowed by a higher-priority rule`}
        </div>
      )}
    </div>
  );
}
