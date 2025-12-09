import React from 'react';

const SkeletonLoader = ({ variant = 'default', darkMode = true, count = 1 }) => {
  const shimmerClass = darkMode
    ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700'
    : 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200';

  const variants = {
    // Default rectangular skeleton
    default: (
      <div className={`h-16 rounded-lg ${shimmerClass} animate-pulse bg-[length:200%_100%]`}
           style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
    ),

    // Contact card skeleton
    contact: (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-32 rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
            <div className={`h-3 w-20 rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    ),

    // Activity feed item skeleton
    activity: (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className="flex-1 space-y-2">
            <div className={`h-3 w-full rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
            <div className={`h-3 w-3/4 rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    ),

    // Todo item skeleton
    todo: (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-full rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
            <div className={`h-3 w-24 rounded ${shimmerClass} animate-pulse`}
                 style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    ),

    // Calendar skeleton
    calendar: (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="space-y-4">
          <div className={`h-8 w-48 rounded ${shimmerClass} animate-pulse mx-auto`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className={`h-12 rounded ${shimmerClass} animate-pulse`}
                   style={{ animation: 'shimmer 2s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        </div>
      </div>
    ),

    // Text line skeleton
    text: (
      <div className={`h-4 rounded ${shimmerClass} animate-pulse`}
           style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
    ),

    // Card skeleton
    card: (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="space-y-3">
          <div className={`h-6 w-40 rounded ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className={`h-4 w-full rounded ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          <div className={`h-4 w-5/6 rounded ${shimmerClass} animate-pulse`}
               style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
        </div>
      </div>
    ),
  };

  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(
      <React.Fragment key={i}>
        {variants[variant] || variants.default}
      </React.Fragment>
    );
  }

  return <div className="space-y-3">{items}</div>;
};

// Add shimmer animation to global styles
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Inject shimmer animation if not already present
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-loader-shimmer';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
  }
}

export default SkeletonLoader;
