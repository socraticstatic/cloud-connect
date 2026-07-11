import { useState, useEffect } from 'react';

export function useTour(tourKey: string) {
  const storageKey = `tour-${tourKey}-completed`;
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === 'true';
    setHasCompleted(completed);
  }, [storageKey]);

  const startTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const completeTour = () => {
    localStorage.setItem(storageKey, 'true');
    setHasCompleted(true);
    setIsOpen(false);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setHasCompleted(false);
  };

  return {
    isOpen,
    hasCompleted,
    startTour,
    closeTour,
    completeTour,
    resetTour
  };
}
