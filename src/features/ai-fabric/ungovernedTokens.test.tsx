import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeAll } from 'vitest';
import { CC } from '../../engine';
import { AiConnectPage } from './AiConnectPage';
import { AiCostPage } from './AiCostPage';
import { AiObservePage } from './AiObservePage';
import { aiSpendTotals, fmtTokens, routeLabel } from './aiSpend';
import { aiBinding } from '../observe/aiBinding';
import { aiPublicFlowGbps, estateDomains } from '../discover/discoveryModel';

/**
 * Ungoverned tokens are a fact the engine records, not one a screen infers.
 *
 * Four screens make claims about AI token exposure — `/ai/observe` (KPI strip
 * and briefing), `/ai/cost`, `/ai/connect`, `/discover`. Before the engine
 * carried a second bucket, every one of them had to reconstruct "did this
 * spend cross the public internet?" from the identity's route RIGHT NOW, and
 * that reconstruction is wrong in the state the demo actually reaches:
 *
 *   cold start   → agents meter over the public internet
 *   Connect beat → `activateOnramp('nb2')` attaches every endpoint
 *   result       → /ai/cost printed "All 3 route to a model endpoint attached
 *                  to the fabric, so none of that spend leaves over the public
 *                  internet" and the briefing printed "No AI Fabric traffic
 *                  currently crosses the public internet" — over a token total
 *                  most of which had already left over the public internet.
 *
 * Every assertion below is a `CC`/`aiSpendTotals` derivation. Nothing is a
 * pinned number, and nothing compares a screen only to the function that
 * screen calls: where two surfaces state one quantity, both are read and
 * compared to each other.
 *
 * The engine is a shared singleton and mutations persist within this file, so
 * the unattached describe runs FIRST.
 */

/* Determinism: `agentTick` fires on an ungated 7s interval and meters. Freeze
   the agents at module scope — the engine's own supported stop. */
(CC.agentList() as { id: string; enabled: boolean }[])
  .filter(a => a.enabled)
  .forEach(a => CC.toggleAgent(a.id));

const at = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const kpi = (key: string) =>
  (aiBinding(CC).kpis() as { key: string; value: string }[]).find(k => k.key === key)!;

const briefingText = () =>
  aiBinding(CC)
    .briefing()
    .narrative.map(b => b.text)
    .join(' ');

const seriesFlat = (tab: string) =>
  (aiBinding(CC).flowSeries(tab) as { v: number }[]).every(p => p.v === 0);

