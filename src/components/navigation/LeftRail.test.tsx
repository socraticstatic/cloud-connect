import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach } from 'vitest';
import { LeftRail } from './LeftRail';

const renderAt = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><LeftRail /></MemoryRouter>);

describe('LeftRail', () => {
  beforeEach(() => localStorage.clear());

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

  test('expanded by default; the toggle collapses to icons only and persists', () => {
    renderAt('/naas/connect');
    const rail = screen.getByTestId('left-rail');
    expect(rail).toHaveAttribute('data-collapsed', 'false');
    // Expanded: verb labels are visible text, links still there.
    expect(within(rail).getByText('Connect')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('rail-collapse-toggle'));
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'true');
    // Collapsed: no label text, but the links remain (icon only) with a tooltip.
    const collapsed = screen.getByTestId('left-rail');
    expect(within(collapsed).queryByText('Connect')).toBeNull();
    const connect = within(collapsed).getByTestId('rail-connect');
    expect(connect).toHaveAttribute('title', 'Connect');
    expect(connect.getAttribute('href')).toBe('/naas/connect');
    // The choice persisted.
    expect(localStorage.getItem('cc-rail-collapsed')).toBe('1');
  });

  test('restores the collapsed choice from storage', () => {
    localStorage.setItem('cc-rail-collapsed', '1');
    renderAt('/ai/govern');
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByTestId('rail-collapse-toggle')).toHaveAttribute('aria-label', 'Expand sidebar');
  });
});
