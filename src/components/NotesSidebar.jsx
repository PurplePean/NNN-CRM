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
 * NotesSidebar Component - Redesigned with clean, consistent styling
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

  // Enhanced theme classes with consistent color palette
  const theme = {
    // Backgrounds
    bg: darkMode ? 'bg-slate-800' : 'bg-white',
    bgSecondary: darkMode ? 'bg-slate-900' : 'bg-slate-50',
    bgHover: darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100',
    bgCard: darkMode ? 'bg-slate-800' : 'bg-white',

    // Borders
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    borderLight: darkMode ? 'border-slate-600' : 'border-slate-300',

    // Text
    text: darkMode ? 'text-slate-100' : 'text-slate-900',
    textSecondary: darkMode ? 'text-slate-400' : 'text-slate-600',
    textMuted: darkMode ? 'text-slate-500' : 'text-slate-500',

    // Inputs
    input: {
      bg: darkMode ? 'bg-slate-700' : 'bg-slate-50',
      border: darkMode ? 'border-slate-600' : 'border-slate-300',
      focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      text: darkMode ? 'text-slate-100' : 'text-slate-900'
    },

    // Buttons
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 disabled:cursor-not-allowed',
      secondary: darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700',
      ghost: darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600',
      danger: 'hover:text-red-500',
      success: 'hover:text-green-500'
    },

    // Header
    header: {
      bg: darkMode ? 'bg-slate-900/50' : 'bg-slate-100/50',
      text: darkMode ? 'text-slate-100' : 'text-slate-900'
    },

    // Tabs
    tab: {
      active: 'bg-blue-600 text-white shadow-sm',
      inactive: darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }
  };

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
        entityType: entityType,
        entityId: entityId,
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
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed ${theme.border} ${theme.bgHover} ${theme.text} transition-all hover:border-blue-500 hover:text-blue-500`}
          >
            <Plus size={18} />
            <span className="font-medium">Add Note</span>
          </button>
        ) : (
          <div className={`border ${theme.border} rounded-lg p-4 ${theme.bgCard} shadow-sm space-y-3`}>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${theme.text}`}>
                Note Content
              </label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Type your note here..."
                className={`w-full px-3 py-2 ${theme.input.bg} border ${theme.input.border} rounded-lg ${theme.input.text} placeholder-slate-500 ${theme.input.focus} resize-none transition-shadow`}
                rows={4}
                autoFocus
              />
            </div>

            {/* Suggested Category Badge - Only show when suggestion exists */}
            {suggestedCategory && !selectedCategory && (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setSelectedCategory(suggestedCategory.value)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all ${darkMode
                      ? 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30'
                      : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                    }`}
                >
                  <AlertCircle size={14} className="text-blue-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Suggested: {suggestedCategory.label}
                  </span>
                  <Check size={14} className="text-blue-500" />
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${theme.text}`}>
                Category
              </label>
              <select
                value={selectedCategory || suggestedCategory?.value || 'other'}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 ${theme.input.bg} border ${theme.input.border} rounded-lg ${theme.input.text} ${theme.input.focus} transition-shadow`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${theme.button.primary}`}
              >
                <Check size={16} />
                Save Note
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                  setSelectedCategory(null);
                  setSuggestedCategory(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme.button.secondary}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {isLoading ? (
          <div className={`text-center py-12 ${theme.textSecondary}`}>
            <div className="animate-pulse">
              <StickyNote size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Loading notes...</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className={`text-center py-12 ${theme.textSecondary}`}>
            <StickyNote size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notes yet</p>
            <p className="text-sm mt-1">Add one to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(category => {
              const categoryNotes = groupedNotes[category.value] || [];
              if (categoryNotes.length === 0) return null;

              const isExpanded = expandedCategories[category.value] !== false;

              return (
                <div key={category.value} className={`border ${theme.border} rounded-lg overflow-hidden ${theme.bgCard} shadow-sm`}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${theme.bgHover} transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 px-2.5 py-1 rounded-md"
                        style={{
                          backgroundColor: darkMode
                            ? `${category.color}20`
                            : category.bgColor,
                          borderWidth: '1px',
                          borderColor: darkMode ? `${category.color}40` : 'transparent'
                        }}
                      >
                        {React.createElement(category.icon, {
                          size: 14,
                          style: { color: category.color }
                        })}
                        <span className={`text-sm font-semibold ${theme.text}`}>
                          {category.label}
                        </span>
                      </div>
                      <span className={`text-sm ${theme.textMuted}`}>
                        ({categoryNotes.length})
                      </span>
                    </div>
                    {isExpanded ?
                      <ChevronUp size={18} className={theme.textSecondary} /> :
                      <ChevronDown size={18} className={theme.textSecondary} />
                    }
                  </button>

                  {/* Category Notes */}
                  {isExpanded && (
                    <div className={`divide-y ${theme.border}`}>
                      {categoryNotes.map(note => (
                        <div key={note.id} className={`px-4 py-3 ${theme.bgHover} transition-colors`}>
                          {editingNoteId === note.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className={`w-full px-3 py-2 ${theme.input.bg} border ${theme.input.border} rounded-lg ${theme.input.text} ${theme.input.focus} resize-none transition-shadow`}
                                rows={3}
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className={`w-full px-3 py-2 ${theme.input.bg} border ${theme.input.border} rounded-lg ${theme.input.text} ${theme.input.focus} transition-shadow`}
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
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${theme.button.primary}`}
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
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${theme.button.secondary}`}
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div>
                              <p className={`${theme.text} mb-2 whitespace-pre-wrap leading-relaxed text-sm`}>
                                {note.content}
                              </p>
                              <div className="flex items-center justify-between pt-2">
                                <span className={`text-xs ${theme.textMuted}`}>
                                  {formatDate(note.createdAt)}
                                  {note.edited && note.updatedAt && (
                                    <span className="ml-2">
                                      • Edited {formatDate(note.updatedAt)}
                                    </span>
                                  )}
                                </span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditContent(note.content);
                                      setEditCategory(note.category);
                                    }}
                                    className={`p-1.5 rounded ${theme.button.ghost} ${theme.button.success} transition-colors`}
                                    title="Edit note"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className={`p-1.5 rounded ${theme.button.ghost} ${theme.button.danger} transition-colors`}
                                    title="Delete note"
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
    const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className={`text-center py-12 ${theme.textSecondary}`}>
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No history yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

            {sortedNotes.map((note, index) => {
              const category = getCategoryData(entityType, note.category);
              return (
                <div key={note.id} className="relative pl-12 pb-6">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-3.5 top-2 w-4 h-4 rounded-full border-2 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                    style={{
                      backgroundColor: category?.color || (darkMode ? '#1e293b' : '#ffffff'),
                      borderColor: category?.color || (darkMode ? '#334155' : '#e2e8f0')
                    }}
                  ></div>

                  <div className={`border ${theme.border} rounded-lg p-4 ${theme.bgCard} shadow-sm`}>
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          backgroundColor: darkMode
                            ? `${category?.color || '#64748b'}20`
                            : category?.bgColor || '#f1f5f9',
                          borderWidth: '1px',
                          borderColor: darkMode ? `${category?.color || '#64748b'}40` : 'transparent'
                        }}
                      >
                        {category && React.createElement(category.icon, {
                          size: 16,
                          style: { color: category.color }
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${theme.text}`}>
                            {category?.label || 'Note'}
                          </span>
                          <span className={`text-xs ${theme.textMuted}`}>
                            • {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
                          {note.content.substring(0, 150)}
                          {note.content.length > 150 && '...'}
                        </p>
                        {note.edited && note.updatedAt && (
                          <p className={`text-xs ${theme.textMuted} mt-2`}>
                            Edited {formatDate(note.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className={`pb-3 border-b ${theme.border}`}>
          <h3 className={`text-base font-semibold ${theme.text}`}>Categories</h3>
          <p className={`text-sm ${theme.textSecondary} mt-1`}>
            Auto-categorization keyword library
          </p>
        </div>

        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.value} className={`border ${theme.border} rounded-lg p-4 ${theme.bgCard} shadow-sm`}>
              <div className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: darkMode
                      ? `${cat.color}20`
                      : cat.bgColor,
                    borderWidth: '1px',
                    borderColor: darkMode ? `${cat.color}40` : 'transparent'
                  }}
                >
                  {React.createElement(cat.icon, {
                    size: 18,
                    style: { color: cat.color }
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${theme.text} mb-1`}>{cat.label}</h4>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`${theme.textSecondary}`}>
                      {cat.keywords?.length || 0} keyword{cat.keywords?.length !== 1 ? 's' : ''}
                    </span>
                    <span className={theme.textMuted}>•</span>
                    <span className={`${theme.textSecondary}`}>
                      {categoryStats[cat.value]?.count || 0} note{categoryStats[cat.value]?.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        new Date(note.createdAt) < new Date(oldest.createdAt) ? note : oldest
      )
      : null;
    const newestNote = notes.length > 0
      ? notes.reduce((newest, note) =>
        new Date(note.createdAt) > new Date(newest.createdAt) ? note : newest
      )
      : null;

    return (
      <div className="space-y-4">
        {/* Statistics Card */}
        <div className={`border ${theme.border} rounded-lg p-4 ${theme.bgCard} shadow-sm`}>
          <h3 className={`text-base font-semibold ${theme.text} mb-4`}>Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme.textSecondary}`}>Total Notes</span>
              <span className={`text-2xl font-bold ${theme.text}`}>{totalNotes}</span>
            </div>
            {oldestNote && (
              <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <span className={`text-sm ${theme.textSecondary}`}>First Note</span>
                <span className={`text-sm font-medium ${theme.text}`}>
                  {formatDate(oldestNote.createdAt)}
                </span>
              </div>
            )}
            {newestNote && (
              <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
                <span className={`text-sm ${theme.textSecondary}`}>Latest Note</span>
                <span className={`text-sm font-medium ${theme.text}`}>
                  {formatDate(newestNote.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Card */}
        {totalNotes > 0 && (
          <div className={`border ${theme.border} rounded-lg p-4 ${theme.bgCard} shadow-sm`}>
            <h3 className={`text-base font-semibold ${theme.text} mb-4`}>Notes by Category</h3>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([label, count]) => (
                count > 0 && (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme.textSecondary}`}>{label}</span>
                      <span className={`text-sm font-semibold ${theme.text}`}>{count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? '#334155' : '#e2e8f0' }}>
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(count / totalNotes) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className={`${theme.bg} border-l ${theme.border} w-12 flex flex-col items-center py-4 shadow-lg`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded-lg ${theme.button.ghost} transition-colors`}
          title="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
        <div className="mt-4 flex flex-col gap-3">
          <div className={`p-2 rounded-lg ${theme.textMuted}`}>
            <StickyNote size={18} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} border-l ${theme.border} w-96 flex flex-col h-full shadow-lg`}>
      {/* Header with subtle background */}
      <div className={`px-6 py-4 ${theme.header.bg} border-b ${theme.border} flex items-center justify-between backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <StickyNote size={20} className="text-blue-500" />
          <h2 className={`text-lg font-bold ${theme.header.text}`}>Notes</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className={`p-1.5 rounded-lg ${theme.button.ghost} transition-colors`}
          title="Collapse sidebar"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={`px-4 py-3 border-b ${theme.border} ${theme.bgSecondary}`}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'notes'
                ? theme.tab.active
                : theme.tab.inactive
              }`}
          >
            <StickyNote size={15} />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                ? theme.tab.active
                : theme.tab.inactive
              }`}
          >
            <Clock size={15} />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'preferences'
                ? theme.tab.active
                : theme.tab.inactive
              }`}
          >
            <Settings size={15} />
            <span>Prefs</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general'
                ? theme.tab.active
                : theme.tab.inactive
              }`}
          >
            <Info size={15} />
            <span>Stats</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
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
