import React from 'react';
import KeyContacts from './KeyContacts';
import ActivityFeed from './ActivityFeed';
import Next7DaysPreview from './Next7DaysPreview';

const RightSidebar = ({
  brokers = [],
  partners = [],
  gatekeepers = [],
  events = [],
  followUps = [],
  notes = [],
  properties = [],
  darkMode = true,
  loading = false,
  onContactClick,
  onActivityClick,
  onDayClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Key Contacts */}
      <KeyContacts
        brokers={brokers}
        partners={partners}
        gatekeepers={gatekeepers}
        events={events}
        followUps={followUps}
        notes={notes}
        darkMode={darkMode}
        loading={loading}
        onContactClick={onContactClick}
      />

      {/* Activity Feed */}
      <ActivityFeed
        events={events}
        followUps={followUps}
        notes={notes}
        properties={properties}
        brokers={brokers}
        partners={partners}
        gatekeepers={gatekeepers}
        darkMode={darkMode}
        loading={loading}
        onItemClick={onActivityClick}
      />

      {/* Next 7 Days Preview */}
      <Next7DaysPreview
        events={events}
        followUps={followUps}
        darkMode={darkMode}
        loading={loading}
        onDayClick={onDayClick}
      />
    </div>
  );
};

export default RightSidebar;
