import React, { useState } from 'react';
import { Calendar, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import PremiumCard from './PremiumCard';
import PremiumButton from './PremiumButton';
import SkeletonLoader from './SkeletonLoader';

const ActivityFeed = ({
  events = [],
  followUps = [],
  notes = [],
  properties = [],
  brokers = [],
  partners = [],
  gatekeepers = [],
  darkMode = true,
  loading = false,
  onItemClick,
}) => {
  const [showCount, setShowCount] = useState(8);

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  // Combine all activities
  const allActivities = [
    ...events.map(e => ({
      type: 'event',
      icon: Calendar,
      iconColor: 'text-blue-500',
      title: e.title,
      description: e.location || e.description || '',
      who: '',
      date: e.date || e.eventDate,
      id: e.id,
      data: e,
    })),
    ...followUps.map(f => ({
      type: 'followup',
      icon: f.status === 'completed' ? CheckCircle : Clock,
      iconColor: f.status === 'completed' ? 'text-green-500' : 'text-orange-500',
      title: f.contactName,
      description: f.notes || `${f.type} scheduled`,
      who: f.contactName,
      date: f.completedAt || f.dueDate,
      id: f.id,
      data: f,
    })),
    ...notes.map(n => ({
      type: 'note',
      icon: FileText,
      iconColor: 'text-purple-500',
      title: 'New Note',
      description: n.content || '',
      who: '',
      date: n.createdAt,
      id: n.id,
      data: n,
    })),
  ];

  // Sort by date (most recent first)
  const sortedActivities = allActivities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, showCount);

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleLoadMore = () => {
    setShowCount(prev => prev + 8);
  };

  if (loading) {
    return <SkeletonLoader variant="activity" darkMode={darkMode} count={8} />;
  }

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-bold uppercase ${textMutedClass} mb-3`}>
        Activity Feed
      </h3>

      {sortedActivities.length === 0 && (
        <PremiumCard darkMode={darkMode} padding="large" elevation="soft">
          <div className="text-center py-8">
            <TrendingUp size={48} className={`mx-auto mb-3 ${textMutedClass} opacity-50`} />
            <p className={`${textSecondaryClass}`}>No activity yet</p>
          </div>
        </PremiumCard>
      )}

      <div className="space-y-2">
        {sortedActivities.map((activity, index) => {
          const IconComponent = activity.icon;

          return (
            <PremiumCard
              key={`${activity.type}-${activity.id}-${index}`}
              darkMode={darkMode}
              padding="default"
              elevation="subtle"
              hoverable
              onClick={() => onItemClick && onItemClick(activity)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}
                `}>
                  <IconComponent size={16} className={activity.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${textClass} text-sm truncate`}>
                        {activity.title}
                      </div>
                    </div>
                    <div className={`text-xs ${textMutedClass} flex-shrink-0`}>
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>

                  {activity.description && (
                    <div
                      className={`text-xs ${textSecondaryClass} leading-relaxed`}
                      title={activity.description}
                    >
                      {truncateText(activity.description, 80)}
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="mt-2">
                    <span className={`
                      text-xs px-2 py-0.5 rounded
                      ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}
                      ${textMutedClass}
                    `}>
                      {activity.type === 'event' ? 'Event' :
                       activity.type === 'followup' ? 'Follow-up' :
                       activity.type === 'note' ? 'Note' : activity.type}
                    </span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          );
        })}
      </div>

      {/* Load more button */}
      {allActivities.length > showCount && (
        <div className="pt-2">
          <PremiumButton
            variant="ghost"
            size="medium"
            onClick={handleLoadMore}
            darkMode={darkMode}
            icon={Plus}
            className="w-full"
          >
            Load More
          </PremiumButton>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
