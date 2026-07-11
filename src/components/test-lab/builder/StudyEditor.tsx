import { useMemo, useState } from 'react';
import { Copy, Download, Upload, ClipboardCheck, Mail } from 'lucide-react';
import type { CustomStudy } from '../../../types/testLabBuilder';
import { PERSONA_LIBRARY } from '../../../data/testLab/personaLibrary';
import { exportStudy, importStudy } from '../../../data/testLab/builderDrafts';
import { customStudyToPack } from '../../../data/testLab/builderConversion';
import { validatePacks, getAllPacks } from '../../../data/testLab/packs';
import { TaskEditor } from './TaskEditor';

const inputCls = 'w-full px-2.5 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-sm text-fw-heading focus:outline-none focus:border-fw-active';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-figma-base font-semibold text-fw-heading mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function StudyEditor({ study, onChange, onImport }: {
  study: CustomStudy;
  onChange: (next: CustomStudy) => void;
  onImport: (next: CustomStudy) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const libraryPersona = PERSONA_LIBRARY.find(p => study.persona.id === p.id);

  const problems = useMemo(() => {
    try {
      const local = validatePacks([customStudyToPack(study)]);
      const codes = [...study.inviteCodes, ...study.previewCodes].map(c => c.trim().toUpperCase());
      const clashes = getAllPacks()
        .filter(p => p.id !== study.id)
        .flatMap(p => p.scripts.flatMap(s => [...s.inviteCodes, ...s.previewCodes]))
        .map(c => c.trim().toUpperCase())
        .filter(c => codes.includes(c))
        .map(c => `invite code "${c}" is already used by another study`);
      return [...local, ...clashes];
    } catch (err) {
      return [`Study can't convert: ${err instanceof Error ? err.message : String(err)}`];
    }
  }, [study]);

  const copy = async (text: string, tag: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2500);
  };

  const invitationBlurb = (code: string) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `You're invited to test ${study.feature} in AT&T NetBond Advanced.\n\n1. Open ${base}#/test-lab in a desktop browser\n2. Enter your invite code: ${code}\n3. The session takes about 15 minutes.\n\nThere are no wrong answers — we're testing the product, not you.`;
  };

  return (
    <div>
      <Section title="Feature">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Feature under test</label>
            <input className={inputCls} value={study.feature} onChange={e => onChange({ ...study, feature: e.target.value })} />
          </div>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Feature version</label>
            <input className={inputCls} value={study.featureVersion} onChange={e => onChange({ ...study, featureVersion: e.target.value })} placeholder="GA 1116" />
          </div>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Study id <span className="font-normal text-fw-bodyLight">— fixed</span></label>
            <input className={`${inputCls} opacity-60`} value={study.id} readOnly />
          </div>
        </div>
      </Section>

      <Section title="Persona">
        <div className="space-y-3">
          <select className={inputCls} value={libraryPersona?.id ?? ''}
            onChange={e => {
              const p = PERSONA_LIBRARY.find(x => x.id === e.target.value);
              if (!p) return;
              onChange({
                ...study,
                persona: { id: p.id, name: `${p.characterName} — ${p.title}`, bio: p.bio, goal: p.goal, rbacRole: p.rbacRole, seedId: '' },
              });
            }}>
            {!libraryPersona && <option value="">(custom persona)</option>}
            {PERSONA_LIBRARY.map(p => <option key={p.id} value={p.id}>{p.title} — {p.characterName} ({p.rbacRole})</option>)}
          </select>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Display name</label>
            <input className={inputCls} value={study.persona.name}
              onChange={e => onChange({ ...study, persona: { ...study.persona, name: e.target.value } })} />
          </div>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Bio <span className="font-normal text-fw-bodyLight">— who they are, what pressure they're under</span></label>
            <textarea className={inputCls} rows={3} value={study.persona.bio}
              onChange={e => onChange({ ...study, persona: { ...study.persona, bio: e.target.value } })} />
          </div>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Goal</label>
            <textarea className={inputCls} rows={2} value={study.persona.goal}
              onChange={e => onChange({ ...study, persona: { ...study.persona, goal: e.target.value } })} />
          </div>
        </div>
      </Section>

      <Section title={`Tasks (${study.tasks.length})`}>
        <TaskEditor study={study} persona={libraryPersona} onChange={tasks => onChange({ ...study, tasks })} />
      </Section>

      <Section title="Invite codes">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Participant codes <span className="font-normal text-fw-bodyLight">— one per line, one per cohort</span></label>
            <textarea className={inputCls} rows={2} value={study.inviteCodes.join('\n')}
              onChange={e => onChange({ ...study, inviteCodes: e.target.value.split('\n').map(c => c.trim()).filter(Boolean) })} />
          </div>
          <div>
            <label className="block text-figma-xs font-medium text-fw-heading mb-1">Preview codes <span className="font-normal text-fw-bodyLight">— for you; excluded from findings</span></label>
            <textarea className={inputCls} rows={2} value={study.previewCodes.join('\n')}
              onChange={e => onChange({ ...study, previewCodes: e.target.value.split('\n').map(c => c.trim()).filter(Boolean) })} />
          </div>
        </div>
        {study.inviteCodes[0] && (
          <button onClick={() => copy(invitationBlurb(study.inviteCodes[0]), 'invite')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active">
            {copied === 'invite' ? <ClipboardCheck className="w-3.5 h-3.5 text-fw-success" /> : <Mail className="w-3.5 h-3.5" />}
            {copied === 'invite' ? 'Copied' : 'Copy invitation text'}
          </button>
        )}
      </Section>

      <Section title="Validation">
        {problems.length === 0 ? (
          <p className="flex items-center gap-1.5 text-figma-sm text-fw-success">
            <span className="w-1.5 h-1.5 rounded-full bg-fw-success inline-block" /> Study is valid — enter a preview code at /test-lab to walk it.
          </p>
        ) : (
          <ul className="space-y-1">
            {problems.map((p, i) => (
              <li key={i} className="flex items-center gap-1.5 text-figma-sm text-fw-error">
                <span className="w-1.5 h-1.5 rounded-full bg-fw-error inline-block" /> {p}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Exchange">
        <div className="flex items-center gap-2">
          <button onClick={() => copy(exportStudy(study), 'helen')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover">
            {copied === 'helen' ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'helen' ? 'Copied — paste it to Helen with “publish this study”' : 'Copy for Helen'}
          </button>
          <button onClick={() => {
            const blob = new Blob([exportStudy(study)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${study.id}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active">
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button onClick={() => { setImportOpen(!importOpen); setImportError(null); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active">
            <Upload className="w-3.5 h-3.5" /> Import JSON
          </button>
        </div>
        {importOpen && (
          <div className="mt-3 space-y-2">
            <textarea className={inputCls} rows={5} placeholder="Paste a study export here…"
              value={importText} onChange={e => setImportText(e.target.value)} />
            {importError && <p className="text-figma-xs text-fw-error">{importError}</p>}
            <button onClick={() => {
              const r = importStudy(importText);
              if (r.error || !r.study) return setImportError(r.error ?? 'Import failed.');
              onImport(r.study);
              setImportOpen(false); setImportText('');
            }} className="px-3 py-2 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover">
              Import
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}
