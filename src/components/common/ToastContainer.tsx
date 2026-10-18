import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up text-sm font-medium',
              toast.type === 'success' && 'bg-brand-50 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border-brand-200 dark:border-brand-800',
              toast.type === 'error' && 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
              toast.type === 'info' && 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            )}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
