import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useFlowProgress } from './useFlowProgress';
import { CC } from '../../engine';

// Render the hook on a non-Govern route so Govern's status comes purely from
// the doneByStage derivation (not from being the "current" route).
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/discover']}>{children}</MemoryRouter>
);
const governStatus = () => renderHook(() => useFlowProgress(), { wrapper }).result.current.find(s => s.stage === 'govern')!.status;

const FIX_KEYS = ['isolateFinance', 'fwInspection', 'segmentHelion', 'dnsFirewall', 'dataPerimeter', 'shiftAws', 'renumbered'];

describe('useFlowProgress — Govern completion is rule-linked, not any-fix', () => {
  beforeEach(() => {
    for (const k of FIX_KEYS) CC.fixes[k] = false;
  });

  it('applying the non-rule posture fix shiftAws alone does NOT mark Govern done', () => {
    CC.fixes.shiftAws = true;
    expect(governStatus()).toBe('upcoming');
  });

  it('applying the non-rule fix renumbered alone does NOT mark Govern done', () => {
    CC.fixes.renumbered = true;
    expect(governStatus()).toBe('upcoming');
  });

  it('applying a rule-linked fix (isolateFinance) DOES mark Govern done', () => {
    CC.fixes.isolateFinance = true;
    expect(governStatus()).toBe('done');
  });
});
