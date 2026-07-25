import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { ProductTour, TourStep, choosePlacement, planTourScroll } from './ProductTour';

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

/* Every beat of cloudConnectTour asks for `placement: 'top'`, and every one of
   them used to end up at `top: 16` — on top of the spotlight it was supposed to
   sit above. Two separate things had to be true for that, and both are covered
   here because fixing either one alone leaves the bug standing:

   - choosePlacement: the tooltip must move to the other side when its own side
     cannot hold it, instead of being shoved back on-screen by the clamp.
   - planTourScroll: the sides have to be measured against where the page CAN be
     scrolled, not where `block: 'center'` happens to leave the target. Centring
     splits the viewport into two halves that are each too short, so a flip with
     no scroll has nowhere to flip to. */

const GAP = 28; // highlightPadding 12 + the 16px the tooltip keeps clear
const VIEW = { top: 0, bottom: 720 };

describe('choosePlacement', () => {
  it('keeps the requested side when it holds the tooltip', () => {
    expect(choosePlacement('top', 400, 100, 300)).toBe('top');
    expect(choosePlacement('bottom', 100, 400, 300)).toBe('bottom');
  });

  it('flips to the other side when the requested one cannot hold it', () => {
    expect(choosePlacement('top', 200, 400, 300)).toBe('bottom');
    expect(choosePlacement('bottom', 400, 200, 300)).toBe('top');
  });

  it('keeps the requested side when NEITHER holds it — the target is simply too tall', () => {
    // The roomier side is `below` by 4px. Flipping for that is a trade the
    // clamp then pays for at ~10x, so intent wins.
    expect(choosePlacement('top', 307, 311, 418)).toBe('top');
  });

  it('leaves the non-vertical placements alone', () => {
    expect(choosePlacement('center', 0, 0, 400)).toBe('center');
    expect(choosePlacement('left', 0, 0, 400)).toBe('left');
    expect(choosePlacement('right', 0, 0, 400)).toBe('right');
  });
});

describe('planTourScroll', () => {
  const plan = (over: Partial<Parameters<typeof planTourScroll>[0]> = {}) =>
    planTourScroll({
      requested: 'top',
      rect: { top: 336, height: 190 },
      tooltipHeight: 430,
      gap: GAP,
      view: VIEW,
      scrollTop: 0,
      maxScroll: 4000,
      ...over,
    });

  it('scrolls the target DOWN to open a band above it, and stays on top', () => {
    // 336px above the target, 446px needed — but the page is scrolled to the
    // top of a long document, so the target can be pushed down to make room.
    const { placement, scrollTop } = plan({ scrollTop: 600 });
    expect(placement).toBe('top');
    expect(scrollTop).toBe(600 - (474 - 336)); // rect.top lands on margin+h+gap
  });

  it('flips to bottom — and scrolls UP to open the band there — when the target is already at the top of its page', () => {
    /* The measured failure: at scrollTop 0 the target cannot be pushed any
       lower, so `top` is unreachable no matter how the page scrolls. */
    const { placement, scrollTop } = plan();
    expect(placement).toBe('bottom');
    // rect.bottom must land at 720 - 16 - 430 - 28 = 246, i.e. rect.top at 56.
    expect(scrollTop).toBe(336 - 56);
  });

  it('never scrolls the head of its own target off-screen to make room below', () => {
    // A 600px target cannot leave 446px below it AND keep its own top visible,
    // so `bottom` is not offered and the beat stays on the requested side.
    const { placement, scrollTop } = plan({ rect: { top: 336, height: 600 } });
    expect(placement).toBe('top');
    expect(scrollTop).toBe(0); // already as low as scrollTop 0 allows
  });

  it('cannot invent scroll range that does not exist', () => {
    // Short page: nothing to scroll, so both sides are whatever the target
    // already left, and neither holds a 430px tooltip.
    const { placement, scrollTop } = plan({ maxScroll: 0 });
    expect(placement).toBe('top');
    expect(scrollTop).toBe(0);
  });

  it('passes the non-vertical placements through untouched', () => {
    const { placement, scrollTop } = plan({ requested: 'center', scrollTop: 900 });
    expect(placement).toBe('center');
    expect(scrollTop).toBe(900);
  });
});
