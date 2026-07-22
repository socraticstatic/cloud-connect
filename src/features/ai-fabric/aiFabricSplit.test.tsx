import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeAll } from 'vitest';
import { CC } from '../../engine';
import { AiConnectPage } from './AiConnectPage';
import { AiGovernPage } from './AiGovernPage';
import { AiObservePage } from './AiObservePage';
import { AiCostPage } from './AiCostPage';
import { aiSpendTotals, fmtTokens, fmtUsd } from './aiSpend';
import { aiBinding } from '../observe/aiBinding';

/**
 * The AI Fabric used to be one tabbed page. It is now four screens, one per
 * verb. These tests pin WHICH block landed on WHICH screen — a block that
 * silently moves, or a screen that renders empty, fails here — and assert
 * every figure against the engine rather than against a literal.
 *
 * The engine is a shared singleton and mutations persist within a file, so
 * nothing here clicks a mutating control.
 */

const at = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

/** The summary StatTile carrying `label`. Scoped to the totals band, because
 *  the budgets table below it uses the same column names. */
const tile = (label: string) =>
  within(screen.getByTestId('ai-cost-totals')).getByText(label).parentElement as HTMLElement;

describe('AI Fabric · Connect', () => {
  it('carries the model catalog, counting governed endpoints as the engine does', () => {
    at(<AiConnectPage />);

    const models = CC.modelCatalog() as { ready: boolean }[];
    const ready = models.filter(m => m.ready).length;

    expect(screen.getByText('Model catalog')).toBeInTheDocument();
    expect(
      screen.getByText(`${ready} / ${models.length} governed & ready`),
    ).toBeInTheDocument();
    // One row per catalogued model, plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(models.length + 1);
  });

  it('is the Connect screen, not the Govern one — no token-policy table here', () => {
    at(<AiConnectPage />);
    expect(screen.queryByText('Token policies')).toBeNull();
  });
});

