import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CC } from '../../engine';
import { ConnectPage } from './ConnectPage';

describe('ConnectPage', () => {
  it('lists on-ramps and attaching one activates it in the engine', () => {
    render(
      <MemoryRouter>
        <ConnectPage />
      </MemoryRouter>
    );
    const inactive = CC.onramps.find((o: { active: boolean }) => !o.active)!;
    expect(screen.getByText(new RegExp(inactive.name, 'i'))).toBeInTheDocument();

    const btn = screen.getAllByRole('button', { name: /attach|provision/i })[0];
    fireEvent.click(btn);
    expect(CC.onramps.some((o: { active: boolean }) => o.active)).toBe(true);
  });
});
