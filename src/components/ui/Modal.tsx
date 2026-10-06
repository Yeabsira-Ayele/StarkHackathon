import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <div
          className={`relative transform overflow-hidden rounded-2xl bg-surface text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthStyles[maxWidth]} border border-border z-10`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || subtitle) && (
            <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
              <div>
                {title && (
                  <h3 className="text-lg font-bold text-primary tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-zinc-400 hover:text-primary rounded-lg p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="p-6">{children}</div>

          {footer && (
            <div className="bg-zinc-50/80 dark:bg-zinc-900/60 px-6 py-4 border-t border-border flex flex-wrap items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
