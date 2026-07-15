import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../engine';
import { ATTACH_TYPES, activeAttachTypeId } from './attachCatalog';
import { AttachTypes } from './AttachTypes';

describe('attach-type catalog', () => {
  it('carries the five Phase-1 attach types with non-empty labels/descriptions', () => {
    const ids = ATTACH_TYPES.map(t => t.id);
    expect(ids).toEqual(['ip', 'ipsec', 'privatelink', 'cloud-native', 'dedicated']);
    ATTACH_TYPES.forEach(t => {
      // Every card must carry human copy, not just a non-empty string.
      expect(t.label.trim()).not.toBe('');
      expect(t.desc.trim().length).toBeGreaterThan(10);
      expect(['available', 'planned']).toContain(t.availability);
    });
  });

  it('maps hyperscaler circuits to `dedicated` and NetBond (MPLS/IP-VPN) to `ip`', () => {
    // NetBond is an AT&T routed IP hand-off, NOT a dedicated hyperscaler circuit.
    expect(activeAttachTypeId([{ type: 'NetBond', active: true }])).toBe('ip');
    expect(activeAttachTypeId([{ type: 'NetBond Adv', active: true }])).toBe('ip');
    expect(activeAttachTypeId([{ type: 'Direct Connect', active: true }])).toBe('dedicated');
    expect(activeAttachTypeId([{ type: 'ExpressRoute', active: true }])).toBe('dedicated');
    // inactive on-ramps don't light any active type
    expect(activeAttachTypeId([{ type: 'Direct Connect', active: false }])).toBe('ip');
    // dedicated wins when both families are active
    expect(activeAttachTypeId([
      { type: 'NetBond', active: true }, { type: 'Direct Connect', active: true },
    ])).toBe('dedicated');
  });
});

describe('AttachTypes component', () => {
  it('renders five selectable attach-type cards', () => {
    render(<AttachTypes />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(5);
    ATTACH_TYPES.forEach(t => {
      expect(screen.getByText(t.label)).toBeInTheDocument();
    });
  });

  it('selecting a different attach type flips aria-pressed', () => {
    render(<AttachTypes />);
    const target = screen.getByText('PrivateLink').closest('button')!;
    expect(target).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(target);
    expect(target).toHaveAttribute('aria-pressed', 'true');
  });

  it('pre-selects the live active type (not frozen at mount) before the user picks', () => {
    render(<AttachTypes />);
    // Seed has NetBond active → active + pre-selected card is IP.
    const ipCard = screen.getByText('IP').closest('button')!;
    expect(ipCard).toHaveAttribute('aria-pressed', 'true');
    // The Active badge sits on the same live card.
    expect(ipCard).toHaveTextContent('Active');
  });
});
