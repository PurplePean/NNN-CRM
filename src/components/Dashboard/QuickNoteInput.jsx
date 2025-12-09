import React, { useState, useRef, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import PremiumCard from './PremiumCard';
import PremiumButton from './PremiumButton';

const QuickNoteInput = ({
  darkMode = true,
  onSave,
  properties = [],
  brokers = [],
  partners = [],
  gatekeepers = [],
  events = [],
  followUps = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [attachTo, setAttachTo] = useState('');
  const [category, setCategory] = useState('General');
  const textareaRef = useRef(null);

  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const inputClass = darkMode
    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500';

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setNoteContent('');
    setAttachTo('');
    setCategory('General');
  };

  const handleSave = () => {
    if (!noteContent.trim()) return;

    const noteData = {
      content: noteContent,
      category,
      createdAt: new Date().toISOString(),
    };

    // Parse attachTo to determine entity type and ID
    if (attachTo) {
      const [type, id] = attachTo.split('-');
      noteData.entityType = type;
      noteData.entityId = id;
    }

    if (onSave) {
      onSave(noteData);
    }

    // Reset form
    handleCancel();
  };

  const categories = [
    'General',
    'Meeting',
    'Call',
    'Email',
    'Property',
    'Deal',
    'Follow-up',
    'Research',
  ];

  // Build attachment options
  const attachmentOptions = [
    { label: '-- No attachment --', value: '' },
    ...properties.map(p => ({ label: `Property: ${p.name}`, value: `property-${p.id}` })),
    ...brokers.map(b => ({ label: `Broker: ${b.name}`, value: `broker-${b.id}` })),
    ...partners.map(p => ({ label: `Partner: ${p.name}`, value: `partner-${p.id}` })),
    ...gatekeepers.map(g => ({ label: `Gatekeeper: ${g.name}`, value: `gatekeeper-${g.id}` })),
  ];

  if (!isExpanded) {
    // Collapsed state
    return (
      <PremiumCard darkMode={darkMode} padding="default" elevation="soft">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500" size={20} />
          <input
            type="text"
            placeholder="Write a note..."
            onClick={handleExpand}
            readOnly
            className={`
              flex-1 px-4 py-3 rounded-lg border cursor-text
              transition-all duration-250
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${inputClass}
            `}
          />
        </div>
      </PremiumCard>
    );
  }

  // Expanded state
  return (
    <PremiumCard darkMode={darkMode} padding="large" elevation="medium">
      <div
        className="space-y-4"
        style={{
          animation: 'expandHeight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-500" size={24} />
            <h3 className={`text-lg font-bold ${textClass}`}>Quick Note</h3>
          </div>
          <button
            onClick={handleCancel}
            className={`p-1 rounded-lg hover:bg-slate-700 transition ${textSecondaryClass}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Note content */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
            Note Content
          </label>
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Type your note here..."
            rows={4}
            className={`
              w-full px-4 py-3 rounded-lg border resize-none
              transition-all duration-250
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${inputClass}
            `}
          />
        </div>

        {/* Attach to */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
            Attach to (optional)
          </label>
          <select
            value={attachTo}
            onChange={(e) => setAttachTo(e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg border
              transition-all duration-250
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${inputClass}
            `}
          >
            {attachmentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg border
              transition-all duration-250
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${inputClass}
            `}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <PremiumButton
            variant="primary"
            size="medium"
            onClick={handleSave}
            disabled={!noteContent.trim()}
            darkMode={darkMode}
            icon={Save}
            className="flex-1"
          >
            Save Note
          </PremiumButton>
          <PremiumButton
            variant="ghost"
            size="medium"
            onClick={handleCancel}
            darkMode={darkMode}
            icon={X}
          >
            Cancel
          </PremiumButton>
        </div>
      </div>
    </PremiumCard>
  );
};

// Add expand animation
if (typeof document !== 'undefined') {
  const styleId = 'quick-note-expand-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes expandHeight {
        from {
          opacity: 0;
          transform: scaleY(0.95);
        }
        to {
          opacity: 1;
          transform: scaleY(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default QuickNoteInput;
