import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog - Accessible confirmation modal with keyboard support
 * Replaces window.confirm() with a branded, accessible alternative
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' or 'warning'
  darkMode = true
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Focus management - focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard support - ESC to close, Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap - keep focus within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    dialog.addEventListener('keydown', handleTabKey);
    return () => dialog.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const bgClass = darkMode ? 'bg-slate-800' : 'bg-white';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';

  const variantColors = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    }
  };

  const colors = variantColors[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        ref={dialogRef}
        className={`relative w-full max-w-md ${bgClass} rounded-lg shadow-xl border ${borderClass} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${textSecondaryClass} hover:${textClass} transition-colors`}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 ${colors.icon}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h2
              id="confirm-dialog-title"
              className={`text-lg font-semibold ${textClass}`}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          className={`${textSecondaryClass} mb-6 pl-10`}
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderClass} ${textClass} hover:bg-opacity-10 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500`}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white ${colors.button} transition-colors focus:outline-none focus:ring-2`}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
