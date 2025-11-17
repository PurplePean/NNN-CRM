import React from 'react';

/**
 * LoadingSpinner - Accessible loading indicator
 * Shows a spinner with optional text and size variants
 */
export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  darkMode = true,
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const textClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-300';
  const accentColor = darkMode ? 'border-t-blue-500' : 'border-t-blue-600';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div
        className={`${sizes[size]} ${borderColor} ${accentColor} rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <span className={`text-sm ${textClass}`}>
          {text}
        </span>
      )}
    </div>
  );
}
