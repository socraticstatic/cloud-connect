import { render, screen, act } from '@testing-library/react';
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

  test('tracks a telemetry-driven engine mutation with no surface change', () => {
    // activateOnramp('nb2') attaches CoreWeave + Nebius and flips gpt-class's
    // readiness (state-console.ts's modelCatalog keys `ready` off exactly
    // these three attachment flags) — a genuine, synchronous engine mutation
    // that moves aiStratum's modelsReady figure without any React prop change.
    const before = aiStratum(CC);

    render(<LayerContext.Provider value="ai"><EstateFiguresWidget /></LayerContext.Provider>);
    expect(screen.getByText(`${before.modelsReady}/${before.modelsTotal}`)).toBeInTheDocument();

    try {
      act(() => {
        CC.activateOnramp('nb2');
      });

      const after = aiStratum(CC);
      expect(after.modelsReady, 'fixture must actually move this figure').toBeGreaterThan(before.modelsReady);

      expect(screen.queryByText(`${before.modelsReady}/${before.modelsTotal}`)).not.toBeInTheDocument();
      expect(screen.getByText(`${after.modelsReady}/${after.modelsTotal}`)).toBeInTheDocument();
    } finally {
      // Leave the shared CC singleton exactly as this test found it.
      act(() => {
        CC.undo();
      });
    }
  });
});
