import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { LayerContext } from '../registry';
import { EstateFiguresWidget } from './EstateFiguresWidget';
import { CC } from '../../../../engine';
import { naasStratum, aiStratum } from '../../../discover/stackFigures';
import { fmtUsd } from '../../../ai-fabric/aiSpend';

const renderIn = (surface: 'naas' | 'ai') =>
  render(<LayerContext.Provider value={surface}><EstateFiguresWidget /></LayerContext.Provider>);

describe('EstateFiguresWidget', () => {
  test('NaaS shows the fabric figures', () => {
    renderIn('naas');
    const f = naasStratum(CC);
    expect(screen.getByText(`${f.regionsAttached}/${f.regionsTotal}`)).toBeInTheDocument();
    expect(screen.getByText('Regions on the fabric')).toBeInTheDocument();
  });

  test('AI shows the token-layer figures', () => {
    renderIn('ai');
    const f = aiStratum(CC);
    expect(screen.getByText(fmtUsd(f.spendToday))).toBeInTheDocument();
    expect(screen.getAllByTestId('estate-figure')).toHaveLength(4);
  });

  test('follows the layer switch immediately, with no engine event in between', () => {
    const { rerender } = render(
      <LayerContext.Provider value="naas"><EstateFiguresWidget /></LayerContext.Provider>
    );
    expect(screen.getByText('Regions on the fabric')).toBeInTheDocument();
    expect(screen.queryByText('Model endpoints ready')).not.toBeInTheDocument();

    rerender(
      <LayerContext.Provider value="ai"><EstateFiguresWidget /></LayerContext.Provider>
    );

    expect(screen.queryByText('Regions on the fabric')).not.toBeInTheDocument();
    expect(screen.getByText('Model endpoints ready')).toBeInTheDocument();
  });
});
