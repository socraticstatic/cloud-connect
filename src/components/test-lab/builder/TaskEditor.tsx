import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import type { CustomStudy, CustomTask } from '../../../types/testLabBuilder';
import { VERIFIER_CATALOG } from '../../../data/testLab/verifierCatalog';
import { TASK_TEMPLATES, instantiateTemplate } from '../../../data/testLab/taskTemplates';
import type { LibraryPersona } from '../../../data/testLab/personaLibrary';

const inputCls = 'w-full px-2.5 py-2 rounded-lg border border-fw-secondary bg-fw-base text-figma-sm text-fw-heading focus:outline-none focus:border-fw-active';
const labelCls = 'block text-figma-xs font-medium text-fw-heading mb-1';

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}{note && <span className="font-normal text-fw-bodyLight"> — {note}</span>}</label>
      {children}
    </div>
  );
}

function TaskRow({ task, index, total, onChange, onMove, onRemove }: {
  task: CustomTask; index: number; total: number;
  onChange: (t: CustomTask) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const catalogEntry = task.verifierRef ? VERIFIER_CATALOG.find(c => c.id === task.verifierRef!.catalogId) : undefined;

  return (
    <div className="border border-fw-secondary rounded-lg bg-fw-base">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setOpen(!open)} className="p-0.5 text-fw-bodyLight hover:text-fw-heading">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className="text-figma-xs text-fw-bodyLight w-6">{index + 1}.</span>
        <span className="text-figma-sm font-medium text-fw-heading truncate flex-1">{task.title || '(untitled task)'}</span>
        <span className="text-figma-xs text-fw-bodyLight">v{task.version} · {task.path}</span>
        <button disabled={index === 0} onClick={() => onMove(-1)} title="Move up"
          className="p-1 rounded text-fw-bodyLight hover:bg-fw-accent disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
        <button disabled={index === total - 1} onClick={() => onMove(1)} title="Move down"
          className="p-1 rounded text-fw-bodyLight hover:bg-fw-accent disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
        <button onClick={onRemove} title="Remove task"
          className="p-1 rounded text-fw-error/70 hover:bg-fw-error/10"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-fw-secondary/60">
          <Field label="Title">
            <input className={inputCls} value={task.title} onChange={e => onChange({ ...task, title: e.target.value })} />
          </Field>
          <Field label="Scenario" note="what the participant reads — goal language, no solutions">
            <textarea className={inputCls} rows={3} value={task.scenario}
              onChange={e => onChange({ ...task, scenario: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Path">
              <select className={inputCls} value={task.path}
                onChange={e => onChange({ ...task, path: e.target.value as CustomTask['path'] })}>
                <option value="happy">Happy path</option>
                <option value="bad-input">Bad input / recovery</option>
                <option value="permission-wall">Permission wall</option>
              </select>
            </Field>
            <Field label="Start route" note="optional">
              <input className={inputCls} value={task.startRoute ?? ''} placeholder="/manage"
                onChange={e => onChange({ ...task, startRoute: e.target.value || undefined })} />
            </Field>
          </div>
          <Field label="Verification">
            <select className={inputCls} value={task.verifierRef?.catalogId ?? ''}
              onChange={e => onChange({ ...task, verifierRef: e.target.value ? { catalogId: e.target.value, params: {} } : undefined })}>
              <option value="">None — comprehension / self-report only</option>
              {VERIFIER_CATALOG.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {catalogEntry && catalogEntry.paramFields.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {catalogEntry.paramFields.map(f => (
                  <Field key={f.key} label={f.label}>
                    <input className={inputCls} placeholder={f.placeholder}
                      value={String((task.verifierRef?.params as any)?.[f.key] ?? '')}
                      onChange={e => onChange({
                        ...task,
                        verifierRef: {
                          catalogId: task.verifierRef!.catalogId,
                          params: { ...(task.verifierRef!.params ?? {}), [f.key]: e.target.value || undefined },
                        },
                      })} />
                  </Field>
                ))}
              </div>
            )}
          </Field>
          <Field label="Success criteria" note="author note — never shown to participants">
            <textarea className={inputCls} rows={2} value={task.successCriteria}
              onChange={e => onChange({ ...task, successCriteria: e.target.value })} />
          </Field>
          <Field label="Hints" note="one per line, revealed progressively">
            <textarea className={inputCls} rows={2} value={task.hints.join('\n')}
              onChange={e => onChange({ ...task, hints: e.target.value.split('\n').filter(h => h.trim()) })} />
          </Field>
          <Field label="Comprehension check" note="optional — question, then options one per line">
            <input className={inputCls} placeholder="Question (blank = no check)"
              value={task.comprehensionCheck?.question ?? ''}
              onChange={e => {
                const q = e.target.value;
                if (!q) return onChange({ ...task, comprehensionCheck: undefined });
                onChange({
                  ...task,
                  comprehensionCheck: { question: q, options: task.comprehensionCheck?.options ?? ['', ''], correctIndex: task.comprehensionCheck?.correctIndex ?? 0 },
                });
              }} />
            {task.comprehensionCheck && (
              <div className="mt-2 space-y-2">
                <textarea className={inputCls} rows={3} placeholder="Options, one per line"
                  value={task.comprehensionCheck.options.join('\n')}
                  onChange={e => onChange({
                    ...task,
                    comprehensionCheck: { ...task.comprehensionCheck!, options: e.target.value.split('\n') },
                  })} />
                <Field label="Correct answer">
                  <select className={inputCls} value={task.comprehensionCheck.correctIndex}
                    onChange={e => onChange({
                      ...task,
                      comprehensionCheck: { ...task.comprehensionCheck!, correctIndex: Number(e.target.value) },
                    })}>
                    {task.comprehensionCheck.options.map((o, i) => (
                      <option key={i} value={i}>{i + 1}. {o.slice(0, 60) || '(empty)'}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </Field>
        </div>
      )}
    </div>
  );
}

export function TaskEditor({ study, persona, onChange }: {
  study: CustomStudy;
  persona: LibraryPersona | undefined;
  onChange: (tasks: CustomTask[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const suggested = persona ? TASK_TEMPLATES.filter(t => persona.suggestedTemplateIds.includes(t.id)) : [];
  const others = TASK_TEMPLATES.filter(t => !suggested.includes(t));

  const addFromTemplate = (tplId: string) => {
    const tpl = TASK_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    onChange([...study.tasks, instantiateTemplate(tpl, study.tasks.length + 1)]);
    setAddOpen(false);
  };

  const addBlank = () => {
    onChange([...study.tasks, {
      id: `task-${study.tasks.length + 1}-${Math.floor(Math.random() * 10000)}`,
      version: 1, title: 'New task', scenario: '', successCriteria: '', path: 'happy', hints: [],
    }]);
    setAddOpen(false);
  };

  return (
    <div className="space-y-2">
      {study.tasks.length === 0 && (
        <p className="text-figma-sm text-fw-bodyLight">No tasks yet — add from the persona's common tasks below.</p>
      )}
      {study.tasks.map((t, i) => (
        <TaskRow key={t.id} task={t} index={i} total={study.tasks.length}
          onChange={next => onChange(study.tasks.map(x => x.id === t.id ? next : x))}
          onMove={dir => {
            const tasks = [...study.tasks];
            const [moved] = tasks.splice(i, 1);
            tasks.splice(i + dir, 0, moved);
            onChange(tasks);
          }}
          onRemove={() => onChange(study.tasks.filter(x => x.id !== t.id))} />
      ))}

      <div className="relative">
        <button onClick={() => setAddOpen(!addOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-fw-secondary text-figma-xs font-medium text-fw-body hover:border-fw-active">
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
        {addOpen && (
          <div className="absolute z-10 mt-1 w-96 max-h-80 overflow-y-auto rounded-lg border border-fw-secondary bg-fw-base shadow-xl p-2 space-y-1">
            {suggested.length > 0 && (
              <>
                <p className="px-2 pt-1 text-figma-xs font-semibold text-fw-link uppercase tracking-[0.08em]">Common for this persona</p>
                {suggested.map(t => (
                  <button key={t.id} onClick={() => addFromTemplate(t.id)}
                    className="block w-full text-left px-2 py-1.5 rounded hover:bg-fw-accent text-figma-sm text-fw-heading">
                    {t.title}
                    <span className="block text-figma-xs text-fw-bodyLight truncate">{t.task.scenario}</span>
                  </button>
                ))}
              </>
            )}
            <p className="px-2 pt-2 text-figma-xs font-semibold text-fw-bodyLight uppercase tracking-[0.08em]">All templates</p>
            {others.map(t => (
              <button key={t.id} onClick={() => addFromTemplate(t.id)}
                className="block w-full text-left px-2 py-1.5 rounded hover:bg-fw-accent text-figma-sm text-fw-body">
                {t.title}
              </button>
            ))}
            <div className="border-t border-fw-secondary/60 mt-1 pt-1">
              <button onClick={addBlank}
                className="block w-full text-left px-2 py-1.5 rounded hover:bg-fw-accent text-figma-sm text-fw-body">
                Blank task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
