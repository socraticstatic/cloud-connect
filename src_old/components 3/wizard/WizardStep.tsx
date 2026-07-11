import { Check } from 'lucide-react';

interface WizardStepProps {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step number */
  number: number;
  /** Whether this step is active */
  isActive: boolean;
  /** Whether this step is completed */
  isCompleted: boolean;
  /** Whether this is the last step */
  isLast?: boolean;
}

/**
 * Component for displaying individual wizard steps
 */
export function WizardStep({
  title,
  description,
  number,
  isActive,
  isCompleted,
  isLast = false,
}: WizardStepProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center">
        <div className={`
          relative flex items-center justify-center w-8 h-8 rounded-full
          transition-colors duration-300 ease-in-out
          ${isActive || isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
        `}>
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <span>{number}</span>
          )}
        </div>
        {!isLast && (
          <div className="flex-1 h-0.5 mx-2">
            <div className={`
              h-full origin-left
              transition-all duration-500 ease-in-out
              ${isCompleted ? 'bg-blue-600 scale-x-100' : 'bg-gray-200 scale-x-0'}
            `} />
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{title}</p>
        <p className="text-xs text-gray-500 mt-1 whitespace-normal">{description}</p>
      </div>
    </div>
  );
}