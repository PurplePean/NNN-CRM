import React from 'react';
import { Building2, Users, Calendar, Bell } from 'lucide-react';
import PremiumButton from './PremiumButton';

const QuickActionsBar = ({
  darkMode = true,
  onAddProperty,
  onAddContact,
  onAddEvent,
  onAddFollowUp,
}) => {
  return (
    <div
      className={`
        sticky top-0 z-40
        ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}
        backdrop-blur-md
        border-b
        px-6 py-4
      `}
      style={{
        boxShadow: darkMode
          ? '0 4px 12px rgba(0, 0, 0, 0.15)'
          : '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <PremiumButton
          variant="primary"
          size="medium"
          icon={Building2}
          onClick={onAddProperty}
          darkMode={darkMode}
        >
          Property
        </PremiumButton>

        <PremiumButton
          variant="success"
          size="medium"
          icon={Users}
          onClick={onAddContact}
          darkMode={darkMode}
        >
          Contact
        </PremiumButton>

        <PremiumButton
          variant="primary"
          size="medium"
          icon={Calendar}
          onClick={onAddEvent}
          darkMode={darkMode}
        >
          Event
        </PremiumButton>

        <PremiumButton
          variant="primary"
          size="medium"
          icon={Bell}
          onClick={onAddFollowUp}
          darkMode={darkMode}
        >
          Follow-up
        </PremiumButton>
      </div>
    </div>
  );
};

export default QuickActionsBar;
