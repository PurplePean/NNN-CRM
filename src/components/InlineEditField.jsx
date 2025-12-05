import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X } from 'lucide-react';

/**
 * InlineEditField - A reusable component for inline field editing
 *
 * @param {string} value - The current value to display/edit
 * @param {function} onSave - Callback when user saves (receives new value)
 * @param {string} label - Field label
 * @param {string} type - Input type (text, number, url, email, tel)
 * @param {boolean} darkMode - Dark mode flag
 * @param {string} displayFormat - Optional function to format display value
 * @param {string} placeholder - Placeholder text for empty values
 * @param {boolean} multiline - Use textarea instead of input
 * @param {string} className - Additional CSS classes
 */
const InlineEditField = ({
  value,
  onSave,
  label,
  type = 'text',
  darkMode = false,
  displayFormat = null,
  placeholder = 'Not set',
  multiline = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef(null);

  // Update editValue when prop value changes
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if (type === 'text' || type === 'url' || type === 'email') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (editValue === value) {
      // No changes, just exit edit mode
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);

      // Show success state briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    } catch (error) {
      console.error('Failed to save:', error);
      // Reset to original value on error
      setEditValue(value || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = displayFormat ? displayFormat(value) : (value || placeholder);

  const textClass = darkMode ? 'text-slate-200' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const bgClass = darkMode ? 'bg-slate-700' : 'bg-white';
  const borderClass = darkMode ? 'border-slate-600' : 'border-slate-300';
  const hoverBgClass = darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const focusBorderClass = darkMode ? 'focus:border-blue-400' : 'focus:border-blue-500';
  const successBgClass = darkMode ? 'bg-green-900/30' : 'bg-green-50';

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';

    return (
      <div className={className}>
        {label && (
          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>
            {label}
          </div>
        )}
        <div className="flex items-start gap-2">
          <InputComponent
            ref={inputRef}
            type={multiline ? undefined : type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={isSaving}
            rows={multiline ? 3 : undefined}
            className={`
              flex-1 px-3 py-2 rounded-md border ${borderClass} ${bgClass} ${textClass}
              ${focusBorderClass} focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm font-medium
              ${multiline ? 'resize-y' : ''}
            `}
          />
          <div className="flex gap-1 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors"
              title="Save (Enter)"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className={`p-1.5 rounded-md ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-300 hover:bg-slate-400'} text-white disabled:opacity-50 transition-colors`}
              title="Cancel (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we should use minimal styling (for headers/large text)
  const isMinimalLabel = label === '';

  return (
    <div className={className}>
      {label && (
        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>
          {label}
        </div>
      )}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsEditing(true)}
        className={`
          group cursor-pointer rounded-md transition-all
          ${isMinimalLabel ? 'px-2 py-1' : 'px-3 py-2'}
          ${hoverBgClass}
          ${showSuccess ? successBgClass : ''}
          ${value ? '' : 'italic'}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className={`
            ${isMinimalLabel ? 'text-2xl font-bold' : 'text-sm font-medium'}
            ${textClass}
            ${!value ? textSecondaryClass : ''}
          `}>
            {displayValue}
          </div>
          <Edit2
            size={14}
            className={`
              flex-shrink-0 transition-opacity
              ${isHovered ? 'opacity-100' : 'opacity-0'}
              ${textSecondaryClass}
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default InlineEditField;
