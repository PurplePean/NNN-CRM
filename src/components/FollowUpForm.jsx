import React, { useState, useRef, useEffect } from 'react';
import { X, Search, User, Building2, Users, ChevronDown } from 'lucide-react';
import CustomSelect from './CustomSelect';

/**
 * FollowUpForm Component
 *
 * A modern, redesigned follow-up form with smart contact selector
 *
 * Features:
 * ✅ Smart contact selector with autocomplete
 * ✅ Select existing contacts (brokers, partners, gatekeepers)
 * ✅ Manual text entry as fallback
 * ✅ Form validation
 * ✅ Loading states
 * ✅ Error handling
 * ✅ Success feedback
 * ✅ Responsive design
 * ✅ Dark mode support
 */
const FollowUpForm = ({
  contacts = [],
  onSave,
  onCancel,
  initialData = {},
  darkMode = false,
  isEditing = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    contactName: initialData.contactName || '',
    contactId: initialData.contactId || null,
    contactType: initialData.contactType || null,
    type: initialData.type || 'Call',
    dueDate: initialData.dueDate || '',
    priority: initialData.priority || 'Medium',
    notes: initialData.notes || ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialData.contactName || '');
  const [isManualEntry, setIsManualEntry] = useState(!initialData.contactId);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = contact.name.toLowerCase().includes(searchLower);
    const typeMatch = contact.type.toLowerCase().includes(searchLower);
    const companyMatch = contact.company?.toLowerCase().includes(searchLower);
    return nameMatch || typeMatch || companyMatch;
  });

  // Group contacts by type
  const groupedContacts = {
    broker: filteredContacts.filter(c => c.type === 'broker'),
    partner: filteredContacts.filter(c => c.type === 'partner'),
    gatekeeper: filteredContacts.filter(c => c.type === 'gatekeeper')
  };

  // Get icon for contact type
  const getContactIcon = (type) => {
    switch (type) {
      case 'broker':
        return <Building2 size={16} className="text-blue-500" />;
      case 'partner':
        return <Users size={16} className="text-green-500" />;
      case 'gatekeeper':
        return <User size={16} className="text-purple-500" />;
      default:
        return <User size={16} className="text-gray-500" />;
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    setFormData({
      ...formData,
      contactName: contact.name,
      contactId: contact.id,
      contactType: contact.type
    });
    setSearchTerm(`${contact.name} (${contact.typeLabel})`);
    setIsManualEntry(false);
    setIsDropdownOpen(false);
    setErrors({ ...errors, contactName: null });
  };

  // Handle manual text entry
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData({
      ...formData,
      contactName: value,
      contactId: null,
      contactType: 'manual'
    });
    setIsManualEntry(true);
    setIsDropdownOpen(true);
    setErrors({ ...errors, contactName: null });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactName || formData.contactName.trim() === '') {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Follow-up type is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      // Form will be cleared by parent component
    } catch (error) {
      console.error('Error saving follow-up:', error);
      setErrors({ submit: 'Failed to save follow-up. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme classes
  const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const inputBgClass = darkMode ? 'bg-slate-700' : 'bg-white';
  const inputBorderClass = darkMode ? 'border-slate-600' : 'border-slate-300';
  const inputTextClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const hoverBgClass = darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100';
  const dropdownBgClass = darkMode ? 'bg-slate-700' : 'bg-white';

  return (
    <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-bold ${textClass}`}>
          {isEditing ? 'Edit Follow-up' : 'New Follow-up'}
        </h3>
        <button
          onClick={onCancel}
          className={`p-2 rounded-lg ${hoverBgClass} transition`}
          aria-label="Close"
        >
          <X size={20} className={textSecondaryClass} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Smart Contact Selector */}
          <div className="relative" ref={dropdownRef}>
            <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
              Contact <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search size={18} className={textSecondaryClass} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search or enter contact name..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                  errors.contactName ? 'border-red-500' : inputBorderClass
                } ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={18} className={textSecondaryClass} />
              </div>
            </div>

            {/* Error message */}
            {errors.contactName && (
              <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
            )}

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className={`absolute z-50 w-full mt-2 ${dropdownBgClass} border ${borderClass} rounded-lg shadow-xl max-h-80 overflow-y-auto`}>
                {filteredContacts.length === 0 ? (
                  <div className={`p-4 text-center ${textSecondaryClass}`}>
                    {searchTerm ? (
                      <>
                        <p className="text-sm">No contacts found</p>
                        <p className="text-xs mt-1">Press Enter to use "{searchTerm}"</p>
                      </>
                    ) : (
                      <p className="text-sm">Start typing to search or enter a name</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Brokers */}
                    {groupedContacts.broker.length > 0 && (
                      <div>
                        <div className={`px-4 py-2 ${darkMode ? 'bg-slate-600' : 'bg-slate-100'} text-xs font-semibold ${textSecondaryClass} uppercase`}>
                          Brokers
                        </div>
                        {groupedContacts.broker.map(contact => (
                          <button
                            key={`broker-${contact.id}`}
                            type="button"
                            onClick={() => handleContactSelect(contact)}
                            className={`w-full px-4 py-3 flex items-center gap-3 ${hoverBgClass} transition text-left`}
                          >
                            {getContactIcon('broker')}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${textClass} truncate`}>{contact.name}</div>
                              {contact.company && (
                                <div className={`text-xs ${textSecondaryClass} truncate`}>{contact.company}</div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                              Broker
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Partners */}
                    {groupedContacts.partner.length > 0 && (
                      <div>
                        <div className={`px-4 py-2 ${darkMode ? 'bg-slate-600' : 'bg-slate-100'} text-xs font-semibold ${textSecondaryClass} uppercase`}>
                          Partners
                        </div>
                        {groupedContacts.partner.map(contact => (
                          <button
                            key={`partner-${contact.id}`}
                            type="button"
                            onClick={() => handleContactSelect(contact)}
                            className={`w-full px-4 py-3 flex items-center gap-3 ${hoverBgClass} transition text-left`}
                          >
                            {getContactIcon('partner')}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${textClass} truncate`}>{contact.name}</div>
                              {contact.company && (
                                <div className={`text-xs ${textSecondaryClass} truncate`}>{contact.company}</div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                              Partner
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Gatekeepers */}
                    {groupedContacts.gatekeeper.length > 0 && (
                      <div>
                        <div className={`px-4 py-2 ${darkMode ? 'bg-slate-600' : 'bg-slate-100'} text-xs font-semibold ${textSecondaryClass} uppercase`}>
                          Gatekeepers
                        </div>
                        {groupedContacts.gatekeeper.map(contact => (
                          <button
                            key={`gatekeeper-${contact.id}`}
                            type="button"
                            onClick={() => handleContactSelect(contact)}
                            className={`w-full px-4 py-3 flex items-center gap-3 ${hoverBgClass} transition text-left`}
                          >
                            {getContactIcon('gatekeeper')}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${textClass} truncate`}>{contact.name}</div>
                              {contact.company && (
                                <div className={`text-xs ${textSecondaryClass} truncate`}>{contact.company}</div>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                              Gatekeeper
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <CustomSelect
                label="Type"
                value={formData.type}
                onChange={(value) => {
                  setFormData({ ...formData, type: value });
                  setErrors({ ...errors, type: null });
                }}
                options={[
                  { value: 'Call', label: 'Call' },
                  { value: 'Email', label: 'Email' },
                  { value: 'Meeting', label: 'Meeting' },
                  { value: 'Property Tour', label: 'Property Tour' },
                  { value: 'Check-in', label: 'Check-in' }
                ]}
                required
              />
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value });
                  setErrors({ ...errors, dueDate: null });
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.dueDate ? 'border-red-500' : inputBorderClass
                } ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <CustomSelect
                label="Priority"
                value={formData.priority}
                onChange={(value) => {
                  setFormData({ ...formData, priority: value });
                  setErrors({ ...errors, priority: null });
                }}
                options={[
                  { value: 'High', label: 'High Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low Priority' }
                ]}
                required
              />
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes or context..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update' : 'Save'} Follow-up</span>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FollowUpForm;