describe('AI Fabric · Govern', () => {
  it('carries the token policies and the agents they bind', () => {
    at(<AiGovernPage />);

    const policies = CC.tokenPolicyList() as { enforced: boolean }[];
    const agents = CC.agentList() as { enabled: boolean }[];

    expect(screen.getByText('Token policies')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${policies.filter(p => p.enforced).length} / ${policies.length} enforced`,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(
      screen.getByText(`${agents.filter(a => a.enabled).length} / ${agents.length} enabled`),
    ).toBeInTheDocument();
  });

  it('keeps the tour anchor the retired /ai-fabric path used to land on', () => {
    const { container } = at(<AiGovernPage />);
    expect(container.querySelector('[data-tour="aifabric-policies"]')).toBeTruthy();
  });
});

describe('AI Fabric · Observe', () => {
  it('carries the observability shell, the prompt trace and the decision log', () => {
    at(<AiObservePage />);

    expect(screen.getAllByTestId('kpi-tile')).toHaveLength(5);
    expect(screen.getByText(/Fabric briefing/i)).toBeInTheDocument();
    expect(screen.getByText('Prompt trace')).toBeInTheDocument();
    expect(screen.getByText('Governance decisions')).toBeInTheDocument();
  });

  it('renders the trace above the decision log, which tells the reader to look up', () => {
    const { container } = at(<AiObservePage />);
    const trace = screen.getByText('Prompt trace');
    const decisions = screen.getByText('Governance decisions');
    // Node.DOCUMENT_POSITION_FOLLOWING === 4: `decisions` comes after `trace`.
    expect(trace.compareDocumentPosition(decisions) & 4).toBeTruthy();
    expect(container).toBeTruthy();
  });
});

describe('AI Fabric · Cost — nothing metering yet', () => {
  /* The seeded estate has budgets and no spend: no AI endpoint's path is
     attached, so no identity meters. That is a real state and it must not
     render as a blank screen, nor as a screen claiming a saving it cannot
     have. This describe runs FIRST, before the one below lights the fabric —
     the engine is a shared singleton and mutations persist within a file. */
  it('renders the ceilings and says why nothing is metering', () => {
    at(<AiCostPage />);

    const totals = aiSpendTotals(CC);
    expect(totals.tokensToday, 'this describe assumes an unlit estate').toBe(0);

    expect(screen.getByText(/No identity is metering yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/holds \$/i)).toBeNull();

    // Not blank: every ceiling is on screen even with nothing spent.
    for (const r of totals.rows) {
      const row = screen.getByRole('row', { name: new RegExp(r.tag) });
      expect(row).toHaveTextContent(r.budgetTokens.toLocaleString());
      expect(row).toHaveTextContent('Endpoint not attached');
    }
  });
});

describe('AI Fabric · Cost — metering', () => {
  /* Everything below is asserted against an estate that is actually spending.
     This matters more than it looks: with nothing metering, every money figure
     on the screen is $0.00, and an agreement assertion between two screens
     both showing $0.00 passes no matter how badly one of them is derived. The
     setup is deterministic — a fixed rng, never Math.random. */
  beforeAll(() => {
    CC.activateOnramp('nb2');
    (CC._ as { tickTokens: (rng: () => number) => boolean }).tickTokens(() => 0.5);
  });

  it('actually meters, so the assertions below are not vacuous', () => {
    const totals = aiSpendTotals(CC);
    expect(totals.tokensToday).toBeGreaterThan(0);
    expect(totals.spendToday).toBeGreaterThan(0);
    expect(totals.meteringCount).toBeGreaterThan(0);
  });

  it('states tokens, spend and budget use as CC derivations, never as literals', () => {
    at(<AiCostPage />);

    const totals = aiSpendTotals(CC);
    const budgetPct =
      totals.budgetTokens > 0 ? Math.round((totals.tokensToday / totals.budgetTokens) * 100) : 0;

    expect(within(tile('Tokens today')).getByText(fmtTokens(totals.tokensToday))).toBeInTheDocument();
    expect(within(tile('Spend today')).getByText(fmtUsd(totals.spendToday))).toBeInTheDocument();
    expect(within(tile('Budget used')).getByText(`${budgetPct}%`)).toBeInTheDocument();
  });

  it('lists every metered identity with the budget the engine holds for it', () => {
    at(<AiCostPage />);

    const rows = aiSpendTotals(CC).rows;
    expect(rows.length).toBeGreaterThan(0);

    for (const r of rows) {
      const row = screen.getByRole('row', { name: new RegExp(r.tag) });
      expect(row).toHaveTextContent(r.budgetTokens.toLocaleString());
      expect(row).toHaveTextContent(`${r.pct}% of budget`);
      expect(row).toHaveTextContent(r.metering ? 'Metering' : 'Endpoint not attached');
    }
  });

  it('states the metering count the engine reports, not a claim of its own', () => {
    at(<AiCostPage />);
    const totals = aiSpendTotals(CC);

    expect(
      screen.getByText(
        new RegExp(`${totals.meteringCount} of ${totals.identityCount} identities are metering`),
      ),
    ).toBeInTheDocument();
  });

  /* Govern lists EVERY token policy; only metered app tags carry a meter, so
     the Cost screen's identity count is legitimately smaller than Govern's
     policy count. Left unsaid, that reads as one of the two screens being
     wrong. The screen must account for the difference, and account for it from
     the engine — not from a sentence someone remembered to write. */
  it('accounts for every token policy Govern lists, metered or not', () => {
    at(<AiCostPage />);

    const totals = aiSpendTotals(CC);
    const policies = CC.tokenPolicyList() as { tag: string }[];

    expect(totals.identityCount + totals.unmeteredPolicyTags.length).toBe(policies.length);

    if (totals.unmeteredPolicyTags.length > 0) {
      const note = screen.getByText(/scopes? a group rather than a metered identity/i);
      expect(note).toHaveTextContent(String(totals.unmeteredPolicyTags.length));
      for (const tag of totals.unmeteredPolicyTags) {
        expect(note).toHaveTextContent(tag);
      }
    }
  });

  /* Cost is stated on two screens. They must be the same figure — not
     "close", the same string — or one of them is lying. Asserted against a
     non-zero spend, so a screen that re-derived the number wrongly cannot
     slip through on both sides reading $0.00. */
  it('states the same spend the Observe screen states', () => {
    const totals = aiSpendTotals(CC);
    expect(totals.spendToday, 'a $0.00 agreement proves nothing').toBeGreaterThan(0);

    const kpis = aiBinding(CC).kpis() as { key: string; value: string }[];
    const costKpi = kpis.find(k => k.key === 'cost')!.value;

    expect(costKpi).toBe(fmtUsd(totals.spendToday));
    expect(costKpi).not.toBe('$0.00');
    expect(kpis.find(k => k.key === 'tokens')!.value).toBe(fmtTokens(totals.tokensToday));
    expect(kpis.find(k => k.key === 'savings')!.value).toBe(fmtUsd(totals.savings));

    at(<AiCostPage />);
    expect(within(tile('Spend today')).getByText(costKpi)).toBeInTheDocument();
  });
});
