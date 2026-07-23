import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StackDeckPage } from './StackDeckPage';

/**
 * /stack renders as a standalone document: no router hooks, plain hash
 * anchors into the app. Rendered bare, no providers needed.
 */

const LIVE_ROUTES = [
  '#/ai/connect', '#/ai/govern', '#/ai/observe', '#/ai/cost',
  '#/naas/connect', '#/naas/govern', '#/naas/observe', '#/naas/cost',
];

describe('StackDeckPage', () => {
  it('renders all eight section headlines', () => {
    render(<StackDeckPage />);
    expect(screen.getByRole('heading', { name: /A verb is not a destination/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Four verbs across\. Four layers down/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /One experience over everything AT&T runs/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Design on it\. Share it\. A human commits/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Seven rules route every label/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Eight links\. Four words/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sticky is three columns riding a fourth/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /The table was always there/ })).toBeInTheDocument();
  });

  it('the twin section walks the five-step loop and cites both companions', () => {
    render(<StackDeckPage />);
    for (const step of ['Design', 'Simulate', 'Share', 'Approve', 'The advisor drafts']) {
      expect(screen.getByText(step, { exact: true })).toBeInTheDocument();
    }
    expect(screen.getByText(/The time machine\./)).toBeInTheDocument();
    expect(screen.getByText(/⌘K intents\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open the twin/ })).toHaveAttribute('href', '#/discover');
    expect(screen.getByRole('link', { name: /Scrub the window/ })).toHaveAttribute('href', '#/naas/observe');
  });

  it('draws the full matrix: 16 body cells', () => {
    render(<StackDeckPage />);
    expect(screen.getAllByTestId('matrix-cell')).toHaveLength(16);
  });

  it('live rows link only at the eight real hash routes', () => {
    render(<StackDeckPage />);
    const matrix = screen.getByTestId('matrix');
    const links = within(matrix).getAllByRole('link');
    expect(links).toHaveLength(8);
    const hrefs = links.map(a => a.getAttribute('href'));
    for (const href of hrefs) {
      expect(LIVE_ROUTES).toContain(href);
    }
    // every one of the eight routes is present exactly once
    expect(new Set(hrefs).size).toBe(8);
  });

  it('vision rows carry zero links', () => {
    render(<StackDeckPage />);
    for (const key of ['cloud', 'transport']) {
      const row = screen.getByTestId(`matrix-row-${key}`);
      expect(within(row).queryAllByRole('link')).toHaveLength(0);
      expect(row.querySelectorAll('a')).toHaveLength(0);
    }
  });

  it('has the Export PDF button in the header', () => {
    render(<StackDeckPage />);
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
  });
});

describe('StackDeckPage — the Personas tab', () => {
  it('defaults to the concept; the tab swaps to six persona cards and back', () => {
    render(<StackDeckPage />);
    expect(screen.getByTestId('deck-tab-concept')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('deck-tab-personas'));
    expect(screen.getByRole('heading', { name: /Six roles/ })).toBeInTheDocument();
    const cards = screen.getAllByTestId(/^persona-(architect|planner|netops|cloudeng|aianalyst|finops)$/);
    expect(cards).toHaveLength(6);
    for (const name of [
      'Network Architect', 'Network Planner', 'NetOps Engineer',
      'Cloud Network Engineer', 'AI Platform Analyst', 'FinOps Analyst',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    // Every card carries its footprint on the deck's own table.
    expect(screen.getAllByTestId('persona-footprint')).toHaveLength(6);
    fireEvent.click(screen.getByTestId('deck-tab-concept'));
    expect(screen.getByRole('heading', { name: /A verb is not a destination/ })).toBeInTheDocument();
  });

  it('persona links stay inside the live app', () => {
    render(<StackDeckPage />);
    fireEvent.click(screen.getByTestId('deck-tab-personas'));
    const links = screen.getAllByRole('link').map(a => a.getAttribute('href'));
    for (const href of links) {
      expect(href).toBe('#/discover');
    }
  });
});
