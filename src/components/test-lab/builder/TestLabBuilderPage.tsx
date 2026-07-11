import { useState } from 'react';
import { FlaskConical, Plus, CopyPlus, Trash2 } from 'lucide-react';
import type { CustomStudy } from '../../../types/testLabBuilder';
import { PERSONA_LIBRARY, LibraryPersona } from '../../../data/testLab/personaLibrary';
import { loadDrafts, saveDraft, deleteDraft, duplicateAsNewRound, codesForId, nowIso } from '../../../data/testLab/builderDrafts';
import { publishedStudyIds } from '../../../data/testLab/packs';
import { StudyEditor } from './StudyEditor';
import { FindingsPanel } from './FindingsPanel';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function newStudyFromPersona(p: LibraryPersona): CustomStudy {
  const id = `${slug(p.title)}-ga-r1`;
  return {
    id,
    feature: `${p.title} experience`,
    featureVersion: 'GA',
    persona: { id: p.id, name: `${p.characterName} — ${p.title}`, bio: p.bio, goal: p.goal, rbacRole: p.rbacRole, seedId: '' },
    tasks: [],
    ...codesForId(id),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export default function TestLabBuilderPage() {
  const [drafts, setDrafts] = useState<CustomStudy[]>(() => loadDrafts());
  const [selectedId, setSelectedId] = useState<string | null>(drafts[0]?.id ?? null);
  const [picking, setPicking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<'studies' | 'findings'>('studies');

  const published = new Set(publishedStudyIds());
  const selected = drafts.find(d => d.id === selectedId) ?? null;

  const persist = (study: CustomStudy) => {
    const saved = saveDraft(study);
    setDrafts(loadDrafts());
    setSelectedId(saved.id);
  };

  return (
    <div className="min-h-screen bg-fw-wash">
      <div className="h-12 bg-fw-base border-b border-fw-secondary flex items-center px-6 gap-3">
        <span className="text-base font-bold tracking-[-0.03em] text-brand-accent">AT&T</span>
        <span className="text-base font-bold text-fw-heading tracking-[-0.03em]">
          NetBond<sup className="text-[10px]">®</sup> Advanced
        </span>
        <span className="h-4 border-l border-fw-secondary" />
        <span className="text-figma-xs text-fw-bodyLight">Test Lab · Study Builder</span>
        <nav className="ml-auto flex items-center gap-4">
          {(['studies', 'findings'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`pb-0.5 text-figma-xs font-medium border-b-2 transition-colors no-rounded ${
                mode === m ? 'border-fw-link text-fw-heading' : 'border-transparent text-fw-bodyLight hover:text-fw-body'
              }`}>
              {m === 'studies' ? 'Studies' : 'Findings'}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {mode === 'findings' ? <FindingsPanel /> : (<>
        {/* Study list */}
        <aside className="w-72 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-figma-base font-semibold text-fw-heading">Studies</h1>
            <button onClick={() => { setPicking(true); setSelectedId(null); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-fw-primary text-white text-figma-xs font-semibold hover:bg-fw-linkHover">
              <Plus className="w-3.5 h-3.5" /> New study
            </button>
          </div>
          {drafts.length === 0 && !picking && (
            <p className="text-figma-xs text-fw-bodyLight">No studies yet. Start one — pick a persona and build from their common tasks.</p>
          )}
          <ul className="space-y-1.5">
            {drafts.map(d => (
              <li key={d.id}>
                <div className={`w-full rounded-lg border px-3 py-2.5 ${
                  selectedId === d.id ? 'border-fw-active bg-fw-accent' : 'border-fw-secondary bg-fw-base hover:border-fw-active'
                }`}>
                  <button onClick={() => { setSelectedId(d.id); setPicking(false); }} className="block w-full text-left">
                    <span className="block text-figma-sm font-medium text-fw-heading truncate">{d.feature}</span>
                    <span className="block text-figma-xs text-fw-bodyLight truncate">{d.id} · {d.featureVersion}</span>
                    <span className="flex items-center gap-1.5 text-figma-xs text-fw-bodyLight mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${published.has(d.id) ? 'bg-fw-success' : 'bg-fw-warn'}`} />
                      {published.has(d.id) ? 'published' : 'draft'} · {d.tasks.length} task{d.tasks.length === 1 ? '' : 's'}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 mt-1.5">
                    <button onClick={() => persist(duplicateAsNewRound(d))} title="Duplicate as new round"
                      className="p-1 rounded text-fw-bodyLight hover:bg-fw-accent"><CopyPlus className="w-3.5 h-3.5" /></button>
                    {confirmDelete === d.id ? (
                      <>
                        <button onClick={() => { deleteDraft(d.id); setDrafts(loadDrafts()); setConfirmDelete(null); if (selectedId === d.id) setSelectedId(null); }}
                          className="px-1.5 py-0.5 rounded text-figma-xs text-fw-error hover:bg-fw-error/10">Delete?</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="px-1.5 py-0.5 rounded text-figma-xs text-fw-bodyLight hover:bg-fw-accent">Keep</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(d.id)} title="Delete draft"
                        className="p-1 rounded text-fw-bodyLight hover:bg-fw-error/10 hover:text-fw-error"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor / persona picker */}
        <main className="flex-1 min-w-0">
          {picking ? (
            <div>
              <h1 className="text-figma-xl font-bold text-fw-heading tracking-[-0.03em] mb-1">Who is testing?</h1>
              <p className="text-figma-sm text-fw-bodyLight mb-6">Pick the persona — their common tasks come pre-loaded, everything stays editable.</p>
              <div className="grid grid-cols-2 gap-3">
                {PERSONA_LIBRARY.map(p => (
                  <button key={p.id} onClick={() => { persist(newStudyFromPersona(p)); setPicking(false); }}
                    className="text-left rounded-lg border border-fw-secondary bg-fw-base px-4 py-3 hover:border-fw-active">
                    <span className="block text-figma-sm font-semibold text-fw-heading">{p.title}</span>
                    <span className="block text-figma-xs text-fw-link mb-1">{p.characterName} · {p.rbacRole}</span>
                    <span className="block text-figma-xs text-fw-bodyLight line-clamp-2">{p.bio}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : selected ? (
            <StudyEditor study={selected} onChange={persist} onImport={persist} />
          ) : (
            <div className="pt-16 text-center">
              <FlaskConical className="w-8 h-8 text-fw-bodyLight mx-auto mb-3" />
              <p className="text-figma-sm text-fw-bodyLight">Select a study or create a new one.</p>
            </div>
          )}
        </main>
        </>)}
      </div>
    </div>
  );
}
