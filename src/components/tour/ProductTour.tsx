import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, MousePointer } from 'lucide-react';
import { Button } from '../common/Button';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
  scrollIntoView?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  storageKey?: string;
}

export function ProductTour({ steps, isOpen, onClose, onComplete, storageKey = 'product-tour-completed' }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (!isOpen || !step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(step.targetSelector!);
      if (element) {
        // Scroll element into view if needed
        if (step.scrollIntoView !== false) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Small delay to allow scrolling to complete
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);

          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const padding = step.highlightPadding || 8;

            let top = 0;
            let left = 0;

            switch (step.placement || 'bottom') {
              case 'top':
                top = rect.top - tooltipRect.height - padding - 16;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
              case 'bottom':
                top = rect.bottom + padding + 16;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
              case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - padding - 16;
                break;
              case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + padding + 16;
                break;
              case 'center':
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                break;
            }

            // Ensure tooltip stays on screen
            left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));
            top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16));

            setTooltipPosition({ top, left });
          }
        }, step.scrollIntoView !== false ? 300 : 0);
      }
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    const mutationObserver = new MutationObserver(updatePosition);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        resizeObserver.observe(element);
        mutationObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isOpen, step, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {targetRect && step.targetSelector ? (
        <>
          {/* Dark overlay with cutout */}
          <div
            className="absolute rounded-lg animate-in fade-in zoom-in-95 duration-300"
            style={{
              top: targetRect.top - (step.highlightPadding || 8),
              left: targetRect.left - (step.highlightPadding || 8),
              width: targetRect.width + (step.highlightPadding || 8) * 2,
              height: targetRect.height + (step.highlightPadding || 8) * 2,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none',
              zIndex: 10000
            }}
          />

          {/* Pulsing border */}
          <div
            className="absolute animate-pulse"
            style={{
              top: targetRect.top - (step.highlightPadding || 8) - 3,
              left: targetRect.left - (step.highlightPadding || 8) - 3,
              width: targetRect.width + (step.highlightPadding || 8) * 2 + 6,
              height: targetRect.height + (step.highlightPadding || 8) * 2 + 6,
              border: '3px solid rgba(59, 130, 246, 1)',
              borderRadius: '0.875rem',
              pointerEvents: 'none',
              zIndex: 10001
            }}
          />

          {/* Corner accents for better visual focus */}
          <div
            className="absolute"
            style={{
              top: targetRect.top - (step.highlightPadding || 8) - 8,
              left: targetRect.left - (step.highlightPadding || 8) - 8,
              width: targetRect.width + (step.highlightPadding || 8) * 2 + 16,
              height: targetRect.height + (step.highlightPadding || 8) * 2 + 16,
              pointerEvents: 'none',
              zIndex: 10001
            }}
          >
            {/* Top-left corner */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-fw-active rounded-tl-lg" />
            {/* Top-right corner */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-fw-active rounded-tr-lg" />
            {/* Bottom-left corner */}
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-fw-active rounded-bl-lg" />
            {/* Bottom-right corner */}
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-fw-active rounded-br-lg" />
          </div>

          {/* Animated pointer based on tooltip placement */}
          {step.placement && step.placement !== 'center' && (
            <div
              className="absolute animate-bounce"
              style={{
                ...(step.placement === 'top' && {
                  top: targetRect.top - (step.highlightPadding || 8) - 40,
                  left: targetRect.left + targetRect.width / 2 - 12,
                }),
                ...(step.placement === 'bottom' && {
                  top: targetRect.bottom + (step.highlightPadding || 8) + 16,
                  left: targetRect.left + targetRect.width / 2 - 12,
                }),
                ...(step.placement === 'left' && {
                  top: targetRect.top + targetRect.height / 2 - 12,
                  left: targetRect.left - (step.highlightPadding || 8) - 40,
                }),
                ...(step.placement === 'right' && {
                  top: targetRect.top + targetRect.height / 2 - 12,
                  left: targetRect.right + (step.highlightPadding || 8) + 16,
                }),
                pointerEvents: 'none',
                zIndex: 10001
              }}
            >
              <MousePointer className="w-6 h-6 text-fw-active drop-shadow-lg" />
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-black bg-opacity-80 animate-in fade-in duration-300" />
      )}

      <div
        ref={tooltipRef}
        className="absolute bg-fw-base rounded-2xl shadow-2xl border border-fw-secondary overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          maxWidth: '420px',
          width: step.placement === 'center' ? '420px' : 'auto',
          zIndex: 10002
        }}
      >
        <div className="bg-gradient-to-r from-[#0057b8] to-fw-cobalt-700 px-6 py-4 text-white">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-figma-lg font-bold tracking-[-0.03em]">{step.title}</h3>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Close tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-figma-sm text-white/80">
            <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
            <div className="flex-1 h-1.5 bg-fw-cobalt-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-figma-base font-medium text-fw-body leading-relaxed mb-6">
            {step.description}
          </p>

          {step.action && (
            <button
              onClick={step.action.onClick}
              className="w-full mb-4 px-4 py-2.5 bg-fw-accent hover:bg-fw-accent border-2 border-fw-active text-fw-link font-medium rounded-full transition-all duration-200"
            >
              {step.action.label}
            </button>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-figma-base text-fw-bodyLight hover:text-fw-heading font-medium transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="!px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="!px-4 bg-fw-active hover:bg-fw-linkHover"
              >
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
