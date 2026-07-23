/**
 * /stack · Personas — who uses the table, and where they live in it.
 *
 * The signature visual is the footprint matrix: the deck's own 4×4
 * (layers × lifecycle), shaded per persona. One visual system carries the
 * whole argument: the IA is a table, and every role is a shape on it.
 *
 * Grounded in current role research: the architect approves high-risk
 * changes through review boards and optimizes cost with finance; the
 * planner forecasts capacity before constraints become incidents; the NOC
 * baselines, triages, and owns the change window; the 2026 hiring split
 * separates the cloud network engineer as its own archetype; the AI
 * platform and FinOps roles come with the token layer and the egress bill.
 */

interface Persona {
  key: string;
  name: string;
  oneLiner: string;
  monogram: string;
  accent: string;
  /** rows: AI Fabric, Cloud, NaaS, Transport · cols: Connect Govern Observe Cost · 0 none, 1 visits, 2 lives */
  footprint: [number, number, number, number][];
  day: string[];
  builtForThem: string[];
  tension: string;
}

const PERSONAS: Persona[] = [
  {
    key: 'architect',
    name: 'Network Architect',
    oneLiner: 'Owns the shape of the estate. Every path is a decision they can defend.',
    monogram: 'NA',
    accent: '#0057b8',
    footprint: [
      [1, 1, 0, 0],
      [2, 1, 0, 1],
      [2, 2, 1, 1],
      [1, 1, 0, 0],
    ],
    day: [
      'Reviews high-risk changes for blast radius and rollback before a review board sees them.',
      'Designs new connectivity on the twin instead of a diagram that drifts.',
      'Walks cost trade-offs with finance in figures both sides can check.',
    ],
    builtForThem: ['Design mode', 'Proposal links', 'Undo as rollback', 'The /stack deck itself'],
    tension: 'Their diagrams used to age out the day they shipped. The twin is the diagram, live.',
  },
  {
    key: 'planner',
    name: 'Network Planner',
    oneLiner: 'Sees the constraint before it becomes an incident, and prices the fix.',
    monogram: 'NP',
    accent: '#009fdb',
    footprint: [
      [0, 0, 0, 1],
      [1, 0, 0, 1],
      [2, 0, 1, 2],
      [1, 0, 0, 1],
    ],
    day: [
      'Forecasts bandwidth and attach needs a quarter out.',
      'Reads what is still on the table and sequences the attaches that close it.',
      'Turns the advisor’s draft into next quarter’s plan, move by priced move.',
    ],
    builtForThem: ['The advisor draft', 'Arbitrage · still on the table', 'Staged deltas before commit'],
    tension: 'Planning used to mean a spreadsheet nobody else could audit. Now the plan is a link.',
  },
  {
    key: 'netops',
    name: 'NetOps Engineer',
    oneLiner: 'Keeps it standing. Baselines, triages, and owns the change window.',
    monogram: 'NO',
    accent: '#1d2329',
    footprint: [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [1, 2, 2, 0],
      [0, 0, 1, 0],
    ],
    day: [
      'Watches path health against the baseline, not against a feeling.',
      'Scrubs the window back to the moment a spike began, and reads it by name.',
      'Runs failure sims before the failure runs them.',
    ],
    builtForThem: ['The time machine', 'Failure simulation', 'One latency vocabulary on every screen'],
    tension: 'The postmortem question was always "what did it look like right before." Now they scrub to it.',
  },
  {
    key: 'cloudeng',
    name: 'Cloud Network Engineer',
    oneLiner: 'Owns the on-ramps: every VPC, account, and region that touches the fabric.',
    monogram: 'CN',
    accent: '#0057b8',
    footprint: [
      [1, 0, 0, 0],
      [2, 1, 1, 1],
      [2, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    day: [
      'Attaches regions and VPCs, and checks the latency arrow before committing.',
      'Hops the rail between a workload’s cloud view and its network path.',
      'Types the attach into ⌘K when they already know what they want.',
    ],
    builtForThem: ['Attach flows', 'The stack rail', '⌘K attach intents'],
    tension: 'Their world is the seam between clouds and the network. The stack finally draws the seam.',
  },
  {
    key: 'aianalyst',
    name: 'AI Platform Analyst',
    oneLiner: 'Governs the token layer: models, agents, budgets, and where requests actually go.',
    monogram: 'AI',
    accent: '#009fdb',
    footprint: [
      [2, 2, 2, 2],
      [1, 0, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 0, 0],
    ],
    day: [
      'Reads which tokens rode the public internet, and closes that gap.',
      'Caps a budget in one typed sentence when a team runs hot.',
      'Traces an agent’s decisions when spend moves without a deploy.',
    ],
    builtForThem: ['Token budgets & guardrails', '⌘K cap intents', 'Prompt traces', 'The AI Fabric row, whole'],
    tension: 'AI spend was a bill that arrived. Now it is a meter they steer.',
  },
  {
    key: 'finops',
    name: 'FinOps Analyst',
    oneLiner: 'Accountable for spend across every layer. Reads the Cost column top to bottom.',
    monogram: 'FO',
    accent: '#1d2329',
    footprint: [
      [0, 0, 0, 2],
      [0, 0, 0, 2],
      [0, 1, 1, 2],
      [0, 0, 0, 1],
    ],
    day: [
      'Splits egress into on-fabric and public, and watches the split move.',
      'Prices every steer before championing it.',
      'Sends the quarter’s savings case as a proposal link finance can open.',
    ],
    builtForThem: ['Egress split', 'Steer to save', 'Proposal links as the business case'],
    tension: 'The savings deck used to be screenshots. Now the numbers reprice themselves on open.',
  },
];

const ROW_LABELS = ['AI', 'Cloud', 'NaaS', 'T&A'];
const COL_LABELS = ['C', 'G', 'O', '$'];
const CELL_TONE = ['#eef0f2', '#b3d4f0', '#0057b8'];

/** The persona's shape on the deck's own table. */
function Footprint({ footprint, name }: { footprint: Persona['footprint']; name: string }) {
  return (
    <div data-testid="persona-footprint" role="img"
      aria-label={`Where the ${name} lives on the lifecycle and layer table`}>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(4, 14px)' }}>
        <span />
        {COL_LABELS.map(c => (
          <span key={c} className="text-[8px] font-bold text-center" style={{ color: '#9aa0a6' }}>{c}</span>
        ))}
        {footprint.map((row, r) => (
          [
            <span key={`l${r}`} className="text-[8px] font-bold pr-1 text-right leading-[14px]" style={{ color: '#9aa0a6' }}>
              {ROW_LABELS[r]}
            </span>,
            ...row.map((v, c) => (
              <span key={`${r}${c}`} className="h-[14px] w-[14px] rounded-[3px]"
                style={{ background: CELL_TONE[v] }} />
            )),
          ]
        ))}
      </div>
    </div>
  );
}

export function PersonasView() {
  return (
    <>
      {/* ── PERSONAS COVER ── */}
      <section className="sd-section" style={{ background: '#001a3d', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-16 py-20">
          <p className="text-[13px] font-medium tracking-[0.12em] uppercase mb-6" style={{ color: '#009fdb' }}>
            Who uses it · Cloud Connect
          </p>
          <h1 className="text-[56px] font-bold leading-[1.05] tracking-[-0.04em] mb-8" style={{ color: '#ffffff' }}>
            Six roles.<br />One table, six shapes.
          </h1>
          <div className="w-16 h-1 mb-8 rounded-full" style={{ background: '#009fdb' }} />
          <p className="text-[20px] font-medium leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Every role that touches the network lives somewhere on the lifecycle and layer
            table. The footprint beside each persona is that somewhere. Layers are personas;
            that is why layers lead the nav.
          </p>
        </div>
      </section>

      {/* ── THE SIX ── */}
      <section className="sd-section" style={{ background: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-16 py-20">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase mb-4" style={{ color: '#0057b8' }}>
            The personas
          </p>
          <h2 className="text-[40px] font-bold tracking-[-0.03em] leading-tight mb-4" style={{ color: '#1d2329' }}>
            Where each one lives, and what was built for them.
          </h2>
          <p className="text-[16px] font-medium leading-relaxed max-w-3xl mb-4" style={{ color: '#454b52' }}>
            Drawn from current role research: the architect answers to review boards, the
            planner moves before the constraint does, the NOC owns the baseline and the
            change window, the cloud network engineer is 2026’s own hiring archetype, and
            the AI and FinOps analysts arrived with the token layer and the egress bill.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-medium mb-10" style={{ color: '#686e74' }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px]" style={{ background: CELL_TONE[2] }} /> lives here
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[3px]" style={{ background: CELL_TONE[1] }} /> visits
            </span>
            <span>Columns: Connect · Govern · Observe · Cost. Rows: the stack, top down.</span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {PERSONAS.map(p => (
              <article key={p.key} data-testid={`persona-${p.key}`}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ border: '1px solid #dcdfe3' }}>
                <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4"
                  style={{ background: '#f8fafb', borderBottom: '1px solid #dcdfe3' }}>
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="flex items-center justify-center h-11 w-11 rounded-xl text-[15px] font-bold flex-shrink-0"
                      style={{ background: p.accent, color: '#ffffff', letterSpacing: '-0.02em' }}>
                      {p.monogram}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[17px] font-bold tracking-[-0.02em]" style={{ color: '#1d2329' }}>{p.name}</h3>
                      <p className="text-[13px] font-medium leading-snug mt-0.5" style={{ color: '#686e74' }}>{p.oneLiner}</p>
                    </div>
                  </div>
                  <Footprint footprint={p.footprint} name={p.name} />
                </div>
                <div className="px-6 py-4 flex-1">
                  <ul className="space-y-1.5">
                    {p.day.map((d, i) => (
                      <li key={i} className="text-[13px] font-medium leading-relaxed pl-3.5 relative" style={{ color: '#454b52' }}>
                        <span className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {p.builtForThem.map(f => (
                      <span key={f} className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: '#f0f4ff', color: '#0057b8' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="px-6 py-3.5 text-[12.5px] font-medium italic leading-relaxed"
                  style={{ background: '#f8fafb', borderTop: '1px solid #f0f1f2', color: '#686e74' }}>
                  {p.tension}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE POINT ── */}
      <section className="sd-section" style={{ background: '#001435' }}>
        <div className="max-w-5xl mx-auto px-16 py-16">
          <p className="text-[26px] font-bold leading-snug tracking-[-0.02em] max-w-3xl" style={{ color: '#ffffff' }}>
            Six shapes, one table. No persona needed a fifth verb, and none fit inside a
            single one. That is the argument for this IA, drawn six more times.
          </p>
          <a href="#/discover" className="inline-block mt-6 text-[15px] font-semibold hover:underline" style={{ color: '#009fdb' }}>
            Open the portal →
          </a>
        </div>
      </section>
    </>
  );
}
