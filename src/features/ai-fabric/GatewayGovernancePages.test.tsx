import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { AiTeamsPage, AiProvidersPage, AiKeysPage } from './GatewayGovernancePages';
import { CC } from '../../engine';

const wrap = (el: React.ReactElement) => render(<MemoryRouter>{el}</MemoryRouter>);

describe('AI Gateway governance pages', () => {
  test('Teams & limits lists every token policy with its budget', () => {
    wrap(<AiTeamsPage />);
    const table = screen.getByTestId('teams-table');
    const policies = CC.tokenPolicyList() as { tag: string; budget: number }[];
    expect(policies.length).toBeGreaterThan(0);
    for (const p of policies) {
      const row = within(table).getByText(p.tag).closest('tr')!;
      expect(row.textContent).toContain(p.budget.toLocaleString());
    }
  });

  test('Providers lists the model catalog with readiness from the engine', () => {
    wrap(<AiProvidersPage />);
    const table = screen.getByTestId('providers-table');
    const catalog = CC.modelCatalog() as { name: string; ready: boolean }[];
    expect(catalog.length).toBeGreaterThan(0);
    for (const m of catalog) {
      const row = within(table).getByText(m.name).closest('tr')!;
      expect(row.textContent).toContain(m.ready ? 'Ready' : 'Not attached');
    }
  });

  test('Virtual keys lists agents with scopes; suspend toggles through the engine', () => {
    wrap(<AiKeysPage />);
    const table = screen.getByTestId('keys-table');
    const agents = CC.agentList() as { id: string; name: string; scopes: string[]; enabled: boolean }[];
    expect(agents.length).toBeGreaterThan(0);
    const first = agents[0];
    const row = within(table).getByText(first.name).closest('tr')!;
    for (const scope of first.scopes) {
      expect(row.textContent).toContain(scope);
    }
    // Toggle is the real engine mutation — flip it, verify, flip it back.
    // agentList() hands back the same objects, so capture the primitive
    // BEFORE mutating or the expectation chases its own tail.
    const before = first.enabled;
    fireEvent.click(screen.getByTestId(`key-toggle-${first.id}`));
    expect((CC.agentList() as typeof agents).find(a => a.id === first.id)!.enabled).toBe(!before);
    fireEvent.click(screen.getByTestId(`key-toggle-${first.id}`));
    expect((CC.agentList() as typeof agents).find(a => a.id === first.id)!.enabled).toBe(before);
  });
});
