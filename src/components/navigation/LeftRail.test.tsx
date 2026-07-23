import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { LeftRail } from './LeftRail';

const renderAt = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><LeftRail /></MemoryRouter>);

describe('LeftRail', () => {
  test('absent on the global estate view', () => {
    renderAt('/discover');
    expect(screen.queryByTestId('left-rail')).toBeNull();
  });

  test('on a NaaS page: Home first, then the four verbs, all scoped to NaaS', () => {
    renderAt('/naas/connect');
    const rail = screen.getByTestId('left-rail');
    const labels = within(rail).getAllByRole('link').map(a => a.textContent?.trim());
    expect(labels).toEqual(['Home', 'Connect', 'Govern', 'Observe', 'Cost']);
    const hrefs = within(rail).getAllByRole('link').map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['/naas/home', '/naas/connect', '/naas/govern', '/naas/observe', '/naas/cost']);
    expect(within(rail).getByText('NaaS')).toBeInTheDocument();
  });

  test('the current verb is the active item', () => {
    renderAt('/ai/cost');
    const rail = screen.getByTestId('left-rail');
    expect(within(rail).getByText('AI Fabric')).toBeInTheDocument();
    const active = rail.querySelector('[aria-current="page"]');
    expect(active?.getAttribute('href')).toBe('/ai/cost');
  });

  test('Home is active on the layer home route', () => {
    renderAt('/naas/home');
    const active = screen.getByTestId('left-rail').querySelector('[aria-current="page"]');
    expect(active?.getAttribute('href')).toBe('/naas/home');
  });
});
