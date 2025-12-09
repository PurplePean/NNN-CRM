import React, { useState } from 'react';
import QuickActionsBar from './QuickActionsBar';
import MainArea from './MainArea';
import RightSidebar from './RightSidebar';

const CommandCenter = ({
  darkMode = true,
  properties = [],
  brokers = [],
  partners = [],
  gatekeepers = [],
  events = [],
  followUps = [],
  notes = [],
  leases = [],
  loading = false,
  // Handlers passed from App.jsx
  onAddProperty,
  onAddContact,
  onAddEvent,
  onAddFollowUp,
  onSaveNote,
  onToggleComplete,
  onContactClick,
  onActivityClick,
  onDayClick,
  onItemClick,
}) => {
  const bgClass = darkMode ? 'bg-slate-900' : 'bg-slate-50';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Quick Actions Bar - Sticky at top */}
      <QuickActionsBar
        darkMode={darkMode}
        onAddProperty={onAddProperty}
        onAddContact={onAddContact}
        onAddEvent={onAddEvent}
        onAddFollowUp={onAddFollowUp}
      />

      {/* Main Content Area */}
      <div className="px-6 py-6">
        <div className="flex gap-6">
          {/* Main Area - 70% */}
          <div className="flex-1 min-w-0" style={{ flex: '0 0 70%' }}>
            <MainArea
              events={events}
              followUps={followUps}
              notes={notes}
              properties={properties}
              brokers={brokers}
              partners={partners}
              gatekeepers={gatekeepers}
              darkMode={darkMode}
              loading={loading}
              onSaveNote={onSaveNote}
              onToggleComplete={onToggleComplete}
              onItemClick={onItemClick}
            />
          </div>

          {/* Right Sidebar - 30% */}
          <div className="flex-1 min-w-0" style={{ flex: '0 0 30%' }}>
            <RightSidebar
              brokers={brokers}
              partners={partners}
              gatekeepers={gatekeepers}
              events={events}
              followUps={followUps}
              notes={notes}
              properties={properties}
              darkMode={darkMode}
              loading={loading}
              onContactClick={onContactClick}
              onActivityClick={onActivityClick}
              onDayClick={onDayClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