describe('ungoverned tokens — cold start, nothing attached', () => {
  beforeAll(() => {
    // Exactly what a traced agent request does, over the path the engine
    // reports for this identity. No timer, no rng.
    CC.promptTrace('shared-services', 'gpt-class', 'autonomous task · read:telemetry');
    CC.promptTrace('rd-helion', 'helion-70b', 'autonomous task · invoke:helion-70b');
  });

  it('is the state the claim is about: metered, and every route public', () => {
    const t = aiSpendTotals(CC);
    expect(t.tokensToday).toBeGreaterThan(0);
    expect(t.publicPathCount).toBe(t.identityCount);
    expect(t.ungovernedTokensToday, 'all of it rode the internet').toBe(t.tokensToday);
    expect(t.governedTokensToday).toBe(0);
  });

  it('gives /ai/observe a tile for the bucket, not a number a reader must infer', () => {
    const t = aiSpendTotals(CC);
    expect(kpi('ungoverned').value).toBe(fmtTokens(t.ungovernedTokensToday));
    expect(kpi('tokens').value).toBe(fmtTokens(t.tokensToday));
  });

  it('states the same ungoverned figure on /ai/cost as on /ai/observe', () => {
    const t = aiSpendTotals(CC);
    at(<AiCostPage />);
    const shown = fmtTokens(t.ungovernedTokensToday);
    expect(kpi('ungoverned').value, 'a $0-vs-$0 agreement proves nothing').not.toBe('0');
    expect(screen.getByText(new RegExp(`${shown} of .* rode the public internet`))).toBeInTheDocument();
  });

  it('never fires the flow empty state beside a non-zero tile, on any token tab', () => {
    /* Two ways this used to break, both live: `tokenSeries()` returned all
       zeros for an identity the engine did not consider meter-ready, and the
       Cost tab rounded a sub-dollar series to one decimal, which is 0.0 for
       every point. Either one printed "No token flow yet" under a tile
       reading hundreds of tokens. */
    expect(kpi('tokens').value).not.toBe('0');
    for (const tab of ['tokens', 'trend', 'flow', 'requests', 'cost']) {
      expect(seriesFlat(tab), `the ${tab} tab charts flat zero beside a live tile`).toBe(false);
    }
  });

  it('never calls a spending, public identity merely "Provisioning"', () => {
    /* Status used to lead with `ready`, the engine's METER gate, so a row
       whose own Route cell one column to the left read "Public internet" and
       whose Tokens cell read 165 was labelled "Provisioning" — a benign word
       for an identity actively spending over the open internet. The path
       comes first. */
    const rows = aiBinding(CC).records('none') as { cells: string[] }[];
    const onPublic = rows.filter(r => r.cells[3] === routeLabel('public'));
    expect(onPublic.length, 'this state needs public rows').toBeGreaterThan(0);
    expect(
      onPublic.some(r => !/^0( |$)/.test(r.cells[1])),
      'and at least one of them spending, or the label is harmless',
    ).toBe(true);
    for (const r of onPublic) {
      expect(r.cells[4], `${r.cells[0]} is on the public internet`).not.toMatch(/provisioning/i);
      expect(r.cells[4]).toMatch(/public/i);
    }
  });

  it('attributes the public tokens by what actually rode public, not by route count', () => {
    const t = aiSpendTotals(CC);
    const top = t.rows.slice().sort((a, b) => b.ungovernedToday - a.ungovernedToday)[0];
    const topApp = (CC.modelRoutes() as { tag: string; app: string }[]).find(
      r => r.tag === top.tag,
    )!.app;
    const text = briefingText();
    expect(t.ungovernedCount, 'more than one identity, or attribution proves nothing')
      .toBeGreaterThan(1);
    expect(text).toContain(fmtTokens(t.ungovernedTokensToday));
    expect(text).toContain(topApp);
  });

  /* Declared last in this describe: it mutates the meters and the decision
     log under a mounted screen. */
  it('states one request count on /ai/observe, not one per panel', async () => {
    /* The REQUESTS KPI and the decision log both read `decisionLog().length`,
       400px apart on one screen. The panel subscribed through the non-live
       hook, which drops the `hits` event `agentTick` emits, so it froze at its
       mount instant: a cold `/ai/observe` rendered `REQUESTS 1` over "0 traced
       requests", and later `REQUESTS 10` over "9 traced requests".

       Agreeing at mount proves nothing — both hooks agree then. The tick has
       to land UNDER the mounted screen. */
    const observe = at(<AiObservePage />);
    const panel = () =>
      (within(observe.container).getByText(/traced requests$/).textContent ?? '').trim();

    const before = panel();
    expect(before).toBe(`${kpi('requests').value} traced requests`);

    // Exactly what an agent tick does: trace a request, then emit `hits`.
    await act(async () => {
      CC.promptTrace('shared-services', 'gpt-class', 'autonomous task · read:telemetry');
      (CC._ as unknown as { emit(e: { type: string }): void }).emit({ type: 'hits' });
    });

    expect(panel(), 'the decision panel froze at its mount instant').not.toBe(before);
    expect(panel()).toBe(`${kpi('requests').value} traced requests`);
  });
});

