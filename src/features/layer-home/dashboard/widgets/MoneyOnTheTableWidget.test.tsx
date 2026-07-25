import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MoneyOnTheTableWidget } from './MoneyOnTheTableWidget';
import { CC } from '../../../../engine';

describe('MoneyOnTheTableWidget', () => {
  test('states available savings and lists the top unattached bucket', () => {
    render(<MoneyOnTheTableWidget />);
    const arb = CC.arbitrage();
    expect(screen.getByText(`$${Math.round(arb.availableSavings).toLocaleString()}/mo`)).toBeInTheDocument();
    const topUnattached = arb.buckets.find(b => !b.attached);
    if (topUnattached) expect(screen.getByText(topUnattached.label)).toBeInTheDocument();
  });
});
