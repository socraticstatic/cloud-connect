import { render, screen } from '@testing-library/react';
import { CC } from '../../engine';
import { AppsPanel } from './AppsPanel';

test('renders a card per application from the engine', () => {
  render(<AppsPanel />);
  const apps = CC.appList();
  expect(apps.length).toBeGreaterThan(0);
  const name = apps[0].app?.name ?? apps[0].name; // read state-apps.ts for exact field
  expect(screen.getByText(new RegExp(name, 'i'))).toBeInTheDocument();
});