describe('ungoverned tokens — after the Connect beat, history does not launder', () => {
  let ungovernedAtAttach: number;

  beforeAll(() => {
    ungovernedAtAttach = aiSpendTotals(CC).ungovernedTokensToday;
    CC.activateOnramp('nb2');
    (CC._ as unknown as { tickTokens(rng: () => number): boolean }).tickTokens(() => 0.5);
  });

  it('is the state the old copy lied in: nothing public now, plenty public earlier', () => {
    const t = aiSpendTotals(CC);
    expect(t.publicPathCount, 'every route is governed now').toBe(0);
    expect(t.ungovernedTokensToday, 'and the ungoverned history survives').toBe(ungovernedAtAttach);
    expect(ungovernedAtAttach).toBeGreaterThan(0);
    expect(t.governedTokensToday, 'while governed spend has started').toBeGreaterThan(0);
  });

  it('does not let /ai/cost claim none of the spend left over the public internet', () => {
    at(<AiCostPage />);
    expect(screen.queryByText(/none of that spend leaves over the public internet/i)).toBeNull();
    const shown = fmtTokens(aiSpendTotals(CC).ungovernedTokensToday);
    expect(screen.getByText(new RegExp(`${shown} of .* rode the public internet`))).toBeInTheDocument();
  });

  it('carries the split down to each /ai/cost row, beside the path that denies it', () => {
    /* Every row's State cell now reads a governed route. Without the split on
       the row itself, a reader reconciling the summary's ungoverned figure
       against the table has no row to attribute it to. */
    const cost = at(<AiCostPage />);
    const spend = aiSpendTotals(CC);
    const withUngoverned = spend.rows.filter(r => r.ungovernedToday > 0);
    expect(withUngoverned.length, 'this state needs ungoverned rows').toBeGreaterThan(0);
    for (const r of withUngoverned) {
      const row = within(cost.container).getByRole('row', { name: new RegExp(r.tag) });
      expect(row, `${r.tag} row hides its ungoverned share`).toHaveTextContent(
        `${fmtTokens(r.ungovernedToday)} ungoverned today`,
      );
      expect(row, 'while its route reads governed, which is the trap').toHaveTextContent(
        routeLabel(r.routePath),
      );
      expect(r.onPublicPath).toBe(false);
    }
  });

  it('qualifies the Records token count with the split, in the cell it qualifies', () => {
    /* The Records table's Route column now reads "AT&T private fabric" for
       identities most of whose day was public. A bare token count in the cell
       beside it reads as governed spend. The cell states both. */
    const rows = aiBinding(CC).records('none') as { id: string; cells: string[] }[];
    const spend = aiSpendTotals(CC);
    for (const r of spend.rows.filter(x => x.ungovernedToday > 0)) {
      const row = rows.find(x => x.id === r.tag)!;
      expect(row.cells[1], `${r.tag} token cell`).toContain(fmtTokens(r.tokensToday));
      expect(row.cells[1], `${r.tag} token cell hides its ungoverned share`).toContain(
        `${fmtTokens(r.ungovernedToday)} ungoverned`,
      );
      expect(row.cells[3], 'and its route reads governed, which is the trap').not.toMatch(
        /public/i,
      );
    }
  });

  it('does not let the briefing claim no traffic crossed the public internet', () => {
    const text = briefingText();
    expect(text).not.toMatch(/No AI Fabric traffic currently crosses the public internet/i);
    expect(text).not.toMatch(/every identity rides a private or governed path/i);
    expect(text).toContain(fmtTokens(aiSpendTotals(CC).ungovernedTokensToday));
  });

  it('qualifies /ai/connect\'s "governed & ready" badge while ungoverned spend stands', () => {
    const models = CC.modelCatalog() as { ready: boolean }[];
    const t = aiSpendTotals(CC);
    const connect = at(<AiConnectPage />);
    expect(
      within(connect.container).getByText(
        `${models.filter(m => m.ready).length} / ${models.length} governed & ready`,
      ),
      'the fixture needs the badge at full marks',
    ).toBeInTheDocument();
    expect(models.every(m => m.ready)).toBe(true);
    expect(
      within(connect.container).getByText(
        new RegExp(`${fmtTokens(t.ungovernedTokensToday)} tokens .* public internet`),
      ),
    ).toBeInTheDocument();
  });

  it('still reconciles: the buckets sum to the total every screen states', () => {
    const t = aiSpendTotals(CC);
    expect(t.governedTokensToday + t.ungovernedTokensToday).toBe(t.tokensToday);
    for (const r of t.rows) expect(r.governedToday + r.ungovernedToday).toBe(r.tokensToday);
    expect(kpi('tokens').value).toBe(fmtTokens(t.tokensToday));
    expect(kpi('ungoverned').value).toBe(fmtTokens(t.ungovernedTokensToday));
  });
});

/* Runs LAST: reaching Discover's "gap closed" branch means attaching every
   remaining on-ramp, which is irreversible for this file. */
describe('ungoverned tokens — Discover only closes the gap it measured', () => {
  beforeAll(() => {
    // The only thing that clears the public AI flows is putting every flow's
    // SOURCE region on the fabric.
    (CC.onramps as { id: string; active: boolean }[])
      .filter(o => !o.active)
      .forEach(o => CC.activateOnramp(o.id));
  });

  it('actually reaches the closed branch, or this proves nothing', () => {
    expect(aiPublicFlowGbps(CC as never), 'no public AI flow left').toBe(0);
    expect((CC as unknown as { aiExposed(): number }).aiExposed()).toBe(0);
    expect(estateDomains(CC as never)[2].blurb.toLowerCase()).toContain('closed');
  });

  it('is a state where the token layer is demonstrably NOT clean', () => {
    expect(aiSpendTotals(CC).ungovernedTokensToday).toBeGreaterThan(0);
  });

  it('names the layer it closed, instead of closing one it never measured', () => {
    /* Discover's AI blurb is a BYTES-layer claim — endpoints attached and Gbps
       of flow under control. In this exact estate /ai/cost states a non-zero
       ungoverned token figure, so an unqualified "the security gap in this
       domain closed" is denied one click away. */
    const blurb = estateDomains(CC as never)[2].blurb;
    expect(blurb.toLowerCase(), 'the thesis word must survive the qualification').toContain(
      'security',
    );
    expect(blurb, 'a bare "closed" covers a layer this sentence never measured').toMatch(
      /network-layer/i,
    );
    expect(blurb, 'and it points at the layer that is still open').toMatch(/token/i);
  });
});
