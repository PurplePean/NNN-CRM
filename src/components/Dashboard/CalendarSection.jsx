import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import PremiumCard from './PremiumCard';
import PremiumButton from './PremiumButton';
import SkeletonLoader from './SkeletonLoader';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarSection = ({ events = [], followUps = [], darkMode = true, loading = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.date || e.eventDate);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });

    const dayFollowUps = followUps.filter(f => {
      const dueDate = new Date(f.dueDate);
      const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
      return dueDateStr === dateStr && f.status !== 'completed';
    });

    return { events: dayEvents, followUps: dayFollowUps };
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 p-1" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const { events: dayEvents, followUps: dayFollowUps } = getEventsForDay(day);
      const hasItems = dayEvents.length > 0 || dayFollowUps.length > 0;
      const isTodayDay = isToday(day);
      const isSelected = selectedDay === day;

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(isSelected ? null : day)}
          className={`
            h-20 p-1 rounded-md cursor-pointer
            transition-all duration-250
            ${isTodayDay
              ? darkMode
                ? 'bg-blue-600/20 border-2 border-blue-500'
                : 'bg-blue-100 border-2 border-blue-500'
              : darkMode
                ? 'bg-slate-700/30 hover:bg-slate-700/50'
                : 'bg-white hover:bg-slate-50'
            }
            ${isSelected
              ? darkMode
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'ring-2 ring-blue-500 shadow-lg'
              : ''
            }
          `}
        >
          <div className="h-full flex flex-col">
            <div className={`text-sm font-semibold mb-1 ${isTodayDay ? 'text-blue-400' : textClass}`}>
              {day}
            </div>
            <div className="flex-1 space-y-0.5 overflow-hidden">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div
                  key={`event-${event.id}-${idx}`}
                  className="text-xs px-1 py-0.5 rounded bg-blue-500/70 text-white truncate"
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayFollowUps.slice(0, 2 - dayEvents.slice(0, 2).length).map((followUp, idx) => (
                <div
                  key={`followup-${followUp.id}-${idx}`}
                  className="text-xs px-1 py-0.5 rounded bg-green-500/70 text-white truncate"
                  title={followUp.contactName}
                >
                  {followUp.contactName}
                </div>
              ))}
              {(dayEvents.length + dayFollowUps.length > 2) && (
                <div className={`text-xs ${textMutedClass}`}>
                  +{dayEvents.length + dayFollowUps.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return <SkeletonLoader variant="calendar" darkMode={darkMode} />;
  }

  return (
    <PremiumCard darkMode={darkMode} padding="large" elevation="soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-500" size={24} />
          <h2 className={`text-xl font-bold ${textClass}`}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>
        <div className="flex gap-2">
          <PremiumButton
            variant="ghost"
            size="small"
            onClick={handlePrevMonth}
            darkMode={darkMode}
            icon={ChevronLeft}
          />
          <PremiumButton
            variant="ghost"
            size="small"
            onClick={handleNextMonth}
            darkMode={darkMode}
            icon={ChevronRight}
          />
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(day => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${textSecondaryClass}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-3 ${textClass}`}>
            {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
          </h3>
          {(() => {
            const { events: dayEvents, followUps: dayFollowUps } = getEventsForDay(selectedDay);

            if (dayEvents.length === 0 && dayFollowUps.length === 0) {
              return (
                <p className={`${textSecondaryClass} text-sm`}>
                  No events or follow-ups scheduled for this day.
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {dayEvents.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 ${textSecondaryClass}`}>
                      Events ({dayEvents.length})
                    </h4>
                    <div className="space-y-2">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}
                        >
                          <div className={`font-semibold ${textClass} mb-1`}>{event.title}</div>
                          {event.location && (
                            <div className={`text-sm ${textSecondaryClass}`}>📍 {event.location}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dayFollowUps.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-semibold mb-2 ${textSecondaryClass}`}>
                      Follow-ups ({dayFollowUps.length})
                    </h4>
                    <div className="space-y-2">
                      {dayFollowUps.map(followUp => (
                        <div
                          key={followUp.id}
                          className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}
                        >
                          <div className={`font-semibold ${textClass} mb-1`}>{followUp.contactName}</div>
                          {followUp.notes && (
                            <div className={`text-sm ${textSecondaryClass}`}>{followUp.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </PremiumCard>
  );
};

export default CalendarSection;
