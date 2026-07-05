import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-pop dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl border border-line bg-ivory p-6 shadow-2xl animate-rise sm:rounded-3xl dark:border-line-dark dark:bg-bg-dark">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
