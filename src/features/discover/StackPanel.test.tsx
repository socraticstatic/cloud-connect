import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { StackPanel } from './StackPanel';

const renderPanel = () =>
  render(<MemoryRouter><StackPanel /></MemoryRouter>);

describe('StackPanel', () => {
  test('draws the strata in elevation order', () => {
    renderPanel();
    const panel = screen.getByTestId('stack-panel');
    const order = Array.from(panel.querySelectorAll('[data-testid^="stack-band-"]'))
      .map(el => el.getAttribute('data-testid'));
    expect(order).toEqual([
      'stack-band-ai', 'stack-band-cloud', 'stack-band-naas', 'stack-band-transport',
    ]);
  });

  test('live layers open their four verbs', () => {
    renderPanel();
    for (const [key, prefix] of [['ai', '/ai/'], ['naas', '/naas/']] as const) {
      const band = screen.getByTestId(`stack-band-${key}`);
      const hrefs = within(band).getAllByRole('link').map(a => a.getAttribute('href'));
      expect(hrefs).toEqual([`${prefix}connect`, `${prefix}govern`, `${prefix}observe`, `${prefix}cost`]);
    }
  });

  test('Cloud deep-links to where cloud attach lives today, nowhere invented', () => {
    renderPanel();
    const band = screen.getByTestId('stack-band-cloud');
    const hrefs = within(band).getAllByRole('link').map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['/naas/connect']);
  });

  test('Transport & Access names its media and links nowhere', () => {
    renderPanel();
    const band = screen.getByTestId('stack-band-transport');
    expect(within(band).queryAllByRole('link')).toHaveLength(0);
    for (const m of ['Fiber', 'Dark fiber', 'Satellite']) {
      expect(within(band).getByText(m)).toBeInTheDocument();
    }
  });

  test('points at the concept deck', () => {
    renderPanel();
    expect(screen.getByRole('link', { name: /organized this way/i }))
      .toHaveAttribute('href', '/stack');
  });
});
