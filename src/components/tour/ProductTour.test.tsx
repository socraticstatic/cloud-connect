import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { ProductTour, TourStep } from './ProductTour';

/* ProductTour is a SHARED component: the Cloud Connect demo tour
   (TourLauncher.tsx) and the main-app onboarding tour (App.tsx, mainAppTour)
   both render it. `resetOnOpen` has to stay scoped to whichever caller asks
   for it — the demo tour wants every launch to start at beat one, the
   main-app tour has always let a user close partway through and pick back
   up where they left off. A behaviour change with no prop would leak from
   one caller into the other, which is exactly what happened before this
   test existed. */

const steps: TourStep[] = [
  { id: 'a', title: 'Step A', description: 'first beat' },
  { id: 'b', title: 'Step B', description: 'second beat' },
];

function Harness({ resetOnOpen }: { resetOnOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>reopen</button>
      <ProductTour
        steps={steps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={() => setIsOpen(false)}
        resetOnOpen={resetOnOpen}
      />
    </>
  );
}

async function advanceThenReopen() {
  fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  expect(await screen.findByTestId('tour-title')).toHaveTextContent('Step B');

  fireEvent.click(screen.getByLabelText('Close tour'));
  expect(screen.queryByTestId('tour-title')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'reopen' }));
}

describe('ProductTour — resetOnOpen scoping', () => {
  it('defaults to NOT resetting — reopening a closed tour resumes on the step the user left (mainAppTour contract)', async () => {
    render(<Harness />);
    await advanceThenReopen();
    expect(screen.getByTestId('tour-title')).toHaveTextContent('Step B');
  });

  it('resetOnOpen restarts at step 1 every time the tour opens (Cloud Connect demo-tour contract)', async () => {
    render(<Harness resetOnOpen />);
    await advanceThenReopen();
    expect(screen.getByTestId('tour-title')).toHaveTextContent('Step A');
  });
});
