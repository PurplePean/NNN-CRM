import React from 'react';

/**
 * EmptyState - Accessible empty state component
 * Shows when lists/tables have no data with optional CTA
 */
export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  darkMode = true,
  className = ''
}) {
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const iconClass = darkMode ? 'text-slate-600' : 'text-slate-400';

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className={`${iconClass} mb-4`} aria-hidden="true">
          <Icon size={48} />
        </div>
      )}

      {title && (
        <h3 className={`text-lg font-semibold ${textClass} mb-2`}>
          {title}
        </h3>
      )}

      {message && (
        <p className={`${textSecondaryClass} max-w-md mb-6`}>
          {message}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
