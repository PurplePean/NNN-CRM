import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Settings,
  Info,
  X,
  Check,
  StickyNote,
  ChevronUp,
  Save,
  AlertCircle
} from 'lucide-react';
import { suggestCategory, getCategoriesList, getCategoryData } from '../utils/keywordLibrary';
import { notesService } from '../services/supabase';

/**
 * NotesSidebar Component
 * A comprehensive notes sidebar with auto-categorization, tabs, and full CRUD operations
 *
 * @param {string} entityType - Entity type (property, broker, partner)
 * @param {string} entityId - Entity ID
 * @param {boolean} darkMode - Dark mode flag
 * @param {Function} onNotesChange - Callback when notes are updated
 */
const NotesSidebar = ({ entityType, entityId, darkMode, onNotesChange }) => {
  // State management
  const [activeTab, setActiveTab] = useState('notes');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Add note state
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  // Edit note state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState(null);

  // Get categories for this entity type
  const categories = getCategoriesList(entityType);

  // Theme classes
  const bgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverClass = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const inputBgClass = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorderClass = darkMode ? 'border-gray-600' : 'border-gray-300';

  // Load notes on mount and when entity changes
  useEffect(() => {
    loadNotes();
  }, [entityType, entityId]);

  // Auto-suggest category as user types
  useEffect(() => {
    if (newNoteContent.trim()) {
      const suggestion = suggestCategory(newNoteContent, entityType);
      setSuggestedCategory(suggestion);
    } else {
      setSuggestedCategory(null);
    }
  }, [newNoteContent, entityType]);

  const loadNotes = async () => {
    if (!entityId) return;
    setIsLoading(true);
    try {
      const data = await notesService.getNotesByEntity(entityType, entityId);
      setNotes(data || []);

      // Auto-expand all categories initially
      const expanded = {};
      data?.forEach(note => {
        if (note.category) {
          expanded[note.category] = true;
        }
      });
      setExpandedCategories(expanded);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    const categoryToUse = selectedCategory || suggestedCategory?.value || 'other';

    try {
      const newNote = await notesService.createNote({
        entity_type: entityType,
        entity_id: entityId,
        category: categoryToUse,
        content: newNoteContent.trim()
      });

      setNotes(prev => [newNote, ...prev]);
      setNewNoteContent('');
      setSelectedCategory(null);
      setSuggestedCategory(null);
      setIsAdding(false);

      // Expand the category of the new note
      setExpandedCategories(prev => ({
        ...prev,
        [categoryToUse]: true
      }));

      if (onNotesChange) onNotesChange();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      const updated = await notesService.updateNote(noteId, {
        content: editContent.trim(),
        category: editCategory
      });

      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      setEditingNoteId(null);
      setEditContent('');
      setEditCategory(null);

      if (onNotesChange) onNotesChange();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (onNotesChange) onNotesChange();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const toggleCategory = (categoryValue) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryValue]: !prev[categoryValue]
    }));
  };

  const groupNotesByCategory = () => {
    const grouped = {};
    notes.forEach(note => {
      const cat = note.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(note);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderNotesTab = () => {
    const groupedNotes = groupNotesByCategory();

    return (
      <div className="space-y-4">
        {/* Add Note Section */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border ${borderClass} ${hoverClass} ${textClass} transition-colors`}
          >
            <Plus size={18} />
            <span className="font-medium">Add Note</span>
          </button>
        ) : (
          <div className={`border ${borderClass} rounded-lg p-4 space-y-3`}>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Type your note here..."
              className={`w-full px-3 py-2 ${inputBgClass} border ${inputBorderClass} rounded-lg ${textClass} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              rows={4}
              autoFocus
            />

            {/* Suggested Category */}
            {suggestedCategory && !selectedCategory && (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setSelectedCategory(suggestedCategory.value)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all hover:opacity-80"
                  style={{ backgroundColor: suggestedCategory.bgColor }}
                >
                  {React.createElement(suggestedCategory.icon, {
                    size: 14,
                    style: { color: suggestedCategory.color }
                  })}
                  <span className={textSecondaryClass} style={{ fontSize: '0.875rem' }}>
                    {suggestedCategory.label}
                  </span>
                  <span className={textSecondaryClass} style={{ fontSize: '0.75rem' }}>
                    (suggested)
                  </span>
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${textSecondaryClass}`}>
                Category
              </label>
              <select
                value={selectedCategory || suggestedCategory?.value || 'other'}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 ${inputBgClass} border ${inputBorderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Check size={16} />
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                  setSelectedCategory(null);
                  setSuggestedCategory(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 ${inputBgClass} ${hoverClass} ${textClass} rounded-lg font-medium transition-colors`}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {isLoading ? (
          <div className={`text-center py-8 ${textSecondaryClass}`}>
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className={`text-center py-8 ${textSecondaryClass}`}>
            <StickyNote size={48} className="mx-auto mb-2 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Add your first note to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(category => {
              const categoryNotes = groupedNotes[category.value] || [];
              if (categoryNotes.length === 0) return null;

              const isExpanded = expandedCategories[category.value] !== false;

              return (
                <div key={category.value} className={`border ${borderClass} rounded-lg overflow-hidden`}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${hoverClass} transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 px-2 py-1 rounded"
                        style={{ backgroundColor: category.bgColor }}
                      >
                        {React.createElement(category.icon, {
                          size: 16,
                          style: { color: category.color }
                        })}
                        <span className={textClass} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {category.label}
                        </span>
                      </div>
                      <span className={textSecondaryClass} style={{ fontSize: '0.875rem' }}>
                        ({categoryNotes.length})
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {/* Category Notes */}
                  {isExpanded && (
                    <div className="divide-y" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                      {categoryNotes.map(note => (
                        <div key={note.id} className={`px-4 py-3 ${hoverClass}`}>
                          {editingNoteId === note.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className={`w-full px-3 py-2 ${inputBgClass} border ${inputBorderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                rows={3}
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className={`w-full px-3 py-2 ${inputBgClass} border ${inputBorderClass} rounded-lg ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              >
                                {categories.map(cat => (
                                  <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditNote(note.id)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                                >
                                  <Save size={14} />
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditContent('');
                                    setEditCategory(null);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-1.5 ${inputBgClass} ${textClass} rounded text-sm font-medium`}
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div>
                              <p className={`${textClass} mb-2 whitespace-pre-wrap`}>
                                {note.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className={textSecondaryClass} style={{ fontSize: '0.75rem' }}>
                                  {formatDate(note.created_at)}
                                  {note.edited && note.updated_at && (
                                    <span className="ml-2">
                                      • Edited {formatDate(note.updated_at)}
                                    </span>
                                  )}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditContent(note.content);
                                      setEditCategory(note.category);
                                    }}
                                    className={`p-1.5 rounded ${hoverClass} ${textSecondaryClass} hover:text-blue-500 transition-colors`}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className={`p-1.5 rounded ${hoverClass} ${textSecondaryClass} hover:text-red-500 transition-colors`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    const sortedNotes = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className={`text-center py-8 ${textSecondaryClass}`}>
            <Clock size={48} className="mx-auto mb-2 opacity-50" />
            <p>No history yet</p>
          </div>
        ) : (
          sortedNotes.map(note => {
            const category = getCategoryData(entityType, note.category);
            return (
              <div key={note.id} className={`border ${borderClass} rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg`} style={{ backgroundColor: category?.bgColor || '#f3f4f6' }}>
                    {category && React.createElement(category.icon, {
                      size: 16,
                      style: { color: category.color }
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${textClass}`}>
                        {category?.label || 'Note'}
                      </span>
                      <span className={textSecondaryClass} style={{ fontSize: '0.75rem' }}>
                        • {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className={`${textSecondaryClass} text-sm`}>
                      {note.content.substring(0, 100)}
                      {note.content.length > 100 && '...'}
                    </p>
                    {note.edited && note.updated_at && (
                      <p className={textSecondaryClass} style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        Edited {formatDate(note.updated_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderPreferencesTab = () => {
    const categoryStats = {};
    categories.forEach(cat => {
      const count = notes.filter(n => n.category === cat.value).length;
      categoryStats[cat.value] = {
        ...cat,
        count,
        keywordCount: cat.keywords?.length || 0
      };
    });

    return (
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Categories</h3>
        {categories.map(cat => (
          <div key={cat.value} className={`border ${borderClass} rounded-lg p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: cat.bgColor }}>
                {React.createElement(cat.icon, {
                  size: 18,
                  style: { color: cat.color }
                })}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${textClass}`}>{cat.label}</h4>
                <p className={textSecondaryClass} style={{ fontSize: '0.75rem' }}>
                  {cat.keywords?.length || 0} keyword{cat.keywords?.length !== 1 ? 's' : ''}
                  {' • '}
                  {categoryStats[cat.value]?.count || 0} note{categoryStats[cat.value]?.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGeneralTab = () => {
    const categoryBreakdown = {};
    categories.forEach(cat => {
      categoryBreakdown[cat.label] = notes.filter(n => n.category === cat.value).length;
    });

    const totalNotes = notes.length;
    const oldestNote = notes.length > 0
      ? notes.reduce((oldest, note) =>
          new Date(note.created_at) < new Date(oldest.created_at) ? note : oldest
        )
      : null;
    const newestNote = notes.length > 0
      ? notes.reduce((newest, note) =>
          new Date(note.created_at) > new Date(newest.created_at) ? note : newest
        )
      : null;

    return (
      <div className="space-y-4">
        <div className={`border ${borderClass} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={textSecondaryClass}>Total Notes:</span>
              <span className={`font-medium ${textClass}`}>{totalNotes}</span>
            </div>
            {oldestNote && (
              <div className="flex justify-between">
                <span className={textSecondaryClass}>First Note:</span>
                <span className={`font-medium ${textClass}`}>
                  {formatDate(oldestNote.created_at)}
                </span>
              </div>
            )}
            {newestNote && (
              <div className="flex justify-between">
                <span className={textSecondaryClass}>Latest Note:</span>
                <span className={`font-medium ${textClass}`}>
                  {formatDate(newestNote.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={`border ${borderClass} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Notes by Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([label, count]) => (
              count > 0 && (
                <div key={label} className="flex justify-between items-center">
                  <span className={textSecondaryClass}>{label}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(count / totalNotes) * 100}%` }}
                      />
                    </div>
                    <span className={`font-medium ${textClass} w-8 text-right`}>{count}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className={`${bgClass} border-l ${borderClass} w-12 flex flex-col items-center py-4`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded ${hoverClass} ${textClass}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={`${bgClass} border-l ${borderClass} w-96 flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderClass} flex items-center justify-between`}>
        <h2 className={`text-lg font-semibold ${textClass}`}>Notes</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className={`p-1 rounded ${hoverClass} ${textSecondaryClass}`}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className={`px-4 py-2 border-b ${borderClass} flex gap-1`}>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white'
              : `${textSecondaryClass} ${hoverClass}`
          }`}
        >
          <StickyNote size={16} />
          Notes
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : `${textSecondaryClass} ${hoverClass}`
          }`}
        >
          <Clock size={16} />
          History
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white'
              : `${textSecondaryClass} ${hoverClass}`
          }`}
        >
          <Settings size={16} />
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white'
              : `${textSecondaryClass} ${hoverClass}`
          }`}
        >
          <Info size={16} />
          General
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'general' && renderGeneralTab()}
      </div>
    </div>
  );
};

export default NotesSidebar;
