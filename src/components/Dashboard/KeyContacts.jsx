import React, { useState } from 'react';
import { User, Phone, Mail, FileText } from 'lucide-react';
import PremiumCard from './PremiumCard';
import SkeletonLoader from './SkeletonLoader';

const KeyContacts = ({
  brokers = [],
  partners = [],
  gatekeepers = [],
  events = [],
  followUps = [],
  notes = [],
  darkMode = true,
  loading = false,
  onContactClick,
}) => {
  const [hoveredContact, setHoveredContact] = useState(null);

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  // Combine all contacts
  const allContacts = [
    ...brokers.map(b => ({ ...b, contactType: 'broker' })),
    ...partners.map(p => ({ ...p, contactType: 'partner' })),
    ...gatekeepers.map(g => ({ ...g, contactType: 'gatekeeper' })),
  ];

  // Get last activity for a contact
  const getLastActivity = (contact) => {
    const contactId = `${contact.contactType}-${contact.id}`;

    // Get all follow-ups for this contact
    const contactFollowUps = followUps.filter(f => f.relatedContact === contactId);

    // Get all events for this contact
    const contactEvents = events.filter(e => {
      const type = contact.contactType === 'partner' ? 'partners' :
                   contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
      return e.taggedContacts?.[type]?.includes(contact.id);
    });

    // Get all notes for this contact
    const contactNotes = notes.filter(n =>
      n.entityType === contact.contactType && n.entityId === contact.id
    );

    // Combine all activities
    const activities = [
      ...contactFollowUps.map(f => ({
        type: 'followup',
        date: f.completedAt || f.dueDate,
        content: f.notes || `${f.type} scheduled`,
      })),
      ...contactEvents.map(e => ({
        type: 'event',
        date: e.date || e.eventDate,
        content: e.title,
      })),
      ...contactNotes.map(n => ({
        type: 'note',
        date: n.createdAt,
        content: n.content,
      })),
    ];

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return activities[0] || null;
  };

  // Sort contacts by last activity
  const sortedContacts = allContacts
    .map(contact => ({
      ...contact,
      lastActivity: getLastActivity(contact),
    }))
    .sort((a, b) => {
      const aDate = a.lastActivity ? new Date(a.lastActivity.date) : new Date(0);
      const bDate = b.lastActivity ? new Date(b.lastActivity.date) : new Date(0);
      return bDate - aDate;
    })
    .slice(0, 6); // Top 6 contacts

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactTypeColor = (type) => {
    switch (type) {
      case 'broker':
        return 'bg-blue-500';
      case 'partner':
        return 'bg-green-500';
      case 'gatekeeper':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getContactTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return <SkeletonLoader variant="contact" darkMode={darkMode} count={6} />;
  }

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-bold uppercase ${textMutedClass} mb-3`}>
        Key Contacts
      </h3>

      {sortedContacts.length === 0 && (
        <PremiumCard darkMode={darkMode} padding="large" elevation="soft">
          <div className="text-center py-8">
            <User size={48} className={`mx-auto mb-3 ${textMutedClass} opacity-50`} />
            <p className={`${textSecondaryClass}`}>No contacts yet</p>
          </div>
        </PremiumCard>
      )}

      {sortedContacts.map(contact => (
        <div
          key={`${contact.contactType}-${contact.id}`}
          onMouseEnter={() => setHoveredContact(contact)}
          onMouseLeave={() => setHoveredContact(null)}
          className="relative"
        >
          <PremiumCard
            darkMode={darkMode}
            padding="default"
            elevation="soft"
            hoverable
            onClick={() => onContactClick && onContactClick(contact)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-white font-bold text-sm flex-shrink-0
                ${getContactTypeColor(contact.contactType)}
              `}>
                {getInitials(contact.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${textClass} truncate mb-1`}>
                  {contact.name}
                </div>
                <div className={`text-xs ${textMutedClass} mb-2`}>
                  {getContactTypeLabel(contact.contactType)}
                </div>

                {/* Last activity */}
                {contact.lastActivity && (
                  <div className="space-y-1">
                    <div className={`text-xs ${textSecondaryClass}`}>
                      {formatTimeAgo(contact.lastActivity.date)}
                    </div>
                    <div className={`text-xs ${textSecondaryClass} truncate`}>
                      {contact.lastActivity.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>

          {/* Hover preview popup */}
          {hoveredContact?.id === contact.id && (
            <div
              className={`
                absolute left-full ml-2 top-0 z-50 w-64
                ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
                border rounded-lg shadow-xl p-4
                animate-fadeIn
              `}
              style={{
                animation: 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Contact details */}
              <div className="mb-3">
                <div className={`font-bold ${textClass} mb-1`}>
                  {contact.name}
                </div>
                <div className={`text-xs ${textMutedClass}`}>
                  {getContactTypeLabel(contact.contactType)}
                </div>
              </div>

              {/* Recent activity summary */}
              <div className="space-y-2 mb-3">
                <div className={`text-xs font-semibold ${textSecondaryClass}`}>
                  Recent Activity
                </div>
                {(() => {
                  const contactId = `${contact.contactType}-${contact.id}`;
                  const recentFollowUps = followUps
                    .filter(f => f.relatedContact === contactId)
                    .slice(0, 3);

                  if (recentFollowUps.length === 0) {
                    return (
                      <div className={`text-xs ${textMutedClass}`}>
                        No recent activity
                      </div>
                    );
                  }

                  return recentFollowUps.map((f, idx) => (
                    <div key={idx} className={`text-xs ${textSecondaryClass}`}>
                      • {f.type} - {formatTimeAgo(f.dueDate)}
                    </div>
                  ));
                })()}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <button
                  className={`
                    flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded
                    text-xs font-semibold transition-all
                    ${darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle call action
                  }}
                >
                  <Phone size={12} />
                  Call
                </button>
                <button
                  className={`
                    flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded
                    text-xs font-semibold transition-all
                    ${darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle email action
                  }}
                >
                  <Mail size={12} />
                  Email
                </button>
                <button
                  className={`
                    flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded
                    text-xs font-semibold transition-all
                    ${darkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle note action
                  }}
                >
                  <FileText size={12} />
                  Note
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Add fade-in animation
if (typeof document !== 'undefined') {
  const styleId = 'key-contacts-fade-in';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default KeyContacts;
