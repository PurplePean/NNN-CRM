import React from 'react';
import CalendarSection from './CalendarSection';
import QuickNoteInput from './QuickNoteInput';
import TodoList from './TodoList';

const MainArea = ({
  events = [],
  followUps = [],
  notes = [],
  properties = [],
  brokers = [],
  partners = [],
  gatekeepers = [],
  darkMode = true,
  loading = false,
  onSaveNote,
  onToggleComplete,
  onItemClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <CalendarSection
        events={events}
        followUps={followUps}
        darkMode={darkMode}
        loading={loading}
      />

      {/* Quick Note Input */}
      <QuickNoteInput
        darkMode={darkMode}
        onSave={onSaveNote}
        properties={properties}
        brokers={brokers}
        partners={partners}
        gatekeepers={gatekeepers}
        events={events}
        followUps={followUps}
      />

      {/* Todo List */}
      <TodoList
        events={events}
        followUps={followUps}
        notes={notes}
        darkMode={darkMode}
        loading={loading}
        onToggleComplete={onToggleComplete}
        onItemClick={onItemClick}
      />
    </div>
  );
};

export default MainArea;
