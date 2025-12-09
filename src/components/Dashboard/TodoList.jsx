import React, { useState } from 'react';
import { CheckCircle, Circle, Calendar, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import PremiumCard from './PremiumCard';
import SkeletonLoader from './SkeletonLoader';

const TodoList = ({
  events = [],
  followUps = [],
  notes = [],
  darkMode = true,
  loading = false,
  onToggleComplete,
  onItemClick,
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  const isToday = (date) => {
    const today = new Date();
    const itemDate = new Date(date);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const itemDate = new Date(date);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return itemDate >= today && itemDate <= weekFromNow;
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filter items for today
  const todayFollowUps = followUps.filter(f => isToday(f.dueDate) && f.status !== 'completed');
  const todayEvents = events.filter(e => isToday(e.date || e.eventDate));

  // Filter items for this week (excluding today)
  const thisWeekFollowUps = followUps.filter(f =>
    isThisWeek(f.dueDate) && !isToday(f.dueDate) && f.status !== 'completed'
  );
  const thisWeekEvents = events.filter(e =>
    isThisWeek(e.date || e.eventDate) && !isToday(e.date || e.eventDate)
  );

  const renderFollowUpItem = (followUp) => {
    const isExpanded = expandedItems.has(`followup-${followUp.id}`);

    return (
      <div
        key={`followup-${followUp.id}`}
        className={`
          p-3 rounded-lg border transition-all duration-250
          ${darkMode
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
            : 'bg-white border-slate-200 hover:bg-slate-50'
          }
        `}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete && onToggleComplete('followup', followUp.id)}
            className="mt-0.5 transition-transform hover:scale-110"
          >
            {followUp.status === 'completed' ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <Circle size={20} className={textSecondaryClass} />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-orange-500 flex-shrink-0" />
                  <span className={`font-semibold ${textClass} truncate`}>
                    {followUp.contactName}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} ${textMutedClass}`}>
                    {followUp.type}
                  </span>
                </div>
                {followUp.notes && !isExpanded && (
                  <p className={`text-sm ${textSecondaryClass} truncate`}>
                    {followUp.notes}
                  </p>
                )}
                {followUp.notes && isExpanded && (
                  <p className={`text-sm ${textSecondaryClass} mt-2`}>
                    {followUp.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs ${textMutedClass}`}>
                  {formatTime(followUp.dueDate)}
                </span>
                {followUp.notes && (
                  <button
                    onClick={() => toggleExpand(`followup-${followUp.id}`)}
                    className={`${textMutedClass} hover:${textSecondaryClass} transition`}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEventItem = (event) => {
    const isExpanded = expandedItems.has(`event-${event.id}`);

    return (
      <div
        key={`event-${event.id}`}
        className={`
          p-3 rounded-lg border transition-all duration-250
          ${darkMode
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
            : 'bg-white border-slate-200 hover:bg-slate-50'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <Calendar size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${textClass} mb-1`}>
                  {event.title}
                </div>
                {event.location && (
                  <p className={`text-sm ${textSecondaryClass} ${isExpanded ? '' : 'truncate'}`}>
                    📍 {event.location}
                  </p>
                )}
                {event.description && isExpanded && (
                  <p className={`text-sm ${textSecondaryClass} mt-2`}>
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs ${textMutedClass}`}>
                  {formatTime(event.date || event.eventDate)}
                </span>
                {(event.location || event.description) && (
                  <button
                    onClick={() => toggleExpand(`event-${event.id}`)}
                    className={`${textMutedClass} hover:${textSecondaryClass} transition`}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <SkeletonLoader variant="todo" darkMode={darkMode} count={5} />;
  }

  const hasAnyItems = todayFollowUps.length > 0 || todayEvents.length > 0 ||
                      thisWeekFollowUps.length > 0 || thisWeekEvents.length > 0;

  return (
    <PremiumCard darkMode={darkMode} padding="large" elevation="soft">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="text-blue-500" size={24} />
        <h2 className={`text-xl font-bold ${textClass}`}>To-Do List</h2>
      </div>

      {!hasAnyItems && (
        <div className="text-center py-12">
          <CheckCircle size={48} className={`mx-auto mb-3 ${textMutedClass} opacity-50`} />
          <p className={`${textSecondaryClass} text-lg`}>
            Nothing due today. Check next week or add a task.
          </p>
        </div>
      )}

      {/* TODAY Section */}
      {(todayFollowUps.length > 0 || todayEvents.length > 0) && (
        <div className="mb-6">
          <h3 className={`text-sm font-bold uppercase mb-3 ${textMutedClass}`}>
            Today
          </h3>
          <div className="space-y-2">
            {todayFollowUps.map(renderFollowUpItem)}
            {todayEvents.map(renderEventItem)}
          </div>
        </div>
      )}

      {/* THIS WEEK Section */}
      {(thisWeekFollowUps.length > 0 || thisWeekEvents.length > 0) && (
        <div>
          <h3 className={`text-sm font-bold uppercase mb-3 ${textMutedClass}`}>
            This Week
          </h3>
          <div className="space-y-2">
            {thisWeekFollowUps.map(renderFollowUpItem)}
            {thisWeekEvents.map(renderEventItem)}
          </div>
        </div>
      )}
    </PremiumCard>
  );
};

export default TodoList;
