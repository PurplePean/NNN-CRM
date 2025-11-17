import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 * Prevents entire app from crashing on component errors
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Try to read darkMode from localStorage, default to true
      let darkMode = true;
      try {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
          darkMode = JSON.parse(savedDarkMode);
        }
      } catch (e) {
        // Ignore errors reading from localStorage
      }
      const bgClass = darkMode ? 'bg-slate-900' : 'bg-slate-50';
      const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white';
      const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
      const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
      const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';

      return (
        <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
          <div className={`max-w-2xl w-full ${cardBgClass} rounded-lg shadow-xl border ${borderClass} p-8`}>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1">
                <h1 className={`text-2xl font-bold ${textClass} mb-2`}>
                  Something went wrong
                </h1>
                <p className={`${textSecondaryClass}`}>
                  An unexpected error occurred. Please try refreshing the page.
                </p>
              </div>
            </div>

            {this.state.error && (
              <details className={`${textSecondaryClass} text-sm mb-6`}>
                <summary className="cursor-pointer hover:text-slate-300 mb-2">
                  Error details
                </summary>
                <pre className={`mt-2 p-4 bg-slate-900 rounded overflow-auto text-xs`}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className={`px-4 py-2 rounded-lg border ${borderClass} ${textClass} hover:bg-opacity-10 hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
