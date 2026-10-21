import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}

export default function Modal({ open, onClose, title, description, children, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog box */}
      <div
        className={`relative bg-white dark:bg-dark-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-300 w-full animate-scale-in my-auto max-h-[90vh] flex flex-col overflow-hidden ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-dark-300 shrink-0">
          <div className="pr-2 min-w-0">
            <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
