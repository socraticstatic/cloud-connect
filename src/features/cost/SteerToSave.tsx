import { useRef, useState } from 'react';
import { useCloudControl, useCloudControlActions } from '../../engine/react/useCloudControl';
import { estimateMonthlySavings, publicGbps, toSavingsRec } from './costMath';

export function SteerToSave() {
  const cc = useCloudControlActions();
  const advisor = useCloudControl(c => c.routeAdvisor());
  const flows = useCloudControl(c => c.routeFlows());
  const egress = useCloudControl(c => c.egress());
  const [captured, setCaptured] = useState(0);
  // Double-click guard: a flow's savings are captured at most once per
  // session, even if a stale rec is clicked twice before re-render.
  const capturedFlowIds = useRef(new Set<string>());
  const steers = advisor.recommendations.filter(r => r.action === 'steer');

  const steer = (rec: (typeof steers)[number]) => {
    if (capturedFlowIds.current.has(rec.flowId)) return;
    // Value the rec at click time, against the CURRENT public spend/gbps
    // (both shrink as flows steer off public paths).
    const value = estimateMonthlySavings(
      [toSavingsRec(rec, flows)], egress.pub, publicGbps(flows));
    if (rec.pathId && cc.steerFlow(rec.flowId, rec.pathId)) {
      capturedFlowIds.current.add(rec.flowId);
      setCaptured(c => c + value);
    }
  };

  return (
    <section aria-labelledby="sts-h">
      <h2 id="sts-h" className="text-sm font-semibold text-slate-900">Steer to save</h2>
      {captured > 0 && (
        <p className="mt-1 text-xs font-medium text-[#00a862]" role="status">
          ${captured.toLocaleString()}/mo captured this session
        </p>
      )}
      <ul className="mt-2 space-y-2">
        {steers.length === 0 && (
          <li className="text-sm text-slate-500">Every flow is on its optimal path. Nothing left on the table.</li>
        )}
        {steers.map(r => (
          <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-sm text-slate-900">{r.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">{r.detail}</div>
            <button onClick={() => steer(r)}
              className="mt-2 rounded-md bg-[#0057b8] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#004a9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057b8]">
              Steer to save
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
