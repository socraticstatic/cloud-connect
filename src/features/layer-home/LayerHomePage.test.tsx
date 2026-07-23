import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { LayerHomePage } from './LayerHomePage';
import { CC } from '../../engine';
import { naasStratum, aiStratum } from '../discover/stackFigures';
import { fmtUsd } from '../ai-fabric/aiSpend';

const renderHome = (key: 'naas' | 'ai') =>
  render(<MemoryRouter><LayerHomePage layerKey={key} /></MemoryRouter>);

describe('LayerHomePage', () => {
  test('NaaS Home states the layer figures and opens onto its four verbs', () => {
    renderHome('naas');
    expect(screen.getByRole('heading', { name: 'NaaS', level: 1 })).toBeInTheDocument();
    const f = naasStratum(CC);
    const stats = screen.getByTestId('layer-home-stats');
    expect(within(stats).getByText(`${f.regionsAttached}/${f.regionsTotal}`)).toBeInTheDocument();
    const verbLinks = ['connect', 'govern', 'observe', 'cost'].map(
      v => screen.getByTestId(`home-verb-${v}`).getAttribute('href'),
    );
    expect(verbLinks).toEqual(['/naas/connect', '/naas/govern', '/naas/observe', '/naas/cost']);
  });

  test('AI Home states the token-layer figures in /ai/cost vocabulary', () => {
    renderHome('ai');
    expect(screen.getByRole('heading', { name: 'AI Fabric', level: 1 })).toBeInTheDocument();
    const f = aiStratum(CC);
    const stats = screen.getByTestId('layer-home-stats');
    expect(within(stats).getByText(fmtUsd(f.spendToday))).toBeInTheDocument();
    expect(screen.getByTestId('home-verb-connect').getAttribute('href')).toBe('/ai/connect');
  });
});
