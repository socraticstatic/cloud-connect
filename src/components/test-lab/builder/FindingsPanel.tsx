import { useMemo, useState } from 'react';
import { BarChart3, ClipboardPaste } from 'lucide-react';
import { aggregateFindings, parseTaskResultsCsv } from '../../../data/testLab/findings';

/**
 * Findings: paste the TaskResults sheet (File → Download → CSV, or select-all + copy)
 * and read the study — success rates, time-on-task, the misconceptions named by wrong
 * answers, and why people gave up. Worst task first. Preview rows excluded by default.
 */
export function FindingsPanel() {
  const [csv, setCsv] = useState('');
  const [includePreview, setIncludePreview] = useState(false);

  const { findings, rowCount, parseError } = useMemo(() => {
    if (!csv.trim()) return { findings: [], rowCount: 0, parseError: null as string | null };
    try {
      const rows = parseTaskResultsCsv(csv);
      if (!rows.length) return { findings: [], rowCount: 0, parseError: 'No task rows found — paste the TaskResults tab including its header row.' };
      return { findings: aggregateFindings(rows, { includePreview }), rowCount: rows.length, parseError: null };
    } catch (err) {
      return { findings: [], rowCount: 0, parseError: err instanceof Error ? err.message : String(err) };
    }
  }, [csv, includePreview]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-fw-link" />
        <h2 className="text-figma-lg font-bold text-fw-heading">Findings</h2>
      </div>
      <p className="text-figma-sm text-fw-bodyLight mb-4">
        Paste the <span className="font-medium text-fw-body">TaskResults</span> tab from the results
        sheet (select all, copy — or download as CSV and paste the contents). Nothing leaves this page.
      </p>

      <textarea
        value={csv}
        onChange={e => setCsv(e.target.value)}
        placeholder="sessionId,inviteCode,preview,participantName,…  (paste the whole tab, header included)"
        className="w-full h-28 px-3 py-2.5 rounded-lg border border-fw-secondary bg-fw-base text-figma-xs font-mono text-fw-heading focus:outline-none focus:border-fw-active resize-y"
      />

      {csv.trim() === '' && (
        <p className="flex items-center gap-2 mt-2 text-figma-xs text-fw-disabled">
          <ClipboardPaste className="w-3.5 h-3.5" /> Waiting for data.
        </p>
      )}
      {parseError && <p className="mt-2 text-figma-sm text-fw-error">{parseError}</p>}

      {findings.length > 0 && (
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-figma-sm text-fw-body">
              <span className="font-semibold text-fw-heading">{rowCount}</span> task runs ·{' '}
              <span className="font-semibold text-fw-heading">{findings.length}</span> tasks · worst first
            </p>
            <label className="flex items-center gap-2 text-figma-xs text-fw-body cursor-pointer">
              <input type="checkbox" checked={includePreview} onChange={e => setIncludePreview(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-fw-secondary" />
              Include preview runs
            </label>
          </div>

          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-fw-secondary">
                {['Task', 'n', 'Success', 'Gave up', 'Median time', 'Ease (1–7)', 'Hints', 'Comprehension'].map((h, i) => (
                  <th key={h} className={`py-2 text-figma-xs font-semibold text-fw-bodyLight uppercase tracking-wide ${i === 0 ? 'w-[28%] text-left pr-3' : 'text-right pl-2'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {findings.map(f => (
                <tr key={f.taskId} className="border-b border-fw-secondary/50">
                  <td className="py-2.5 pr-3 text-figma-sm font-medium text-fw-heading truncate" title={f.taskId}>{f.taskId}</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.n}</td>
                  <td className={`py-2.5 pl-2 text-right text-figma-sm font-semibold tabular-nums ${f.verifiedPct >= 80 ? 'text-fw-success' : f.verifiedPct >= 50 ? 'text-fw-body' : 'text-fw-error'}`}>{f.verifiedPct}%</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.gaveUpPct}%</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.medianDurationS}s</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.meanEase ?? '—'}</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.hintsPerRun}</td>
                  <td className="py-2.5 pl-2 text-right text-figma-sm text-fw-body tabular-nums">{f.comprehensionPct != null ? `${f.comprehensionPct}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* The qualitative payoff: what people believed, and what stopped them */}
          {findings.some(f => f.misconceptions.length || f.giveUpReasons.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-figma-sm font-bold text-fw-heading mb-2">Misconceptions — wrong answers, verbatim</h3>
                {findings.filter(f => f.misconceptions.length).map(f => (
                  <div key={f.taskId} className="mb-2.5">
                    <p className="text-figma-xs font-medium text-fw-bodyLight mb-0.5">{f.taskId}</p>
                    {f.misconceptions.map(m => (
                      <p key={m.answer} className="text-figma-xs text-fw-body">
                        <span className="font-semibold tabular-nums">{m.count}×</span> “{m.answer}”
                      </p>
                    ))}
                  </div>
                ))}
                {!findings.some(f => f.misconceptions.length) && <p className="text-figma-xs text-fw-disabled">None recorded.</p>}
              </div>
              <div>
                <h3 className="text-figma-sm font-bold text-fw-heading mb-2">Why people gave up</h3>
                {findings.filter(f => f.giveUpReasons.length).map(f => (
                  <div key={f.taskId} className="mb-2.5">
                    <p className="text-figma-xs font-medium text-fw-bodyLight mb-0.5">{f.taskId}</p>
                    {f.giveUpReasons.map(g => (
                      <p key={g.reason} className="text-figma-xs text-fw-body">
                        <span className="font-semibold tabular-nums">{g.count}×</span> {g.reason}
                      </p>
                    ))}
                  </div>
                ))}
                {!findings.some(f => f.giveUpReasons.length) && <p className="text-figma-xs text-fw-disabled">None recorded.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
