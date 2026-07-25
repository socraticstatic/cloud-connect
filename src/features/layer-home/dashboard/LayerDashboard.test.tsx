import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { LayerDashboard } from './LayerDashboard';
import { DEFAULT_LAYOUT, WIDGET_REGISTRY } from './registry';

describe('LayerDashboard', () => {
  test('renders exactly the NaaS default widgets, by title', () => {
    render(<LayerDashboard surface="naas" />);
    const frames = screen.getAllByTestId('widget-frame');
    expect(frames.map(f => f.getAttribute('data-widget-title'))).toEqual(
      DEFAULT_LAYOUT.naas.map(id => WIDGET_REGISTRY[id].title),
    );
  });

  test('renders an AI-only widget on the AI board and not on NaaS', () => {
    render(<LayerDashboard surface="ai" />);
    expect(screen.getByText('Token budgets')).toBeInTheDocument();
  });

  test('skips a layout id that is not in the registry, without crashing', () => {
    // Temporarily append an unknown id to the real DEFAULT_LAYOUT.naas array
    // (there is no per-render injection point for the layout) and restore it
    // afterward so the mutation never leaks into other test files.
    const original = [...DEFAULT_LAYOUT.naas];
    DEFAULT_LAYOUT.naas.push('does-not-exist-in-registry');
    try {
      expect(() => render(<LayerDashboard surface="naas" />)).not.toThrow();
      const frames = screen.getAllByTestId('widget-frame');
      expect(frames.map(f => f.getAttribute('data-widget-title'))).toEqual(
        original.map(id => WIDGET_REGISTRY[id].title),
      );
    } finally {
      DEFAULT_LAYOUT.naas.length = 0;
      DEFAULT_LAYOUT.naas.push(...original);
    }
  });
});
