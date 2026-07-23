import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { LayerMenu } from './LayerMenu';
import { NAV_LAYERS } from './navItems';

const naas = NAV_LAYERS.find(l => l.key === 'naas')!;

const renderMenu = (path = '/discover') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LayerMenu layer={naas} />
    </MemoryRouter>,
  );

describe('LayerMenu', () => {
  test('closed by default; click opens the panel with blurb and verbs', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).toBeNull();
    const trigger = screen.getByRole('button', { name: naas.label });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: naas.label });
    expect(within(menu).getByText(naas.blurb)).toBeInTheDocument();
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(4);
  });

  test('ArrowDown on the trigger opens and focuses the first verb', () => {
    renderMenu();
    fireEvent.keyDown(screen.getByRole('button', { name: naas.label }), { key: 'ArrowDown' });
    const items = screen.getAllByRole('menuitem');
    expect(document.activeElement).toBe(items[0]);
  });

  test('arrows cycle, Escape closes and returns focus to the trigger', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: naas.label });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const items = screen.getAllByRole('menuitem');
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(items[3]);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  test('an active route inside the layer lights the trigger', () => {
    renderMenu('/naas/observe');
    expect(screen.getByRole('button', { name: naas.label }).className).toContain('border-fw-active');
  });

  test('hover-open schedules a delayed close on pointer leave', () => {
    vi.useFakeTimers();
    renderMenu();
    const root = screen.getByRole('button', { name: naas.label }).parentElement!;
    fireEvent.pointerEnter(root, { pointerType: 'mouse' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.pointerLeave(root, { pointerType: 'mouse' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByRole('menu')).toBeNull();
    vi.useRealTimers();
  });
});
