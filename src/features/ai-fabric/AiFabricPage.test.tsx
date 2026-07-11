import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { AiFabricPage } from './AiFabricPage';

test('lists token policies and enforcing one mutates engine state', () => {
  render(<MemoryRouter><AiFabricPage /></MemoryRouter>);
  const policies = CC.tokenPolicyList();
  expect(policies.length).toBeGreaterThan(0);
  const unenforced = policies.find(p => !p.enforced);
  if (unenforced) {
    const before = CC.tokenPolicyList().filter(p => p.enforced).length;
    fireEvent.click(screen.getAllByRole('button', { name: /enforce/i })[0]);
    expect(CC.tokenPolicyList().filter(p => p.enforced).length).toBeGreaterThan(before);
  }
});
