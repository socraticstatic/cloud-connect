import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProviderLogo } from './ProviderLogo';
import { COLOR } from './providerMarks';

describe('ProviderLogo', () => {
  it('renders an svg brand path for a mark provider (aws)', () => {
    const { container } = render(<ProviderLogo id="aws" size={28} />);
    const path = container.querySelector('svg path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')?.length ?? 0).toBeGreaterThan(20);
  });

  it('renders a monogram (not an svg path) for a neocloud provider (cw)', () => {
    const { container } = render(<ProviderLogo id="cw" />);
    expect(container.querySelector('svg path')).toBeNull();
    expect(screen.getByText('CW')).toBeInTheDocument();
  });

  it('exposes a human-readable aria-label per provider', () => {
    render(<ProviderLogo id="gcp" />);
    expect(screen.getByLabelText('Google Cloud')).toBeInTheDocument();
  });

  it('applies the brand color to the mark fill', () => {
    const { container } = render(<ProviderLogo id="aws" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('fill')).toBe(COLOR.aws);
  });

  it('applies the brand color to the monogram text', () => {
    render(<ProviderLogo id="neb" />);
    const mono = screen.getByText('NB');
    expect(mono).toHaveStyle({ color: COLOR.neb });
  });
});
