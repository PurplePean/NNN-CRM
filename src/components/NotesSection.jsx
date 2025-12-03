import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { getCategoriesByEntityType, getCategoryConfig } from '../config/noteCategories';

/**
 * NotesSection Component
 * A reusable notes sidebar for any entity type with categorized notes
 *
 * @param {string} entityType - The type of entity (property, broker, partner, etc.)
 * @param {string} entityId - The ID of the entity
 * @param {Array} notes - Array of note objects
 * @param {Function} onAddNote - Callback for adding a note
 * @param {Function} onEditNote - Callback for editing a note
 * @param {Function} onDeleteNote - Callback for deleting a note
 * @param {boolean} isCollapsed - Whether the section is initially collapsed
 */
const NotesSection = ({
  entityType,
  entityId,
  notes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
  isCollapsed = false
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Get categories for this entity type
  const categories = getCategoriesByEntityType(entityType);

  // Set default category when component mounts or entity type changes
  useEffect(() => {
    if (categories.length > 0 && !newNoteCategory) {
      setNewNoteCategory(categories[0].value);
    }
  }, [entityType, categories, newNoteCategory]);

  // Sort notes by created_at (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });

  const handleAddClick = () => {
    setIsAdding(true);
    setNewNoteContent('');
    setNewNoteCategory(categories[0]?.value || 'other');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewNoteContent('');
  };

  const handleSaveNew = async () => {
    if (!newNoteContent.trim()) return;

    try {
      await onAddNote({
        entity_type: entityType,
        entity_id: entityId,
        category: newNoteCategory,
        content: newNoteContent.trim()
      });

      setIsAdding(false);
      setNewNoteContent('');
      setNewNoteCategory(categories[0]?.value || 'other');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
    setEditCategory('');
  };

  const handleSaveEdit = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      await onEditNote(noteId, {
        content: editContent.trim(),
        category: editCategory
      });

      setEditingNoteId(null);
      setEditContent('');
      setEditCategory('');
    } catch (error) {
      console.error('Error editing note:', error);
      alert('Failed to edit note. Please try again.');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderNoteCard = (note) => {
    const categoryConfig = getCategoryConfig(entityType, note.category);
    const Icon = categoryConfig?.icon;
    const isEditing = editingNoteId === note.id;

    return (
      <div
        key={note.id}
        className={`p-4 rounded-lg border ${categoryConfig?.borderColor || 'border-gray-200'}
                    ${categoryConfig?.bgColor || 'bg-gray-50'}
                    dark:bg-gray-800/50 dark:border-gray-700 transition-all`}
      >
        {/* Category Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon
                size={16}
                className={categoryConfig?.color || 'text-gray-500'}
              />
            )}
            <span className={`text-sm font-medium ${categoryConfig?.color || 'text-gray-500'}`}>
              {categoryConfig?.label || note.category}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(note.created_at)}
          </span>
        </div>

        {/* Note Content or Edit Form */}
        {isEditing ? (
          <div className="space-y-3">
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                       rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                       rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="Edit note..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveEdit(note.id)}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white
                         rounded-md transition-colors flex items-center gap-1"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700
                         dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md
                         transition-colors flex items-center gap-1"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
              {note.content}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(note)}
                className="px-2 py-1 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50
                         dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border
                         border-gray-300 dark:border-gray-600 rounded transition-colors
                         flex items-center gap-1"
              >
                <Edit2 size={12} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="px-2 py-1 text-xs bg-white dark:bg-gray-700 hover:bg-red-50
                         dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border
                         border-gray-300 dark:border-gray-600 hover:border-red-300
                         dark:hover:border-red-600 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-800/50
                   border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50
                   transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          NOTES
        </h3>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddClick();
              }}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md
                       transition-colors text-blue-600 dark:text-blue-400"
              title="Add Note"
            >
              <Plus size={18} />
            </button>
          )}
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {/* Add Note Form */}
          {isAdding && (
            <div className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-600
                          rounded-lg bg-blue-50/50 dark:bg-blue-900/10 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                           rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                           rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Add your note here..."
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNew}
                  disabled={!newNoteContent.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white
                           rounded-md transition-colors flex items-center gap-2 disabled:opacity-50
                           disabled:cursor-not-allowed"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700
                           dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md
                           transition-colors flex items-center gap-2"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes Timeline */}
          {sortedNotes.length > 0 ? (
            <div className="space-y-3">
              {sortedNotes.map(renderNoteCard)}
            </div>
          ) : (
            !isAdding && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No notes yet</p>
                <button
                  onClick={handleAddClick}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Add your first note
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default NotesSection;
