import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { VISUAL_ASSETS } from '../../assets/visualAssets';

interface AvatarImageProps {
  photoKey: string;
  name: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  photoKey,
  name,
  className = 'w-10 h-10 rounded-full',
}) => {
  const [imgError, setImgError] = useState(false);

  const src =
    photoKey === 'sarah'
      ? VISUAL_ASSETS.avatarSarahWilson
      : photoKey === 'emma'
      ? VISUAL_ASSETS.avatarEmmaChild
      : photoKey === 'adam'
      ? VISUAL_ASSETS.avatarAdamChild
      : photoKey.startsWith('http') || photoKey.startsWith('data:') || photoKey.startsWith('/')
      ? photoKey
      : VISUAL_ASSETS.avatarSarahWilson;

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (imgError) {
    return (
      <div
        className={`${className} bg-[#E4E9E1] text-[#1E3F2B] flex items-center justify-center font-semibold text-sm select-none shrink-0`}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${className} object-cover shrink-0`}
    />
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  darkMode?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  darkMode = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border shadow-xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-[#18231D] border-[#293830] text-[#EDF2EE]'
            : 'bg-[#FDFCFB] border-[#E6E1D6] text-[#1F2421]'
        }`}
      >
        <div
          className={`flex items-start justify-between px-6 py-4 border-b ${
            darkMode ? 'border-[#293830]' : 'border-[#EDE9DF]'
          }`}
        >
          <div>
            <h2
              id="modal-title"
              className="font-serif-display text-2xl font-semibold tracking-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  darkMode ? 'text-[#96A79C]' : 'text-[#6E7671]'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode
                ? 'text-[#96A79C] hover:bg-[#23322A] hover:text-white'
                : 'text-[#6E7671] hover:bg-[#F2EFE9] hover:text-[#1F2421]'
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  darkMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="max-w-md"
      darkMode={darkMode}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FDECEC] text-[#B84A4A] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p
            className={`text-sm leading-relaxed pt-1 ${
              darkMode ? 'text-[#C4D1C9]' : 'text-[#4B534E]'
            }`}
          >
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
              darkMode
                ? 'border-[#2E4036] text-[#C4D1C9] hover:bg-[#223028]'
                : 'border-[#E2DDD2] text-[#4B534E] hover:bg-[#F2EFE9]'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#B84A4A] text-white hover:bg-[#9F3C3C] transition-colors whitespace-nowrap"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  darkMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
  darkMode = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-8 text-center flex flex-col items-center justify-center ${
        darkMode
          ? 'bg-[#18231D]/60 border-[#293830]'
          : 'bg-[#FAF8F4] border-[#EAE5DC]'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          darkMode
            ? 'bg-[#23352B] text-[#8FBF9F]'
            : 'bg-[#E6ECE4] text-[#234732]'
        }`}
      >
        {icon || <Sparkles className="w-5 h-5" />}
      </div>
      <h3 className="font-serif-display text-xl font-semibold">{title}</h3>
      <p
        className={`text-xs mt-1 max-w-sm ${
          darkMode ? 'text-[#96A79C]' : 'text-[#6E7671]'
        }`}
      >
        {subtitle}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727] transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1F3A2B] text-[#F7F5F0] shadow-lg border border-[#345943] text-xs font-medium animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-[#8BD4A4] shrink-0" />
          <span className="flex-1">{t.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-[#A8C3B1] hover:text-white p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC<{ darkMode?: boolean }> = ({
  darkMode = false,
}) => {
  const pulseBg = darkMode ? 'bg-[#223028]' : 'bg-[#EAE5DC]';
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className={`h-28 rounded-2xl ${pulseBg}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-28 rounded-2xl ${pulseBg}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`h-96 rounded-2xl ${pulseBg}`} />
        <div className={`h-96 rounded-2xl ${pulseBg}`} />
        <div className={`h-96 rounded-2xl ${pulseBg}`} />
      </div>
    </div>
  );
};
