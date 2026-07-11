import { ReactNode } from 'react';
import { WizardStep } from './WizardStep';

interface Phase {
  title: string;
  description: string;
}

interface PhaseIndicatorProps {
  phases: Phase[];
  currentPhase: number;
  className?: string;
}

export function PhaseIndicator({ phases, currentPhase, className = '' }: PhaseIndicatorProps) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      {phases.map((phase, index) => (
        <WizardStep
          key={index}
          title={phase.title}
          description={phase.description}
          number={index + 1}
          isActive={index === currentPhase}
          isCompleted={index < currentPhase}
          isLast={index === phases.length - 1}
        />
      ))}
    </div>
  );
}