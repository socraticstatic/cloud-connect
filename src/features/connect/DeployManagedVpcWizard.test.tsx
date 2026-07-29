// src/features/connect/DeployManagedVpcWizard.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { CC } from '../../engine';
import { DeployManagedVpcWizard } from './DeployManagedVpcWizard';

afterEach(cleanup);

describe('DeployManagedVpcWizard', () => {
  it('locked region: walks tier -> cidr -> confirm and creates the engine record', () => {
    render(<DeployManagedVpcWizard lockedRegion={{ cloudId: 'aws', regionId: 'usw2' }} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /1 Gbps/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    const cidr = screen.getByLabelText(/CIDR/i) as HTMLInputElement;
    expect(cidr.value).toBe(CC.suggestManagedCidr());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: /Deploy/ }));
    const m = CC.managedVpcFor('aws', 'usw2');
    expect(m).not.toBeNull();
    // tracker replaces the steps — the first stage is listed
    expect(screen.getByText(m!.stages[0].label)).toBeInTheDocument();
  });

  it('tracker reflects engine advances live', () => {
    // record exists from the previous test
    const m = CC.managedVpcFor('aws', 'usw2')!;
    render(<DeployManagedVpcWizard lockedRegion={{ cloudId: 'aws', regionId: 'usw2' }} onClose={() => {}} />);
    act(() => { CC.advanceManagedVpc(m.id); });
    expect(screen.getByTestId(`stage-${m.stages[0].key}`)).toHaveAttribute('data-done', 'true');
  });

  it('an invalid CIDR blocks Next', () => {
    render(<DeployManagedVpcWizard lockedRegion={{ cloudId: 'azure', regionId: 'uks' }} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /500 Mbps/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.change(screen.getByLabelText(/CIDR/i), { target: { value: '10.0.0.0/8' } });
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
