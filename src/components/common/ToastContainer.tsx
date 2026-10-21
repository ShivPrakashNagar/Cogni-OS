import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] space-y-2 sm:max-w-sm pointer-events-none" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up text-sm font-medium',
              toast.type === 'success' && 'bg-white dark:bg-dark-100 text-brand-800 dark:text-brand-300 border-brand-200 dark:border-brand-800',
              toast.type === 'error' && 'bg-white dark:bg-dark-100 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
              toast.type === 'info' && 'bg-white dark:bg-dark-100 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
