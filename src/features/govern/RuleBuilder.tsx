import { useState } from 'react';
import { CC } from '../../engine';
import { useCloudControlActions } from '../../engine/react/useCloudControl';

const ACTIONS = ['deny', 'inspect', 'route-private', 'allow'] as const;
const PORTS = ['any', '443', '5432', '8443'] as const;

export function RuleBuilder() {
  const actions = useCloudControlActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('any');
  const [cloud, setCloud] = useState('any');
  const [dst, setDst] = useState('any');
  const [ports, setPorts] = useState<string>('any');
  const [action, setAction] = useState<string>('deny');
  const [preview, setPreview] = useState<{ matched: unknown[]; gbps: number; blocked: number; pending: number; shadowed: unknown[] } | null>(null);

  const spec = () => ({ name, src: { tag, cloud }, dst, ports, action, chain: [] });

  const submit = () => {
    actions.addRule({ ...spec(), enforceNow: false });
    setName('');
    setOpen(false);
    setPreview(null);
  };

  const runDry = () => setPreview(CC.dryRun(spec()));

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
        onChange={e => setName(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-tag">Source tag</label>
          <select id="rb-tag" value={tag} onChange={e => setTag(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            <option value="any">any workload</option>
            {Object.keys(CC.TAGS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-cloud">Cloud</label>
          <select id="rb-cloud" value={cloud} onChange={e => setCloud(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            <option value="any">any cloud</option>
            {CC.clouds.map((c: { id: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-dst">Destination</label>
          <select id="rb-dst" value={dst} onChange={e => setDst(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            {Object.entries(CC.DSTS).map(([k, v]) => (
              <option key={k} value={k}>{v as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-action">Action</label>
          <select id="rb-action" value={action} onChange={e => setAction(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-fw-secondary bg-fw-wash text-figma-sm">
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-figma-xs text-fw-bodyLight" htmlFor="rb-ports">Ports</label>
          <select id="rb-ports" value={ports} onChange={e => setPorts(e.target.value)}
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
        <button type="button" onClick={() => setOpen(false)}
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
