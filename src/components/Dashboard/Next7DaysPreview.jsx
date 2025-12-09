import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import PremiumCard from './PremiumCard';
import SkeletonLoader from './SkeletonLoader';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Next7DaysPreview = ({
  events = [],
  followUps = [],
  darkMode = true,
  loading = false,
  onDayClick,
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  // Get next 7 days starting from today
  const getNext7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const getItemsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];

    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.date || e.eventDate);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === dateStr;
    });

    const dayFollowUps = followUps.filter(f => {
      const dueDate = new Date(f.dueDate);
      const dueDateStr = dueDate.toISOString().split('T')[0];
      return dueDateStr === dateStr && f.status !== 'completed';
    });

    return { events: dayEvents, followUps: dayFollowUps };
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getIntensityColor = (count) => {
    if (count === 0) {
      return darkMode ? 'bg-slate-700/30' : 'bg-slate-100';
    }
    if (count <= 2) {
      return darkMode ? 'bg-blue-500/30' : 'bg-blue-200';
    }
    if (count <= 4) {
      return darkMode ? 'bg-blue-500/60' : 'bg-blue-400';
    }
    return darkMode ? 'bg-blue-500/90' : 'bg-blue-600';
  };

  const next7Days = getNext7Days();

  if (loading) {
    return <SkeletonLoader variant="card" darkMode={darkMode} />;
  }

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-bold uppercase ${textMutedClass} mb-3`}>
        Next 7 Days
      </h3>

      <PremiumCard darkMode={darkMode} padding="default" elevation="soft">
        <div className="grid grid-cols-7 gap-2">
          {next7Days.map((date, index) => {
            const { events: dayEvents, followUps: dayFollowUps } = getItemsForDay(date);
            const totalCount = dayEvents.length + dayFollowUps.length;
            const isTodayDay = isToday(date);

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => onDayClick && onDayClick(date)}
                className="relative"
              >
                <div
                  className={`
                    p-2 rounded-lg text-center cursor-pointer
                    transition-all duration-250
                    ${getIntensityColor(totalCount)}
                    ${isTodayDay
                      ? 'ring-2 ring-blue-500'
                      : ''
                    }
                    ${hoveredDay === index
                      ? 'transform scale-105 shadow-lg'
                      : ''
                    }
                  `}
                >
                  <div className={`text-xs font-semibold mb-1 ${isTodayDay ? 'text-blue-400' : textSecondaryClass}`}>
                    {DAY_NAMES[date.getDay()]}
                  </div>
                  <div className={`text-lg font-bold ${isTodayDay ? 'text-blue-400' : textClass}`}>
                    {date.getDate()}
                  </div>
                  {totalCount > 0 && (
                    <div className={`text-xs mt-1 ${textMutedClass}`}>
                      {totalCount}
                    </div>
                  )}
                </div>

                {/* Tooltip on hover */}
                {hoveredDay === index && totalCount > 0 && (
                  <div
                    className={`
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50
                      ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
                      border rounded-lg shadow-xl p-3 min-w-[150px]
                      animate-fadeIn
                    `}
                    style={{
                      animation: 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div className={`font-semibold ${textClass} text-sm mb-2`}>
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.length > 0 && (
                        <div className={`text-xs ${textSecondaryClass}`}>
                          <span className="font-semibold">{dayEvents.length}</span> event{dayEvents.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {dayFollowUps.length > 0 && (
                        <div className={`text-xs ${textSecondaryClass}`}>
                          <span className="font-semibold">{dayFollowUps.length}</span> follow-up{dayFollowUps.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Arrow pointer */}
                    <div
                      className={`
                        absolute top-full left-1/2 transform -translate-x-1/2
                        w-0 h-0
                        border-l-4 border-r-4 border-t-4
                        border-l-transparent border-r-transparent
                        ${darkMode ? 'border-t-slate-800' : 'border-t-white'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </div>
  );
};

// Add fade-in animation (reuse if already defined)
if (typeof document !== 'undefined') {
  const styleId = 'next-7-days-fade-in';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default Next7DaysPreview;
