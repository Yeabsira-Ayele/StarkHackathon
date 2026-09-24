import React from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  details?: Array<{ label: string; value: React.ReactNode }>;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  details = [],
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          {isDestructive ? (
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'accent'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm text-slate-700">
        <p className="text-slate-600 leading-relaxed">{description}</p>

        {details.length > 0 && (
          <div className="bg-slate-50 rounded-lg border border-slate-200/80 p-3.5 divide-y divide-slate-200/60">
            {details.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-2 ${
                  idx === 0 ? 'pt-0' : ''
                } ${idx === details.length - 1 ? 'pb-0' : ''}`}
              >
                <span className="text-xs font-medium text-slate-500">{item.label}</span>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
