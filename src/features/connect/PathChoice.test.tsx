import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CC } from '../../engine';
import { pathEvidence } from './pathChoice';
import { PathChoice } from './PathChoice.tsx';

describe('PathChoice', () => {
  it('renders both paths for a region that has both', () => {
    render(<PathChoice cloudId="aws" regionId="use1" />);
    expect(screen.getByText('Direct cloud connect')).toBeInTheDocument();
    expect(screen.getByText('Dedicated tenant')).toBeInTheDocument();
  });

  it('shows the engine latency, not a literal', () => {
    render(<PathChoice cloudId="aws" regionId="euw1" />);
    const expected = pathEvidence(CC as never, 'aws', 'euw1')[0].latencyMs;
    expect(screen.getAllByText(`${expected} ms`).length).toBeGreaterThan(0);
  });

  it('marks the unavailable path and states why', () => {
    render(<PathChoice cloudId="azure" regionId="uks" />);
    expect(screen.getByText(/No NetBond on-ramp targets this region/i)).toBeInTheDocument();
  });

  it('surfaces the partner-fabric extension on a neocloud region', () => {
    render(<PathChoice cloudId="cw" regionId="cwe" />);
    expect(screen.getByText(/Equinix Fabric/)).toBeInTheDocument();
  });

  it('renders nothing for an unknown region', () => {
    const { container } = render(<PathChoice cloudId="aws" regionId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });
});
