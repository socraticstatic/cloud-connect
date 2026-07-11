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
    // getAllByText: the on-ramp's name now also appears as a node label in the
    // route topology SVG mounted below the panel (Task 2.2).
    expect(screen.getAllByText(new RegExp(inactive.name, 'i')).length).toBeGreaterThan(0);

    const btn = screen.getAllByRole('button', { name: /attach|provision/i })[0];
    fireEvent.click(btn);
    expect(CC.onramps.some((o: { active: boolean }) => o.active)).toBe(true);
  });
});
