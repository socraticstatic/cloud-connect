import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { StackRail } from './StackRail';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <StackRail />
    </MemoryRouter>,
  );

describe('StackRail', () => {
  test('absent off the layer pages', () => {
    renderAt('/discover');
    expect(screen.queryByTestId('stack-rail')).toBeNull();
  });

  test('on an AI page, the hop keeps the verb into NaaS', () => {
    renderAt('/ai/cost');
    const link = screen.getByRole('link', { name: /NaaS/ });
    expect(link).toHaveAttribute('href', '/naas/cost');
    expect(link).toHaveAttribute('title', 'Cost, on the NaaS layer');
  });

  test('on a NaaS page, the hop keeps the verb into AI Fabric', () => {
    renderAt('/naas/govern');
    const link = screen.getByRole('link', { name: /AI Fabric/ });
    expect(link).toHaveAttribute('href', '/ai/govern');
  });

  test('the current layer is marked, not linked', () => {
    renderAt('/ai/observe');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    const rail = screen.getByTestId('stack-rail');
    expect(rail.querySelector('[aria-current="true"]')?.textContent).toContain('AI Fabric');
  });

  test('vision strata are inert markers', () => {
    renderAt('/ai/connect');
    const rail = screen.getByTestId('stack-rail');
    const slots = rail.querySelectorAll('[data-testid="vision-slot"]');
    expect(slots.length).toBe(2);
    for (const slot of slots) {
      expect(slot.querySelector('a')).toBeNull();
    }
    expect(rail.textContent).toContain('Cloud');
    expect(rail.textContent).toContain('Transport & Access');
  });
});
