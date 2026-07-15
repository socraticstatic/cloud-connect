import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '../../engine';
import { ATTACH_TYPES, activeAttachTypeId } from './attachCatalog';
import { AttachTypes } from './AttachTypes';

describe('attach-type catalog', () => {
  it('carries the five Phase-1 attach types with descriptions', () => {
    expect(ATTACH_TYPES).toHaveLength(5);
    const ids = ATTACH_TYPES.map(t => t.id);
    expect(ids).toEqual(['ip', 'ipsec', 'privatelink', 'cloud-native', 'dedicated']);
    ATTACH_TYPES.forEach(t => {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.desc.length).toBeGreaterThan(0);
      expect(['available', 'planned']).toContain(t.availability);
    });
  });

  it('resolves the active attach type from active dedicated on-ramps', () => {
    expect(activeAttachTypeId([{ type: 'NetBond', active: true }])).toBe('dedicated');
    expect(activeAttachTypeId([{ type: 'NetBond', active: false }])).toBe('ip');
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
});
