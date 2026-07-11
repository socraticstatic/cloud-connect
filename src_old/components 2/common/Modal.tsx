import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={`relative w-full max-h-[calc(100vh-4rem)] flex flex-col px-4 pt-5 pb-4 text-left transition-all transform bg-fw-base rounded-lg shadow-xl sm:p-6 ${sizeClasses[size]}`}>
          {/* Close button */}
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
            <Button
              onClick={onClose}
              variant="outline"
              className="!p-1 border-0 text-fw-bodyLight hover:text-fw-body"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Title */}
          {title && (
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-lg font-medium text-fw-heading">{title}</h3>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}