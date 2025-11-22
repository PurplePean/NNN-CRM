import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Edit2, Search, Moon, Sun, X, Database, AlertTriangle, Calendar, Bell, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, Building2, Target, Phone, Mail, Video, MessageSquare, User, Globe, ExternalLink, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import ConfirmDialog from './components/ConfirmDialog';
import LoadingSpinner from './components/LoadingSpinner';
import FollowUpForm from './components/FollowUpForm';
import { supabaseService, isSupabaseConfigured, supabase } from './services/supabase';

// ==================
// CONSTANTS
// ==================

const ALLOWED_EMAILS = [
  'zach@axispoint.llc',
  'ethaniel@axispoint.llc'
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_TYPES = ['Call', 'Email', 'Meeting', 'Property Tour', 'Broker Meeting', 'Partner Presentation',
                     'Due Diligence Deadline', 'Closing Date', 'Other'];

const PRIORITY_LEVELS = ['High', 'Medium', 'Low'];

const ASSET_CLASSES = ['Industrial', 'Retail', 'Office', 'Multifamily', 'Self Storage',
                       'Hotel', 'Land', 'CRE Lending', 'Mixed Use', 'Other'];

const DEBT_SERVICE_TYPES = [
  { value: 'standard', label: 'Amortizing (Standard)' },
  { value: 'interestOnly', label: 'Interest-Only' }
];

// ==================
// HELPER COMPONENTS
// ==================

const EmptyState = ({ icon: Icon, title, message, action, darkMode }) => {
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const buttonClass = darkMode
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="text-center py-12">
      {Icon && <Icon className={`mx-auto ${textSecondaryClass} mb-4`} size={48} />}
      <h3 className={`text-lg font-semibold ${textClass} mb-2`}>{title}</h3>
      <p className={`${textSecondaryClass} mb-6 max-w-md mx-auto`}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`px-6 py-2 rounded-lg font-medium ${buttonClass}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default function IndustrialCRM() {
  // ==================
  // ENTITY DATA STATE
  // ==================
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [gatekeepers, setGatekeepers] = useState([]);
  const [events, setEvents] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  // ==================
  // UI NAVIGATION STATE
  // ==================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState('communication');
  const [searchTerm, setSearchTerm] = useState('');
  const [contactFilter, setContactFilter] = useState('all');
  const [contactSort, setContactSort] = useState('name');
  const [darkMode, setDarkMode] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ==================
  // AUTH STATE
  // ==================
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ==================
  // FORM/MODAL STATE
  // ==================
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showGatekeeperForm, setShowGatekeeperForm] = useState(false);
  const [showInlineBrokerForm, setShowInlineBrokerForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [inlineBrokerData, setInlineBrokerData] = useState({});

  // ==================
  // CALENDAR STATE
  // ==================
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarView, setCalendarView] = useState('month');
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [contactTagSearch, setContactTagSearch] = useState('');

  // ==================
  // NOTIFICATION STATE
  // ==================
  const [toasts, setToasts] = useState([]);

  // ==================
  // PHOTO LIGHTBOX STATE
  // ==================
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ==================
  // CONTACT DETAIL MODAL STATE
  // ==================
  const [contactDetailOpen, setContactDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // ==================
  // CONTACT PROFILE STATE
  // ==================
  const [viewingContactProfile, setViewingContactProfile] = useState(false);
  const [profileContact, setProfileContact] = useState(null);
  const [editingObjective, setEditingObjective] = useState(false);
  const [objectiveText, setObjectiveText] = useState('');
  const [showInlineFollowUpForm, setShowInlineFollowUpForm] = useState(false);
  const [showInlineEventForm, setShowInlineEventForm] = useState(false);
  const [inlineFollowUpData, setInlineFollowUpData] = useState({});
  const [inlineEventData, setInlineEventData] = useState({});

  // ==================
  // PROPERTY PROFILE STATE
  // ==================
  const [viewingPropertyProfile, setViewingPropertyProfile] = useState(false);
  const [profileProperty, setProfileProperty] = useState(null);
  const [propertyBrokerSearch, setPropertyBrokerSearch] = useState('');
  const [propertyPartnerSearch, setPropertyPartnerSearch] = useState('');
  const [propertyGatekeeperSearch, setPropertyGatekeeperSearch] = useState('');

  // ==================
  // NOTE-TAKING STATE
  // ==================
  const [noteContent, setNoteContent] = useState({});
  const [noteCategory, setNoteCategory] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [expandedNotes, setExpandedNotes] = useState({});
  const [collapsedNoteSections, setCollapsedNoteSections] = useState({});

  // ==================
  // ACTIVITY FEED FILTERS
  // ==================
  const [activityContactType, setActivityContactType] = useState('all');
  const [activityCategory, setActivityCategory] = useState('all');
  const [activityDateFilter, setActivityDateFilter] = useState('all');

  // ==================
  // SENSITIVITY ANALYSIS STATE
  // ==================
  const [sensitivityPropertyId, setSensitivityPropertyId] = useState(null);
  const [sensitivityRowVar, setSensitivityRowVar] = useState('monthlyBaseRentPerSqft');
  const [sensitivityColVar, setSensitivityColVar] = useState('exitCapRate');
  const [sensitivityOutputMetric, setSensitivityOutputMetric] = useState('irr');
  const [sensitivityRowMin, setSensitivityRowMin] = useState('');
  const [sensitivityRowMax, setSensitivityRowMax] = useState('');
  const [sensitivityColMin, setSensitivityColMin] = useState('');
  const [sensitivityColMax, setSensitivityColMax] = useState('');
  const [sensitivityTable, setSensitivityTable] = useState(null);

  // ==================
  // CONFIRMATION DIALOG STATE
  // ==================
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  // ==================
  // DIALOG HELPERS
  // ==================

  /**
   * Show confirmation dialog to user
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onConfirm - Callback function when user confirms
   * @param {string} variant - Dialog variant (danger, warning, info)
   */
  const showConfirmDialog = (title, message, onConfirm, variant = 'danger') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant
    });
  };

  /**
   * Close confirmation dialog
   */
  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      variant: 'danger'
    });
  };

  // ==================
  // AUTH FUNCTIONS
  // ==================

  /**
   * Sign in with Google OAuth
   * @async
   * @returns {Promise<void>}
   */
  const signInWithGoogle = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://crm.axispoint.llc'
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  /**
   * Sign out current user
   * @async
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  // ==================
  // INITIALIZATION & EFFECTS
  // ==================

  // Check auth state on mount and listen for auth changes
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Email whitelist check - only authorized emails can access
          if (!ALLOWED_EMAILS.includes(session.user.email)) {
            await supabase.auth.signOut();
            alert('Access denied. Your email is not authorized to access this application.');
            return;
          }
        }
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
          alert('ERROR: Supabase is not configured. Please set up your environment variables (REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY) to use this application.');
          setIsLoadingData(false);
          return;
        }

        // Load from Supabase
        const [dbProperties, dbBrokers, dbPartners, dbGatekeepers, dbEvents, dbFollowUps] = await Promise.all([
          supabaseService.getAll('properties'),
          supabaseService.getAll('brokers'),
          supabaseService.getAll('partners'),
          supabaseService.getAll('gatekeepers'),
          supabaseService.getAll('events'),
          supabaseService.getAll('follow_ups')
        ]);

        if (dbProperties) setProperties(dbProperties);
        if (dbBrokers) setBrokers(dbBrokers);
        if (dbPartners) setPartners(dbPartners);
        if (dbGatekeepers) setGatekeepers(dbGatekeepers);
        if (dbEvents) setEvents(dbEvents);
        if (dbFollowUps) setFollowUps(dbFollowUps);

        // Always load UI preferences from localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedDashboardView = localStorage.getItem('dashboardView');
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
        if (savedDashboardView) setDashboardView(savedDashboardView);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Persist dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist dashboard view preference to localStorage
  useEffect(() => {
    localStorage.setItem('dashboardView', dashboardView);
  }, [dashboardView]);

  // ==================
  // FORMATTING UTILITIES
  // ==================

  /**
   * Format number as USD currency
   * @param {number} num - Number to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  /**
   * Format number as percentage
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  const formatPercent = (num, decimals = 2) => {
    if (!num && num !== 0) return 'N/A';
    return `${parseFloat(num).toFixed(decimals)}%`;
  };

  /**
   * Format number input with commas as user types
   * @param {string|number} value - Value to format
   * @returns {string} Formatted value
   */
  const formatNumberInput = (value) => {
    if (!value) return '';
    const stripped = value.toString().replace(/,/g, '');
    if (isNaN(stripped) || stripped === '') return value;
    const numValue = parseFloat(stripped);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numValue);
  };

  /**
   * Strip commas from formatted numbers for storage
   * @param {string} value - Value with commas
   * @returns {string} Value without commas
   */
  const stripCommas = (value) => {
    return value ? value.replace(/,/g, '') : '';
  };

  // ==================
  // DATE/TIME UTILITIES
  // ==================

  /**
   * Format date string to short date format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /**
   * Format date string with time
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date and time
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  /**
   * Calculate days between date and today
   * @param {string} dateString - ISO date string
   * @returns {number|null} Number of days ago
   */
  const getDaysAgo = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Check if date is in the past
   * @param {string} dateString - ISO date string
   * @returns {boolean} True if date is overdue
   */
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  /**
   * Check if date is today
   * @param {string} dateString - ISO date string
   * @returns {boolean} True if date is today
   */
  const isDueToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // ==================
  // CALENDAR UTILITIES
  // ==================

  /**
   * Get number of days in month
   * @param {number} month - Month (0-11)
   * @param {number} year - Year
   * @returns {number} Number of days
   */
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  /**
   * Get first day of month (0=Sunday, 6=Saturday)
   * @param {number} month - Month (0-11)
   * @param {number} year - Year
   * @returns {number} Day of week
   */
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  /**
   * Generate array of days for calendar grid
   * @returns {Array<number|null>} Array of days with null for empty cells
   */
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  /**
   * Get events for specific day
   * @param {number} day - Day of month
   * @returns {Array} Events for that day
   */
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === currentYear &&
             eventDate.getMonth() === currentMonth &&
             eventDate.getDate() === day;
    });
  };

  /**
   * Navigate to previous month in calendar
   */
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  /**
   * Navigate to next month in calendar
   */
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  /**
   * Navigate to today's month in calendar
   */
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  /**
   * Check if calendar day is today
   * @param {number} day - Day of month
   * @returns {boolean} True if day is today
   */
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear();
  };

  // ==================
  // TOAST NOTIFICATIONS
  // ==================

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type (success, error, warning, info)
   */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ==================
  // GOOGLE CALENDAR INTEGRATION
  // ==================

  /**
   * Export event to Google Calendar
   * @param {Object} event - Event object
   */
  const exportToGoogleCalendar = (event) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');

    // Format dates for Google Calendar (YYYYMMDDTHHmmss)
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  // ==================
  // FINANCIAL CALCULATIONS
  // ==================

  /**
   * Calculate monthly amortization payment
   * @param {number} principal - Loan principal
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} years - Loan term in years
   * @returns {number} Monthly payment
   */
  const calculateAmortizationPayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
    return payment;
  };

  // Calculate remaining loan balance
  const calculateRemainingBalance = (principal, annualRate, years, monthsPaid) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal - (principal / numPayments * monthsPaid);
    const monthlyPayment = calculateAmortizationPayment(principal, annualRate, years);
    const remainingBalance = principal * Math.pow(1 + monthlyRate, monthsPaid) -
                            monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate);
    return Math.max(0, remainingBalance);
  };

  // ==================
  // PROPERTY CRUD OPERATIONS
  // ==================

  /**
   * Initialize property form for adding new property
   */
  const handleAddProperty = () => {
    setFormData({
      address: '',
      squareFeet: '',
      monthlyBaseRentPerSqft: '',
      purchasePrice: '',
      improvements: '',
      closingCosts: '',
      ltvPercent: '',
      interestRate: '',
      loanTerm: '30',
      debtServiceType: 'standard',
      exitCapRate: '',
      holdingPeriodMonths: '',
      crexi: '',
      notes: '',
      brokerIds: [],
      photos: []
    });
    setEditingId(null);
    setShowPropertyForm(true);
    setShowInlineBrokerForm(false);
  };

  /**
   * Initialize property form for editing existing property
   * @param {Object} property - Property object to edit
   */
  const handleEditProperty = (property) => {
    setFormData({
      ...property,
      brokerIds: property.brokerIds || [],
      photos: property.photos || []
    });
    setEditingId(property.id);
    setShowPropertyForm(true);
    setShowInlineBrokerForm(false);
  };

  const handleSaveProperty = async () => {
    if (!formData.address) {
      showToast('Please enter an address', 'error');
      return;
    }

    const propertyData = {
      ...formData,
      // Strip commas before saving
      squareFeet: stripCommas(formData.squareFeet),
      purchasePrice: stripCommas(formData.purchasePrice),
      improvements: stripCommas(formData.improvements),
      closingCosts: stripCommas(formData.closingCosts)
    };

    try {
      if (editingId) {
        // Update existing property
        setProperties(properties.map(p => p.id === editingId ? { ...propertyData, id: editingId } : p));

        // Sync to Supabase if configured
        if (isSupabaseConfigured()) {
          await supabaseService.update('properties', editingId, propertyData);
        }
      } else {
        // Create new property
        if (isSupabaseConfigured()) {
          // Save to Supabase and get the ID from Supabase
          const savedProperty = await supabaseService.create('properties', propertyData);
          if (savedProperty) {
            setProperties([...properties, savedProperty]);
          } else {
            // Fallback to local ID if Supabase fails
            setProperties([...properties, { ...propertyData, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          // No Supabase - use local ID
          setProperties([...properties, { ...propertyData, id: Date.now() }]);
        }
      }

      setShowPropertyForm(false);
      setShowInlineBrokerForm(false);
      setFormData({});
      showToast(editingId ? 'Property updated' : 'Property added', 'success');
    } catch (error) {
      console.error('Error saving property:', error);
      showToast('Error saving property', 'error');
    }
  };

  const handleDeleteProperty = (id) => {
    showConfirmDialog(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      async () => {
        setProperties(properties.filter(p => p.id !== id));

        // Delete from Supabase if configured
        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('properties', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // ==================
  // NOTE MANAGEMENT OPERATIONS
  // ==================

  /**
   * Add note to property or contact
   * @param {string} entityType - Type of entity (property, broker, partner, gatekeeper)
   * @param {string|number} entityId - Entity ID
   * @param {string} content - Note content
   * @param {string} category - Note category
   */
  const handleAddNote = (entityType, entityId, content, category = 'general') => {
    if (!content.trim()) return;

    const newNote = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      content: content.trim(),
      category: category
    };

    if (entityType === 'property') {
      setProperties(properties.map(p => {
        if (p.id === entityId) {
          return {
            ...p,
            noteHistory: [...(p.noteHistory || []), newNote]
          };
        }
        return p;
      }));
    } else if (entityType === 'broker') {
      setBrokers(brokers.map(b => {
        if (b.id === entityId) {
          return {
            ...b,
            noteHistory: [...(b.noteHistory || []), newNote]
          };
        }
        return b;
      }));
    }
  };

  const handleEditNote = (entityType, entityId, noteId, newContent) => {
    if (!newContent.trim()) return;

    if (entityType === 'property') {
      setProperties(properties.map(p => {
        if (p.id === entityId) {
          return {
            ...p,
            noteHistory: (p.noteHistory || []).map(note =>
              note.id === noteId
                ? { ...note, content: newContent.trim(), edited: true, editedAt: new Date().toISOString() }
                : note
            )
          };
        }
        return p;
      }));
    } else if (entityType === 'broker') {
      setBrokers(brokers.map(b => {
        if (b.id === entityId) {
          return {
            ...b,
            noteHistory: (b.noteHistory || []).map(note =>
              note.id === noteId
                ? { ...note, content: newContent.trim(), edited: true, editedAt: new Date().toISOString() }
                : note
            )
          };
        }
        return b;
      }));
    }
  };

  const handleDeleteNote = (entityType, entityId, noteId) => {
    const deleteNote = () => {
      if (entityType === 'property') {
        setProperties(properties.map(p => {
          if (p.id === entityId) {
            return {
              ...p,
              noteHistory: (p.noteHistory || []).filter(note => note.id !== noteId)
            };
          }
          return p;
        }));
      } else if (entityType === 'broker') {
        setBrokers(brokers.map(b => {
          if (b.id === entityId) {
            return {
              ...b,
              noteHistory: (b.noteHistory || []).filter(note => note.id !== noteId)
            };
          }
          return b;
        }));
      }
    };

    showConfirmDialog(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      deleteNote,
      'danger'
    );
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return then.toLocaleDateString();
  };

  // ==================
  // PHOTO MANAGEMENT OPERATIONS
  // ==================

  /**
   * Handle photo upload from file input
   * @param {Event} e - File input change event
   */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed a reasonable limit (e.g., 10 photos per property)
    const currentPhotos = formData.photos || [];
    if (currentPhotos.length + files.length > 10) {
      showToast('Maximum 10 photos per property', 'warning');
      return;
    }

    files.forEach(file => {
      // Check file size (limit to 2MB per image for optimal performance)
      if (file.size > 2 * 1024 * 1024) {
        showToast(`${file.name} is too large. Maximum file size is 2MB.`, 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} is not an image file.`, 'error');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData(prevData => ({
          ...prevData,
          photos: [...(prevData.photos || []), {
            id: Date.now() + Math.random(), // Unique ID for each photo
            data: base64String,
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handlePhotoUrlAdd = (url) => {
    if (!url || !url.trim()) return;

    const currentPhotos = formData.photos || [];
    if (currentPhotos.length >= 10) {
      showToast('Maximum 10 photos per property', 'warning');
      return;
    }

    // Create an image to validate and convert the URL
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      // Convert image to base64
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const base64String = canvas.toDataURL('image/jpeg', 0.9);

        // Check approximate size (base64 is ~33% larger than binary)
        if (base64String.length > 2.7 * 1024 * 1024) { // ~2MB
          showToast('Image from URL is too large. Try a smaller image.', 'error');
          return;
        }

        setFormData(prevData => ({
          ...prevData,
          photos: [...(prevData.photos || []), {
            id: Date.now() + Math.random(),
            data: base64String,
            name: url.split('/').pop() || 'image.jpg'
          }]
        }));
      } catch (error) {
        showToast('Could not load image from URL. Make sure the image URL is publicly accessible.', 'error');
      }
    };

    img.onerror = () => {
      showToast('Could not load image from URL. Make sure it\'s a valid image URL and publicly accessible.', 'error');
    };

    img.src = url;
  };

  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const currentPhotos = formData.photos || [];
    if (currentPhotos.length >= 10) {
      showToast('Maximum 10 photos per property', 'warning');
      e.preventDefault();
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();

        if (blob.size > 2 * 1024 * 1024) {
          showToast('Pasted image is too large. Maximum size is 2MB.', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prevData => ({
            ...prevData,
            photos: [...(prevData.photos || []), {
              id: Date.now() + Math.random(),
              data: event.target.result,
              name: `pasted-${Date.now()}.png`
            }]
          }));
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleDeletePhoto = (photoId) => {
    setFormData({
      ...formData,
      photos: (formData.photos || []).filter(photo => photo.id !== photoId)
    });
  };

  // Lightbox handlers
  const openLightbox = (photos, index) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextPhoto = useCallback(() => {
    setLightboxIndex((lightboxIndex + 1) % lightboxPhotos.length);
  }, [lightboxIndex, lightboxPhotos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length);
  }, [lightboxIndex, lightboxPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextPhoto, prevPhoto]);

  // ==================
  // BROKER CRUD OPERATIONS
  // ==================

  /**
   * Initialize broker form for adding new broker
   */
  const handleAddBroker = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      firmName: '',
      firmWebsite: '',
      crexiLink: '',
      licenseNumber: '',
      conversations: ''
    });
    setEditingId(null);
    setShowBrokerForm(true);
  };

  const handleEditBroker = (broker) => {
    setFormData(broker);
    setEditingId(broker.id);
    setShowBrokerForm(true);
  };

  const handleSaveBroker = async () => {
    if (!formData.name) {
      showToast('Please enter broker name', 'error');
      return;
    }

    try {
      if (editingId) {
        setBrokers(brokers.map(b => b.id === editingId ? { ...formData, id: editingId } : b));

        if (isSupabaseConfigured()) {
          await supabaseService.update('brokers', editingId, formData);
        }
      } else {
        if (isSupabaseConfigured()) {
          const savedBroker = await supabaseService.create('brokers', formData);
          if (savedBroker) {
            setBrokers([...brokers, savedBroker]);
          } else {
            setBrokers([...brokers, { ...formData, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          setBrokers([...brokers, { ...formData, id: Date.now() }]);
        }
      }

      setShowBrokerForm(false);
      setFormData({});
      showToast(editingId ? 'Broker updated' : 'Broker added', 'success');
    } catch (error) {
      console.error('Error saving broker:', error);
      showToast('Error saving broker', 'error');
    }
  };

  const handleDeleteBroker = (id) => {
    showConfirmDialog(
      'Delete Broker',
      'Are you sure you want to delete this broker? This action cannot be undone.',
      async () => {
        setBrokers(brokers.filter(b => b.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('brokers', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // ==================
  // GATEKEEPER CRUD OPERATIONS
  // ==================

  /**
   * Initialize gatekeeper form for adding new gatekeeper
   */
  const handleAddGatekeeper = () => {
    setFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      company: '',
      relatedTo: ''
    });
    setEditingId(null);
    setShowGatekeeperForm(true);
  };

  const handleEditGatekeeper = (gatekeeper) => {
    setFormData(gatekeeper);
    setEditingId(gatekeeper.id);
    setShowGatekeeperForm(true);
  };

  const handleSaveGatekeeper = async () => {
    if (!formData.name) {
      showToast('Please enter gatekeeper name', 'error');
      return;
    }

    try {
      if (editingId) {
        setGatekeepers(gatekeepers.map(g => g.id === editingId ? { ...formData, id: editingId } : g));

        if (isSupabaseConfigured()) {
          await supabaseService.update('gatekeepers', editingId, formData);
        }
      } else {
        if (isSupabaseConfigured()) {
          const savedGatekeeper = await supabaseService.create('gatekeepers', formData);
          if (savedGatekeeper) {
            setGatekeepers([...gatekeepers, savedGatekeeper]);
          } else {
            setGatekeepers([...gatekeepers, { ...formData, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          setGatekeepers([...gatekeepers, { ...formData, id: Date.now() }]);
        }
      }

      setShowGatekeeperForm(false);
      setFormData({});
      showToast(editingId ? 'Gatekeeper updated' : 'Gatekeeper added', 'success');
    } catch (error) {
      console.error('Error saving gatekeeper:', error);
      showToast('Error saving gatekeeper', 'error');
    }
  };

  const handleDeleteGatekeeper = (id) => {
    showConfirmDialog(
      'Delete Gatekeeper',
      'Are you sure you want to delete this gatekeeper? This action cannot be undone.',
      async () => {
        setGatekeepers(gatekeepers.filter(g => g.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('gatekeepers', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // Inline broker handlers (for quick-add within property form)
  const handleShowInlineBrokerForm = () => {
    setInlineBrokerData({
      name: '',
      email: '',
      phone: '',
      firmName: '',
      firmWebsite: '',
      crexiLink: '',
      licenseNumber: ''
    });
    setShowInlineBrokerForm(true);
  };

  const handleSaveInlineBroker = () => {
    if (!inlineBrokerData.name) {
      showToast('Please enter broker name', 'error');
      return;
    }

    const newBroker = { ...inlineBrokerData, id: Date.now(), conversations: '' };
    setBrokers([...brokers, newBroker]);

    // Auto-select the newly created broker
    setFormData({
      ...formData,
      brokerIds: [...(formData.brokerIds || []), newBroker.id]
    });

    setShowInlineBrokerForm(false);
    setInlineBrokerData({});
  };

  const handleToggleBroker = (brokerId) => {
    const currentBrokerIds = formData.brokerIds || [];
    if (currentBrokerIds.includes(brokerId)) {
      setFormData({
        ...formData,
        brokerIds: currentBrokerIds.filter(id => id !== brokerId)
      });
    } else {
      setFormData({
        ...formData,
        brokerIds: [...currentBrokerIds, brokerId]
      });
    }
  };

  // ==================
  // PARTNER CRUD OPERATIONS
  // ==================

  /**
   * Initialize partner form for adding new partner
   */
  const handleAddPartner = () => {
    setFormData({
      name: '',
      entityName: '',
      email: '',
      phone: '',
      checkSize: '',
      assetClasses: [],
      creExperience: '',
      background: '',
      riskTolerance: '',
      customTags: [],
      initialNotes: '',
      initialNoteCategory: 'general'
    });
    setEditingId(null);
    setShowPartnerForm(true);
  };

  const handleEditPartner = (partner) => {
    setFormData({
      ...partner,
      initialNotes: '',
      initialNoteCategory: 'general'
    });
    setEditingId(partner.id);
    setShowPartnerForm(true);
  };

  const handleSavePartner = async () => {
    if (!formData.name) {
      showToast('Please enter partner name', 'error');
      return;
    }

    try {
      // Prepare initial note if provided
      const initialNoteHistory = [];
      if (formData.initialNotes && formData.initialNotes.trim()) {
        initialNoteHistory.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          content: formData.initialNotes.trim(),
          category: formData.initialNoteCategory || 'general',
          edited: false
        });
      }

      // Remove initialNotes fields from saved data
      const { initialNotes, initialNoteCategory, ...partnerData } = formData;

      if (editingId) {
        const updatedPartner = partners.find(p => p.id === editingId);
        const updatedNoteHistory = initialNoteHistory.length > 0
          ? [...(updatedPartner.noteHistory || []), ...initialNoteHistory]
          : updatedPartner.noteHistory;

        const partnerWithNotes = { ...partnerData, noteHistory: updatedNoteHistory };

        setPartners(partners.map(p => p.id === editingId ? { ...partnerWithNotes, id: editingId } : p));

        if (isSupabaseConfigured()) {
          await supabaseService.update('partners', editingId, partnerWithNotes);
        }
      } else {
        const newPartner = {
          ...partnerData,
          noteHistory: initialNoteHistory
        };

        if (isSupabaseConfigured()) {
          const savedPartner = await supabaseService.create('partners', newPartner);
          if (savedPartner) {
            setPartners([...partners, savedPartner]);
          } else {
            setPartners([...partners, { ...newPartner, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          setPartners([...partners, { ...newPartner, id: Date.now() }]);
        }
      }

      setShowPartnerForm(false);
      setFormData({});
      showToast(editingId ? 'Partner updated' : 'Partner added', 'success');
    } catch (error) {
      console.error('Error saving partner:', error);
      showToast('Error saving partner', 'error');
    }
  };

  const handleDeletePartner = (id) => {
    showConfirmDialog(
      'Delete Partner',
      'Are you sure you want to delete this partner? This action cannot be undone.',
      async () => {
        setPartners(partners.filter(p => p.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('partners', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // ==================
  // EVENT CRUD OPERATIONS
  // ==================

  /**
   * Save or update event
   * @async
   * @param {Object} eventData - Event data object
   * @returns {Promise<boolean>} True if successful
   */
  const handleSaveEvent = async (eventData) => {
    if (!eventData.title || !eventData.date) {
      showToast('Please fill in event title and date', 'error');
      return false;
    }

    try {
      if (eventData.id && events.some(e => e.id === eventData.id)) {
        // Update existing event
        setEvents(events.map(e => e.id === eventData.id ? eventData : e));

        if (isSupabaseConfigured()) {
          await supabaseService.update('events', eventData.id, eventData);
        }
      } else {
        // Create new event
        const newEvent = { ...eventData, createdAt: eventData.createdAt || new Date().toISOString() };

        if (isSupabaseConfigured()) {
          const savedEvent = await supabaseService.create('events', newEvent);
          if (savedEvent) {
            setEvents([...events, savedEvent]);
          } else {
            setEvents([...events, { ...newEvent, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          setEvents([...events, { ...newEvent, id: Date.now() }]);
        }
      }

      showToast(eventData.id ? 'Event updated' : 'Event added', 'success');
      return true;
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('Error saving event', 'error');
      return false;
    }
  };

  const handleDeleteEvent = (id) => {
    showConfirmDialog(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      async () => {
        setEvents(events.filter(e => e.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('events', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // ==================
  // FOLLOW-UP CRUD OPERATIONS
  // ==================

  /**
   * Save or update follow-up
   * @async
   * @param {Object} followUpData - Follow-up data object
   * @returns {Promise<boolean>} True if successful
   */
  const handleSaveFollowUp = async (followUpData) => {
    if (!followUpData.contactName || !followUpData.dueDate) {
      showToast('Please fill in contact name and due date', 'error');
      return false;
    }

    try {
      // Prepare data with new contact fields
      const dataWithStatus = {
        ...followUpData,
        status: followUpData.status || 'pending',
        contactName: followUpData.contactName,
        contactId: followUpData.contactId || null,
        contactType: followUpData.contactType || 'manual',
        // For backward compatibility with existing code
        relatedContact: followUpData.contactId
          ? `${followUpData.contactType}-${followUpData.contactId}`
          : followUpData.contactName
      };

      if (followUpData.id && followUps.some(f => f.id === followUpData.id)) {
        // Update existing follow-up
        setFollowUps(followUps.map(f => f.id === followUpData.id ? dataWithStatus : f));

        if (isSupabaseConfigured()) {
          await supabaseService.update('follow_ups', followUpData.id, dataWithStatus);
        }
      } else {
        // Create new follow-up
        const newFollowUp = { ...dataWithStatus, createdAt: dataWithStatus.createdAt || new Date().toISOString() };

        if (isSupabaseConfigured()) {
          const savedFollowUp = await supabaseService.create('follow_ups', newFollowUp);
          if (savedFollowUp) {
            setFollowUps([...followUps, savedFollowUp]);
          } else {
            setFollowUps([...followUps, { ...newFollowUp, id: Date.now() }]);
            showToast('Saved locally only - Supabase error', 'warning');
          }
        } else {
          setFollowUps([...followUps, { ...newFollowUp, id: Date.now() }]);
        }
      }

      showToast(followUpData.id ? 'Follow-up updated' : 'Follow-up added', 'success');
      return true;
    } catch (error) {
      console.error('Error saving follow-up:', error);
      showToast('Error saving follow-up', 'error');
      return false;
    }
  };

  const handleDeleteFollowUp = (id) => {
    showConfirmDialog(
      'Delete Follow-up',
      'Are you sure you want to delete this follow-up? This action cannot be undone.',
      async () => {
        setFollowUps(followUps.filter(f => f.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('follow_ups', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }
      },
      'danger'
    );
  };

  // Contact Profile Helper
  const openContactProfile = (contactType, contactId) => {
    let contact = null;

    if (contactType === 'broker') {
      contact = brokers.find(b => b.id === contactId);
      if (contact) {
        setProfileContact({
          ...contact,
          contactType: 'broker',
          displayName: contact.name,
          company: contact.company || contact.firmName || ''
        });
      }
    } else if (contactType === 'partner') {
      contact = partners.find(p => p.id === contactId);
      if (contact) {
        setProfileContact({
          ...contact,
          contactType: 'partner',
          displayName: contact.name,
          company: contact.type || ''
        });
      }
    } else if (contactType === 'gatekeeper') {
      contact = gatekeepers.find(g => g.id === contactId);
      if (contact) {
        setProfileContact({
          ...contact,
          contactType: 'gatekeeper',
          displayName: contact.name,
          company: contact.company || ''
        });
      }
    }

    if (contact) {
      setViewingContactProfile(true);
    }
  };

  const openPropertyProfile = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setProfileProperty(property);
      setViewingPropertyProfile(true);
    }
  };

  // ==================
  // TEST DATA & UTILITIES
  // ==================

  /**
   * Load test data into application
   * Creates sample properties, brokers, partners, gatekeepers, events, and follow-ups
   */
  const loadTestData = () => {
    const loadData = async () => {
      const now = new Date().toISOString();
      const testBrokers = [
      { id: 1001, name: 'Sarah Mitchell', company: 'CBRE', email: 'sarah.mitchell@cbre.com', phone: '555-0101', noteHistory: [] },
      { id: 1002, name: 'James Chen', company: 'JLL', email: 'james.chen@jll.com', phone: '555-0102', noteHistory: [] },
      { id: 1003, name: 'Maria Rodriguez', company: 'Cushman & Wakefield', email: 'maria.r@cushwake.com', phone: '555-0103', noteHistory: [] },
      { id: 1004, name: 'David Park', company: 'Colliers', email: 'dpark@colliers.com', phone: '555-0104', noteHistory: [] }
    ];

    const testPartners = [
      { id: 2001, name: 'Redwood Capital Partners', type: 'Institutional', commitmentAmount: '5000000', email: 'ir@redwoodcp.com', phone: '555-0201', noteHistory: [{ id: 1, timestamp: now, content: 'Prefers value-add opportunities in industrial sector', category: 'general', edited: false }] },
      { id: 2002, name: 'Summit Equity Group', type: 'Family Office', commitmentAmount: '2500000', email: 'investments@summitequity.com', phone: '555-0202', noteHistory: [] },
      { id: 2003, name: 'Northstar Ventures', type: 'High Net Worth', commitmentAmount: '1000000', email: 'contact@northstarvc.com', phone: '555-0203', noteHistory: [] },
      { id: 2004, name: 'Pacific Industrial Fund', type: 'Institutional', commitmentAmount: '10000000', assetClass: 'CRE Lending', email: 'deals@pacificindustrial.com', phone: '555-0204', noteHistory: [] }
    ];

    const testGatekeepers = [
      { id: 3001, name: 'Jennifer Walsh', title: 'Investment Director', company: 'Redwood Capital Partners', email: 'jwalsh@redwoodcp.com', phone: '555-0301', relatedTo: 'Redwood Capital Partners' },
      { id: 3002, name: 'Robert Kim', title: 'Chief Investment Officer', company: 'Summit Equity Group', email: 'rkim@summitequity.com', phone: '555-0302', relatedTo: 'Summit Equity Group' },
      { id: 3003, name: 'Lisa Martinez', title: 'Senior Asset Manager', company: 'Pacific Industrial Fund', email: 'lmartinez@pacificindustrial.com', phone: '555-0303', relatedTo: 'Pacific Industrial Fund' }
    ];

    const testProperties = [
      {
        id: 4001,
        address: '2450 Industrial Parkway, Phoenix, AZ',
        squareFeet: '125000',
        monthlyBaseRentPerSqft: '0.85',
        purchasePrice: '8500000',
        improvements: '450000',
        closingCosts: '85000',
        ltvPercent: '70',
        interestRate: '5.75',
        loanTerm: '25',
        debtServiceType: 'standard',
        exitCapRate: '6.5',
        holdingPeriodMonths: '60',
        brokerIds: [1001],
        noteHistory: [
          { id: 1, timestamp: now, content: 'Single-tenant Amazon last-mile facility. 15-year NNN lease with 2% annual escalations.', category: 'general', edited: false }
        ],
        photos: []
      },
      {
        id: 4002,
        address: '7800 Distribution Center Dr, Dallas, TX',
        squareFeet: '215000',
        monthlyBaseRentPerSqft: '0.72',
        purchasePrice: '14200000',
        improvements: '0',
        closingCosts: '142000',
        ltvPercent: '65',
        interestRate: '5.5',
        loanTerm: '30',
        debtServiceType: 'standard',
        exitCapRate: '6.25',
        holdingPeriodMonths: '84',
        brokerIds: [1002, 1003],
        noteHistory: [
          { id: 1, timestamp: now, content: 'Multi-tenant Class A warehouse. Major tenants: FedEx (40%), UPS (35%), Home Depot (25%).', category: 'general', edited: false }
        ],
        photos: []
      },
      {
        id: 4003,
        address: '1250 Commerce Blvd, Atlanta, GA',
        squareFeet: '85000',
        monthlyBaseRentPerSqft: '0.95',
        purchasePrice: '6800000',
        improvements: '250000',
        closingCosts: '68000',
        ltvPercent: '75',
        interestRate: '6.0',
        loanTerm: '20',
        debtServiceType: 'standard',
        exitCapRate: '6.75',
        holdingPeriodMonths: '36',
        brokerIds: [1004],
        noteHistory: [],
        photos: []
      },
      {
        id: 4004,
        address: '9500 Logistics Way, Indianapolis, IN',
        squareFeet: '175000',
        monthlyBaseRentPerSqft: '0.68',
        purchasePrice: '10500000',
        improvements: '850000',
        closingCosts: '105000',
        ltvPercent: '70',
        interestRate: '5.85',
        loanTerm: '25',
        debtServiceType: 'interestOnly',
        exitCapRate: '6.5',
        holdingPeriodMonths: '60',
        brokerIds: [1001, 1002],
        noteHistory: [
          { id: 1, timestamp: now, content: 'Cold storage facility. Tenant: Sysco Foods. 20-year absolute NNN lease.', category: 'general', edited: false },
          { id: 2, timestamp: now, content: 'Excellent refrigeration infrastructure - recent $1.2M upgrade included in improvements.', category: 'financial', edited: false }
        ],
        photos: []
      },
      {
        id: 4005,
        address: '3320 Freeway Industrial Park, Charlotte, NC',
        squareFeet: '95000',
        monthlyBaseRentPerSqft: '0.78',
        purchasePrice: '6200000',
        improvements: '180000',
        closingCosts: '62000',
        ltvPercent: '68',
        interestRate: '5.65',
        loanTerm: '30',
        debtServiceType: 'standard',
        exitCapRate: '6.35',
        holdingPeriodMonths: '48',
        brokerIds: [1003],
        noteHistory: [
          { id: 1, timestamp: now, content: 'Flex industrial space. Current tenant: regional manufacturing firm with 12-year lease remaining.', category: 'general', edited: false }
        ],
        photos: []
      }
    ];

    const testFollowUps = [
      {
        id: 5001,
        contactName: 'Sarah Mitchell (CBRE)',
        type: 'Call',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago (overdue)
        priority: 'High',
        notes: 'Follow up on Phoenix property - buyer is very interested',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5002,
        contactName: 'James Chen (JLL)',
        type: 'Meeting',
        dueDate: new Date().toISOString().split('T')[0], // Today
        priority: 'Medium',
        notes: 'Quarterly portfolio review meeting',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5003,
        contactName: 'Jennifer Walsh (Redwood Capital)',
        type: 'Email',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        priority: 'Medium',
        notes: 'Send updated investment deck for Dallas property',
        status: 'pending',
        createdAt: now
      },
      {
        id: 5004,
        contactName: 'Maria Rodriguez (C&W)',
        type: 'Property Tour',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        priority: 'High',
        notes: 'Schedule tour of Atlanta property with potential buyer',
        status: 'pending',
        createdAt: now
      }
    ];

    const testEvents = [
      {
        id: 6001,
        title: 'Phoenix Property Tour - Amazon Facility',
        type: 'Property Tour',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow 2pm
        location: '2450 Industrial Parkway, Phoenix, AZ',
        description: 'Showing property to potential institutional buyer',
        createdAt: now
      },
      {
        id: 6002,
        title: 'Due Diligence Deadline - Dallas Property',
        type: 'Due Diligence Deadline',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 1 week from now
        location: '7800 Distribution Center Dr, Dallas, TX',
        description: 'Final day to complete environmental and structural inspections',
        createdAt: now
      },
      {
        id: 6003,
        title: 'Redwood Capital Investor Presentation',
        type: 'Partner Presentation',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 3 days from now
        location: 'Redwood Capital Offices',
        description: 'Q4 portfolio performance review and 2024 pipeline discussion',
        createdAt: now
      },
      {
        id: 6004,
        title: 'Closing - Atlanta Property',
        type: 'Closing Date',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 2 weeks from now
        location: '1250 Commerce Blvd, Atlanta, GA',
        description: 'Final closing and transfer of ownership',
        createdAt: now
      },
      {
        id: 6005,
        title: 'Broker Meeting - JLL Team',
        type: 'Broker Meeting',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 4 days from now
        location: 'JLL Offices - Downtown',
        description: 'Review new listings in industrial corridor',
        createdAt: now
      }
    ];

      try {
        if (!isSupabaseConfigured()) {
          alert('ERROR: Supabase is not configured. Please set up your environment variables to use this feature.');
          return;
        }

        // Load to Supabase - remove id field so DB can auto-generate UUIDs
        await Promise.all([
          supabaseService.bulkInsert('brokers', testBrokers.map(({ id, ...rest }) => rest)),
          supabaseService.bulkInsert('partners', testPartners.map(({ id, ...rest }) => rest)),
          supabaseService.bulkInsert('gatekeepers', testGatekeepers.map(({ id, ...rest }) => rest)),
          supabaseService.bulkInsert('properties', testProperties.map(({ id, brokerIds, ...rest }) => ({ ...rest, brokerIds: [] }))),
          supabaseService.bulkInsert('follow_ups', testFollowUps.map(({ id, ...rest }) => rest)),
          supabaseService.bulkInsert('events', testEvents.map(({ id, ...rest }) => rest))
        ]);

        // Reload from Supabase to get the new IDs
        const [dbProperties, dbBrokers, dbPartners, dbGatekeepers, dbEvents, dbFollowUps] = await Promise.all([
          supabaseService.getAll('properties'),
          supabaseService.getAll('brokers'),
          supabaseService.getAll('partners'),
          supabaseService.getAll('gatekeepers'),
          supabaseService.getAll('events'),
          supabaseService.getAll('follow_ups')
        ]);

        setProperties(dbProperties || []);
        setBrokers(dbBrokers || []);
        setPartners(dbPartners || []);
        setGatekeepers(dbGatekeepers || []);
        setEvents(dbEvents || []);
        setFollowUps(dbFollowUps || []);

        showToast('Test data loaded to cloud! 5 properties, 4 brokers, 4 partners, 3 gatekeepers, 4 follow-ups, and 5 events.', 'success');
      } catch (error) {
        console.error('Error loading test data:', error);
        showToast('Error loading test data. Check console for details.', 'error');
      }
    };

    showConfirmDialog(
      'Load Sample Data',
      'This will load sample data into your CRM. Continue?',
      loadData,
      'warning'
    );
  };

  const clearAllData = () => {
    const performClear = async () => {
      try {
        if (!isSupabaseConfigured()) {
          alert('ERROR: Supabase is not configured. Please set up your environment variables to use this feature.');
          return;
        }

        // Clear all data from Supabase
        const tables = ['properties', 'brokers', 'partners', 'gatekeepers', 'events', 'follow_ups'];

        for (const table of tables) {
          const items = await supabaseService.getAll(table);
          if (items && items.length > 0) {
            await Promise.all(items.map(item => supabaseService.delete(table, item.id)));
          }
        }

        // Clear local state
        setProperties([]);
        setBrokers([]);
        setPartners([]);
        setGatekeepers([]);
        setEvents([]);
        setFollowUps([]);
        setSensitivityTable(null);
        setSensitivityPropertyId(null);

        showToast('All cloud data has been cleared.', 'success');
      } catch (error) {
        console.error('Error clearing data:', error);
        showToast('Error clearing data. Check console for details.', 'error');
      }
    };

    showConfirmDialog(
      '⚠️ Clear All Data',
      'WARNING: This will permanently delete ALL data including properties, brokers, partners, gatekeepers, events, and follow-ups. This action cannot be undone. Are you absolutely sure?',
      performClear,
      'danger'
    );
  };

  // Calculate IRR (Internal Rate of Return) using Newton-Raphson method
  const calculateIRR = (cashFlows) => {
    // cashFlows array: [initial investment (negative), year 1, year 2, ..., year N]
    if (!cashFlows || cashFlows.length < 2) return 0;

    // Check if all cash flows are the same sign (no IRR exists)
    const allPositive = cashFlows.every(cf => cf >= 0);
    const allNegative = cashFlows.every(cf => cf <= 0);
    if (allPositive || allNegative) return 0;

    // NPV function for a given rate
    const npv = (rate) => {
      return cashFlows.reduce((sum, cf, index) => {
        return sum + cf / Math.pow(1 + rate, index);
      }, 0);
    };

    // Derivative of NPV for Newton-Raphson
    const npvDerivative = (rate) => {
      return cashFlows.reduce((sum, cf, index) => {
        if (index === 0) return sum;
        return sum - (index * cf) / Math.pow(1 + rate, index + 1);
      }, 0);
    };

    // Newton-Raphson iteration
    let guess = 0.1; // Start with 10% guess
    const maxIterations = 100;
    const tolerance = 0.00001;

    for (let i = 0; i < maxIterations; i++) {
      const npvValue = npv(guess);
      const npvDerivValue = npvDerivative(guess);

      // Avoid division by zero
      if (Math.abs(npvDerivValue) < 0.000001) break;

      const newGuess = guess - npvValue / npvDerivValue;

      // Check for convergence
      if (Math.abs(newGuess - guess) < tolerance) {
        return newGuess * 100; // Return as percentage
      }

      guess = newGuess;

      // Prevent unrealistic values
      if (guess < -0.99 || guess > 10) return 0;
    }

    return guess * 100; // Return as percentage
  };

  // Calculate comprehensive metrics
  const calculateMetrics = (prop) => {
    // Parse inputs (strip commas)
    const sqft = parseFloat(stripCommas(prop.squareFeet)) || 0;
    const monthlyBaseRent = parseFloat(prop.monthlyBaseRentPerSqft) || 0;
    const purchasePrice = parseFloat(stripCommas(prop.purchasePrice)) || 0;
    const improvements = parseFloat(stripCommas(prop.improvements)) || 0;
    const closingCosts = parseFloat(stripCommas(prop.closingCosts)) || 0;
    const ltvPercent = parseFloat(prop.ltvPercent) || 0;
    const interestRate = parseFloat(prop.interestRate) || 0;
    const loanTerm = parseFloat(prop.loanTerm) || 30;
    const debtServiceType = prop.debtServiceType || 'standard';
    const exitCapRate = parseFloat(prop.exitCapRate) || 0;
    const holdingPeriodMonths = parseFloat(prop.holdingPeriodMonths) || 0;

    // Calculate All-in Cost
    const allInCost = purchasePrice + improvements + closingCosts;

    // Calculate Monthly & Annual Rent (NNN - no expenses)
    const monthlyRent = sqft * monthlyBaseRent;
    const annualRent = monthlyRent * 12;
    const noi = annualRent; // NNN: NOI = Rent since tenant pays expenses

    // Calculate Financing
    const loanAmount = allInCost * (ltvPercent / 100);
    const equityRequired = allInCost - loanAmount;

    // Calculate Debt Service
    let monthlyDebtService = 0;
    if (loanAmount > 0 && interestRate > 0) {
      if (debtServiceType === 'interestOnly') {
        monthlyDebtService = loanAmount * (interestRate / 100 / 12);
      } else {
        monthlyDebtService = calculateAmortizationPayment(loanAmount, interestRate, loanTerm);
      }
    }
    const annualDebtService = monthlyDebtService * 12;

    // Calculate Operating Metrics
    const dscr = monthlyDebtService > 0 ? (noi / 12) / monthlyDebtService : 0;
    const annualCashFlow = noi - annualDebtService;
    const capRate = allInCost > 0 ? (noi / allInCost) * 100 : 0;
    const cashOnCash = equityRequired > 0 ? (annualCashFlow / equityRequired) * 100 : 0;

    // Calculate Exit Metrics
    const exitValue = exitCapRate > 0 ? noi / (exitCapRate / 100) : 0;
    let remainingLoanBalance = loanAmount;
    if (debtServiceType === 'standard' && holdingPeriodMonths > 0 && interestRate > 0) {
      remainingLoanBalance = calculateRemainingBalance(loanAmount, interestRate, loanTerm, holdingPeriodMonths);
    }
    const netProceedsAtExit = exitValue - remainingLoanBalance;
    const equityMultiple = equityRequired > 0 ? netProceedsAtExit / equityRequired : 0;

    // Calculate IRR (Internal Rate of Return)
    let irr = 0;
    if (holdingPeriodMonths > 0 && equityRequired > 0) {
      const holdingPeriodYears = holdingPeriodMonths / 12;
      const cashFlows = [];

      // Year 0: Initial equity investment (negative)
      cashFlows.push(-equityRequired);

      // Years 1 through N: Annual cash flows
      for (let year = 1; year <= Math.floor(holdingPeriodYears); year++) {
        cashFlows.push(annualCashFlow);
      }

      // Final year: Add exit proceeds to final cash flow
      if (cashFlows.length > 1) {
        cashFlows[cashFlows.length - 1] += netProceedsAtExit;
      } else {
        // If holding period < 1 year, still calculate with single period
        cashFlows.push(annualCashFlow * (holdingPeriodMonths / 12) + netProceedsAtExit);
      }

      irr = calculateIRR(cashFlows);
    }

    return {
      allInCost,
      monthlyRent,
      annualRent,
      noi,
      loanAmount,
      equityRequired,
      monthlyDebtService,
      annualDebtService,
      dscr,
      annualCashFlow,
      capRate,
      cashOnCash,
      exitValue,
      remainingLoanBalance,
      netProceedsAtExit,
      equityMultiple,
      irr
    };
  };

  // Generate sensitivity analysis table
  const generateSensitivityTable = (property, rowVar, colVar, rowMin, rowMax, colMin, colMax) => {
    const gridSize = 7; // 7x7 table

    // Define variable metadata
    const varMetadata = {
      monthlyBaseRentPerSqft: { label: 'Monthly Rent/SF', format: (v) => `$${v.toFixed(2)}`, isPercent: false },
      purchasePrice: { label: 'Purchase Price', format: (v) => formatCurrency(v), isPercent: false },
      improvements: { label: 'Improvements', format: (v) => formatCurrency(v), isPercent: false },
      closingCosts: { label: 'Closing Costs', format: (v) => formatCurrency(v), isPercent: false },
      ltvPercent: { label: 'LTV %', format: (v) => `${v.toFixed(1)}%`, isPercent: true },
      interestRate: { label: 'Interest Rate', format: (v) => `${v.toFixed(2)}%`, isPercent: true },
      exitCapRate: { label: 'Exit Cap Rate', format: (v) => `${v.toFixed(2)}%`, isPercent: true },
      holdingPeriodMonths: { label: 'Holding Period (months)', format: (v) => `${Math.round(v)}m`, isPercent: false }
    };

    // Parse min/max values
    const rowMinVal = parseFloat(rowMin) || 0;
    const rowMaxVal = parseFloat(rowMax) || 0;
    const colMinVal = parseFloat(colMin) || 0;
    const colMaxVal = parseFloat(colMax) || 0;

    if (rowMinVal >= rowMaxVal || colMinVal >= colMaxVal) {
      return null; // Invalid ranges
    }

    // Generate row and column values
    const rowStep = (rowMaxVal - rowMinVal) / (gridSize - 1);
    const colStep = (colMaxVal - colMinVal) / (gridSize - 1);

    const rowValues = Array.from({ length: gridSize }, (_, i) => rowMinVal + (i * rowStep));
    const colValues = Array.from({ length: gridSize }, (_, i) => colMinVal + (i * colStep));

    // Generate table data
    const tableData = rowValues.map(rowVal => {
      return colValues.map(colVal => {
        // Create modified property
        const modifiedProp = {
          ...property,
          [rowVar]: rowVar === 'monthlyBaseRentPerSqft' ? rowVal.toFixed(2) : rowVal.toString(),
          [colVar]: colVar === 'monthlyBaseRentPerSqft' ? colVal.toFixed(2) : colVal.toString()
        };

        // Calculate metrics for this scenario
        const metrics = calculateMetrics(modifiedProp);

        return {
          rowVal,
          colVal,
          equityMultiple: metrics.equityMultiple,
          dscr: metrics.dscr,
          cashOnCash: metrics.cashOnCash,
          capRate: metrics.capRate,
          annualCashFlow: metrics.annualCashFlow,
          netProceedsAtExit: metrics.netProceedsAtExit,
          noi: metrics.noi,
          irr: metrics.irr
        };
      });
    });

    return {
      rowValues,
      colValues,
      tableData,
      rowVar,
      colVar,
      rowLabel: varMetadata[rowVar]?.label || rowVar,
      colLabel: varMetadata[colVar]?.label || colVar,
      rowFormat: varMetadata[rowVar]?.format || ((v) => v.toFixed(2)),
      colFormat: varMetadata[colVar]?.format || ((v) => v.toFixed(2))
    };
  };

  const filteredProperties = properties.filter(p =>
    p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.crexi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic classes based on dark mode
  const bgClass = darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100';
  const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const borderClass = darkMode ? 'border-slate-700' : 'border-slate-200';
  const inputBgClass = darkMode ? 'bg-slate-700' : 'bg-white';
  const inputBorderClass = darkMode ? 'border-slate-600' : 'border-slate-300';
  const inputTextClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const hoverBgClass = darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100';
  const metricsBgClass = darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50';

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated and Supabase is configured
  if (!user && supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center px-4">
          <div className="mb-8">
            <Building2 size={64} className="mx-auto text-blue-400 mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">NNN CRM</h1>
            <p className="text-slate-300 text-lg">Industrial Property Management</p>
            <p className="text-slate-500 text-xs mt-2">Build: Nov 18 2025 - v3</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition shadow-lg flex items-center gap-3 mx-auto"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-slate-400 text-sm mt-6">Authorized access only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 ${darkMode ? 'bg-slate-800' : 'bg-white'} border-r ${borderClass} overflow-y-auto z-20`}>
        {/* Logo/Title */}
        <div className={`p-6 border-b ${borderClass}`}>
          <h1 className={`text-xl font-bold ${textClass}`}>Industrial CRM</h1>
          <p className={`${textSecondaryClass} text-xs mt-1`}>NNN Property Management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1" role="navigation" aria-label="Main navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition min-h-[44px] ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
            aria-label="Dashboard"
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          >
            <TrendingUp size={20} aria-hidden="true" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('followups')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition min-h-[44px] ${
              activeTab === 'followups'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
            aria-label={`Follow-ups (${followUps.filter(f => f.status !== 'completed').length} pending)`}
            aria-current={activeTab === 'followups' ? 'page' : undefined}
          >
            <Bell size={20} aria-hidden="true" />
            <div className="flex-1 text-left">Follow-ups</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'followups'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`} aria-label={`${followUps.filter(f => f.status !== 'completed').length} pending follow-ups`}>
              {followUps.filter(f => f.status !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition min-h-[44px] ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
            aria-label={`Calendar (${events.length} events)`}
            aria-current={activeTab === 'calendar' ? 'page' : undefined}
          >
            <Calendar size={20} aria-hidden="true" />
            <div className="flex-1 text-left">Calendar</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'calendar'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`} aria-label={`${events.length} events`}>
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition min-h-[44px] ${
              activeTab === 'assets'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
            aria-label={`Assets (${properties.length} properties)`}
            aria-current={activeTab === 'assets' ? 'page' : undefined}
          >
            <Building2 size={20} />
            <div className="flex-1 text-left">Assets</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'assets'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {properties.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('brokers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'brokers'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
          >
            <Target size={20} />
            <div className="flex-1 text-left">Brokers</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'brokers'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {brokers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gatekeepers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'gatekeepers'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
          >
            <AlertCircle size={20} />
            <div className="flex-1 text-left">Gatekeepers</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'gatekeepers'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {gatekeepers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'partners'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
          >
            <DollarSign size={20} />
            <div className="flex-1 text-left">Partners</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'partners'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {partners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'contacts'
                ? 'bg-blue-600 text-white'
                : `${textSecondaryClass} ${hoverBgClass}`
            }`}
          >
            <Search size={20} />
            <div className="flex-1 text-left">All Contacts</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === 'contacts'
                ? (darkMode ? 'bg-blue-400 text-blue-900' : 'bg-white text-blue-600')
                : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-800')
            }`}>
              {brokers.length + gatekeepers.length}
            </span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${borderClass} ${darkMode ? 'bg-slate-800' : 'bg-white'} space-y-2`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${hoverBgClass} transition`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-600" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user && supabase && (
            <button
              onClick={signOut}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Sign out of your account"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ml-64 min-h-screen ${bgClass}`}>
        {/* Header */}
        <div className={`${cardBgClass} border-b ${borderClass} sticky top-0 z-10 shadow-sm`}>
          <div className="px-6 py-4">
            <h2 className={`text-2xl font-bold ${textClass}`}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'followups' && 'Follow-ups'}
              {activeTab === 'calendar' && 'Calendar'}
              {activeTab === 'assets' && 'Assets'}
              {activeTab === 'brokers' && 'Brokers'}
              {activeTab === 'gatekeepers' && 'Gatekeepers'}
              {activeTab === 'partners' && 'Partners'}
              {activeTab === 'contacts' && 'All Contacts'}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Dashboard View Selector */}
            <div className={`${cardBgClass} rounded-lg shadow-sm border ${borderClass} p-1 flex gap-1`}>
              <button
                onClick={() => setDashboardView('communication')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition text-sm ${
                  dashboardView === 'communication'
                    ? 'bg-blue-600 text-white shadow'
                    : `${textSecondaryClass} hover:bg-slate-100 ${darkMode ? 'hover:bg-slate-700' : ''}`
                }`}
              >
                🗣️ Communication
              </button>
              <button
                onClick={() => setDashboardView('today')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition text-sm ${
                  dashboardView === 'today'
                    ? 'bg-blue-600 text-white shadow'
                    : `${textSecondaryClass} hover:bg-slate-100 ${darkMode ? 'hover:bg-slate-700' : ''}`
                }`}
              >
                ⚡ Today
              </button>
              <button
                onClick={() => setDashboardView('weekly')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition text-sm ${
                  dashboardView === 'weekly'
                    ? 'bg-blue-600 text-white shadow'
                    : `${textSecondaryClass} hover:bg-slate-100 ${darkMode ? 'hover:bg-slate-700' : ''}`
                }`}
              >
                📅 Weekly
              </button>
              <button
                onClick={() => setDashboardView('analytics')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition text-sm ${
                  dashboardView === 'analytics'
                    ? 'bg-blue-600 text-white shadow'
                    : `${textSecondaryClass} hover:bg-slate-100 ${darkMode ? 'hover:bg-slate-700' : ''}`
                }`}
              >
                📊 Analytics
              </button>
            </div>

            {/* Communication View */}
            {dashboardView === 'communication' && (
              <>
                {/* Relationship Status Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hot Relationships */}
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border-l-4 border-red-500 ${borderClass}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔥</span>
                      <h3 className={`text-lg font-bold ${textClass}`}>Hot</h3>
                    </div>
                    <div className={`text-2xl font-bold ${textClass} mb-2`}>
                      {(() => {
                        const recentContacts = [...brokers, ...partners, ...gatekeepers]
                          .filter(contact => {
                            const recentFollowUps = followUps.filter(f =>
                              f.relatedContact === `${contact.contactType || 'broker'}-${contact.id}` &&
                              new Date(f.createdAt || f.dueDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            );
                            const recentEvents = events.filter(e => {
                              const type = contact.contactType === 'partner' ? 'partners' : contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
                              return e.taggedContacts?.[type]?.includes(contact.id) &&
                                new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            });
                            return (recentFollowUps.length + recentEvents.length) >= 2;
                          });
                        return recentContacts.length;
                      })()}
                    </div>
                    <p className={`text-xs ${textSecondaryClass}`}>Active in last 7 days</p>
                  </div>

                  {/* Warming Relationships */}
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border-l-4 border-yellow-500 ${borderClass}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🌡️</span>
                      <h3 className={`text-lg font-bold ${textClass}`}>Warming</h3>
                    </div>
                    <div className={`text-2xl font-bold ${textClass} mb-2`}>
                      {(() => {
                        const warmingContacts = [...brokers, ...partners, ...gatekeepers]
                          .filter(contact => {
                            const recentFollowUps = followUps.filter(f =>
                              f.relatedContact === `${contact.contactType || 'broker'}-${contact.id}` &&
                              new Date(f.createdAt || f.dueDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
                              new Date(f.createdAt || f.dueDate) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            );
                            const recentEvents = events.filter(e => {
                              const type = contact.contactType === 'partner' ? 'partners' : contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
                              return e.taggedContacts?.[type]?.includes(contact.id) &&
                                new Date(e.date) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
                                new Date(e.date) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            });
                            return (recentFollowUps.length + recentEvents.length) >= 1;
                          });
                        return warmingContacts.length;
                      })()}
                    </div>
                    <p className={`text-xs ${textSecondaryClass}`}>Some activity (7-14 days)</p>
                  </div>

                  {/* Cold Relationships */}
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border-l-4 border-blue-400 ${borderClass}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">❄️</span>
                      <h3 className={`text-lg font-bold ${textClass}`}>Need Attention</h3>
                    </div>
                    <div className={`text-2xl font-bold ${textClass} mb-2`}>
                      {(() => {
                        const coldContacts = [...brokers, ...partners, ...gatekeepers]
                          .filter(contact => {
                            const recentFollowUps = followUps.filter(f =>
                              f.relatedContact === `${contact.contactType || 'broker'}-${contact.id}` &&
                              new Date(f.createdAt || f.dueDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            );
                            const recentEvents = events.filter(e => {
                              const type = contact.contactType === 'partner' ? 'partners' : contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
                              return e.taggedContacts?.[type]?.includes(contact.id) &&
                                new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            });
                            return (recentFollowUps.length + recentEvents.length) === 0;
                          });
                        return coldContacts.length;
                      })()}
                    </div>
                    <p className={`text-xs ${textSecondaryClass}`}>No activity in 30+ days</p>
                  </div>
                </div>

                {/* Recent Interactions Feed */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                      <MessageSquare size={20} />
                      Recent Interactions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const interactions = [
                        ...followUps.map(f => ({ ...f, type: 'followup', timestamp: f.completedAt || f.dueDate })),
                        ...events.map(e => ({ ...e, type: 'event', timestamp: e.date }))
                      ]
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10);

                      if (interactions.length === 0) {
                        return (
                          <div className={`text-center py-8 ${textSecondaryClass}`}>
                            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No recent interactions yet</p>
                          </div>
                        );
                      }

                      return interactions.map((item, idx) => {
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(item.timestamp).getTime();
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const days = Math.floor(hours / 24);
                          if (days > 0) return `${days}d ago`;
                          if (hours > 0) return `${hours}h ago`;
                          return 'Just now';
                        })();

                        if (item.type === 'followup') {
                          return (
                            <div key={`interaction-followup-${item.id}-${idx}`} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} border ${borderClass}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {item.status === 'completed' ? (
                                      <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                      <Clock size={16} className="text-yellow-500" />
                                    )}
                                    <span className={`text-sm font-semibold ${textClass}`}>{item.contactName}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                      {item.type}
                                    </span>
                                    <span className={`text-xs ${textSecondaryClass}`}>{timeAgo}</span>
                                  </div>
                                  {item.notes && (
                                    <p className={`text-xs ${textSecondaryClass} mt-1 line-clamp-1`}>{item.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={`interaction-event-${item.id}-${idx}`} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} border ${borderClass}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-500" />
                                    <span className={`text-sm font-semibold ${textClass}`}>{item.title}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                      {item.type}
                                    </span>
                                    <span className={`text-xs ${textSecondaryClass}`}>{timeAgo}</span>
                                  </div>
                                  {item.location && (
                                    <p className={`text-xs ${textSecondaryClass} mt-1`}>📍 {item.location}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      });
                    })()}
                  </div>
                </div>

                {/* Priority Contacts - Need Attention */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                      <AlertCircle size={20} className="text-orange-500" />
                      Contacts Needing Attention
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const needsAttention = [...brokers, ...partners, ...gatekeepers]
                        .map(contact => {
                          const lastFollowUp = followUps
                            .filter(f => f.relatedContact === `${contact.contactType || 'broker'}-${contact.id}`)
                            .sort((a, b) => new Date(b.completedAt || b.dueDate) - new Date(a.completedAt || a.dueDate))[0];

                          const lastEvent = events
                            .filter(e => {
                              const type = contact.contactType === 'partner' ? 'partners' : contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
                              return e.taggedContacts?.[type]?.includes(contact.id);
                            })
                            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                          const lastInteraction = lastFollowUp && lastEvent
                            ? new Date(lastFollowUp.completedAt || lastFollowUp.dueDate) > new Date(lastEvent.date)
                              ? lastFollowUp.completedAt || lastFollowUp.dueDate
                              : lastEvent.date
                            : lastFollowUp
                              ? lastFollowUp.completedAt || lastFollowUp.dueDate
                              : lastEvent?.date;

                          const daysSinceInteraction = lastInteraction
                            ? Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))
                            : 999;

                          return { contact, daysSinceInteraction, lastInteraction };
                        })
                        .filter(({ daysSinceInteraction }) => daysSinceInteraction > 14)
                        .sort((a, b) => b.daysSinceInteraction - a.daysSinceInteraction)
                        .slice(0, 5);

                      if (needsAttention.length === 0) {
                        return (
                          <div className={`text-center py-8 ${textSecondaryClass}`}>
                            <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                            <p>All contacts have recent activity!</p>
                          </div>
                        );
                      }

                      return needsAttention.map(({ contact, daysSinceInteraction, lastInteraction }) => (
                        <div key={`need-attention-${contact.id}`} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-orange-50'} border-l-4 border-orange-500`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${textClass}`}>{contact.name}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-orange-200'} ${textSecondaryClass}`}>
                                  {contact.contactType || 'broker'}
                                </span>
                              </div>
                              <p className={`text-xs ${textSecondaryClass} mt-1`}>
                                {lastInteraction
                                  ? `Last contact: ${daysSinceInteraction} days ago`
                                  : 'No interactions yet'}
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setFormData({
                                    contactName: contact.name,
                                    relatedContact: `${contact.contactType || 'broker'}-${contact.id}`
                                  });
                                  setEditingId(null);
                                  setShowFollowUpForm(true);
                                  setActiveTab('followups');
                                }}
                                className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition"
                                title="Schedule follow-up"
                              >
                                <Phone size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setFormData({});
                      setEditingId(null);
                      setShowFollowUpForm(true);
                      setActiveTab('followups');
                    }}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow"
                  >
                    <Phone size={20} />
                    <span>Log Call</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ type: 'Email' });
                      setEditingId(null);
                      setShowFollowUpForm(true);
                      setActiveTab('followups');
                    }}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow"
                  >
                    <Mail size={20} />
                    <span>Log Email</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ type: 'Meeting' });
                      setEditingId(null);
                      setShowEventForm(true);
                      setActiveTab('calendar');
                    }}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow"
                  >
                    <Video size={20} />
                    <span>Schedule Meeting</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({});
                      setEditingId(null);
                      setShowFollowUpForm(true);
                      setActiveTab('followups');
                    }}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition shadow"
                  >
                    <MessageSquare size={20} />
                    <span>Add Note</span>
                  </button>
                </div>
              </>
            )}

            {/* Today View */}
            {dashboardView === 'today' && (
              <>
                {/* Quick Actions Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setShowFollowUpForm(true);
                  setActiveTab('followups');
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow"
              >
                <Phone size={20} />
                <span>New Call</span>
              </button>
              <button
                onClick={() => {
                  setFormData({ type: 'Email' });
                  setEditingId(null);
                  setShowFollowUpForm(true);
                  setActiveTab('followups');
                }}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow"
              >
                <Mail size={20} />
                <span>New Email</span>
              </button>
              <button
                onClick={() => {
                  setFormData({ type: 'Meeting' });
                  setEditingId(null);
                  setShowEventForm(true);
                  setActiveTab('calendar');
                }}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow"
              >
                <Video size={20} />
                <span>Schedule Meeting</span>
              </button>
              <button
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setShowFollowUpForm(true);
                  setActiveTab('followups');
                }}
                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition shadow"
              >
                <MessageSquare size={20} />
                <span>Add Note</span>
              </button>
            </div>

            {/* Today's Agenda */}
            <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border-l-4 border-blue-500 ${borderClass}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={24} className="text-blue-500" />
                <div>
                  <h3 className={`text-xl font-bold ${textClass}`}>Today's Agenda</h3>
                  <p className={`text-xs ${textSecondaryClass}`}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todaysFollowUps = followUps.filter(f => {
                  if (f.status === 'completed') return false;
                  const dueDate = new Date(f.dueDate);
                  dueDate.setHours(0, 0, 0, 0);
                  return dueDate <= today;
                });

                const todaysEvents = events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate >= today && eventDate < tomorrow;
                });

                const hasItems = todaysFollowUps.length > 0 || todaysEvents.length > 0;

                return hasItems ? (
                  <div className="space-y-2">
                    {todaysFollowUps.map(followUp => {
                      const overdue = isOverdue(followUp.dueDate);
                      return (
                        <div key={`today-followup-${followUp.id}`} className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-red-50'} border-l-4 ${overdue ? 'border-red-500' : 'border-yellow-500'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {overdue ? <AlertCircle size={18} className="text-red-500" /> : <Clock size={18} className="text-yellow-500" />}
                                <span className={`font-semibold ${textClass}`}>{followUp.contactName}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-white'}`}>{followUp.type}</span>
                                {overdue && <span className="text-xs font-semibold text-red-500">OVERDUE</span>}
                              </div>
                              {followUp.notes && (
                                <div className={`ml-6 mt-2 p-2 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-100'}`}>
                                  <p className={`text-sm ${textClass} leading-relaxed whitespace-pre-wrap`}>{followUp.notes}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f));
                                showToast(`Follow-up with ${followUp.contactName} completed!`, 'success');
                              }}
                              className="ml-4 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center gap-1"
                            >
                              <CheckCircle size={16} />
                              Done
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {todaysEvents.map(event => (
                      <div key={`today-event-${event.id}`} className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-blue-500" />
                          <span className={`font-semibold ${textClass}`}>{event.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-white'}`}>{event.type}</span>
                        </div>
                        {event.location && <p className={`text-sm ${textSecondaryClass} ml-6 mt-1`}>📍 {event.location}</p>}
                        <p className={`text-xs ${textSecondaryClass} ml-6 mt-1`}>{formatDateTime(event.date)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textSecondaryClass}`}>
                    <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium">All clear for today!</p>
                    <p className="text-sm mt-1">No follow-ups or events scheduled</p>
                  </div>
                );
              })()}
            </div>

            {/* Communication Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`${cardBgClass} rounded-lg shadow p-3 border ${borderClass}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Active Follow-ups</div>
                  <Bell size={18} className="text-orange-500" />
                </div>
                <div className={`text-2xl font-bold ${textClass}`}>
                  {followUps.filter(f => f.status !== 'completed').length}
                </div>
                <div className={`text-xs ${textSecondaryClass} mt-0.5`}>
                  {followUps.filter(f => isOverdue(f.dueDate) && f.status !== 'completed').length} overdue • {followUps.filter(f => isDueToday(f.dueDate) && f.status !== 'completed').length} due today
                </div>
              </div>

              <div className={`${cardBgClass} rounded-lg shadow p-3 border ${borderClass}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Upcoming Events</div>
                  <Calendar size={18} className="text-blue-500" />
                </div>
                <div className={`text-2xl font-bold ${textClass}`}>
                  {events.filter(e => new Date(e.date) >= new Date()).length}
                </div>
                <div className={`text-xs ${textSecondaryClass} mt-0.5`}>
                  Next 7 days
                </div>
              </div>

              <div className={`${cardBgClass} rounded-lg shadow p-3 border ${borderClass}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Total Contacts</div>
                  <Target size={18} className="text-green-500" />
                </div>
                <div className={`text-2xl font-bold ${textClass}`}>
                  {brokers.length + partners.length + gatekeepers.length}
                </div>
                <div className={`text-xs ${textSecondaryClass} mt-0.5`}>
                  {brokers.length} Brokers • {gatekeepers.length} Gatekeepers
                </div>
              </div>
            </div>

            {/* Upcoming Follow-ups */}
            <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                  <Bell size={20} />
                  Upcoming Follow-ups
                </h3>
                <button
                  onClick={() => setActiveTab('followups')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>

              {followUps.filter(f => f.status !== 'completed').length === 0 ? (
                <div className={`text-center py-8 ${textSecondaryClass}`}>
                  <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No pending follow-ups. You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {followUps
                    .filter(f => f.status !== 'completed')
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 3)
                    .map(followUp => {
                      const overdue = isOverdue(followUp.dueDate);
                      const dueToday = isDueToday(followUp.dueDate);
                      const statusColor = overdue ? 'red' : dueToday ? 'yellow' : 'green';

                      // Get related contact info
                      let relatedContactInfo = null;
                      if (followUp.relatedContact) {
                        const [type, id] = followUp.relatedContact.split('-');
                        const contactId = parseInt(id);
                        if (type === 'broker') {
                          const contact = brokers.find(b => b.id === contactId);
                          if (contact) relatedContactInfo = { type: 'Broker', name: contact.name, icon: Target };
                        } else if (type === 'partner') {
                          const contact = partners.find(p => p.id === contactId);
                          if (contact) relatedContactInfo = { type: 'Partner', name: contact.name, icon: DollarSign };
                        } else if (type === 'gatekeeper') {
                          const contact = gatekeepers.find(g => g.id === contactId);
                          if (contact) relatedContactInfo = { type: 'Gatekeeper', name: contact.name, icon: AlertCircle };
                        }
                      }

                      return (
                        <div key={followUp.id} className={`p-3 rounded-lg border-l-4 ${overdue ? 'border-red-500' : dueToday ? 'border-yellow-500' : 'border-green-500'} ${borderClass} ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${textClass}`}>{followUp.contactName}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                  {followUp.type}
                                </span>
                                {followUp.priority === 'High' && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">HIGH</span>
                                )}
                              </div>
                              {followUp.notes && (
                                <div className={`mt-1.5 p-2 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-100'}`}>
                                  <p className={`text-xs ${textClass} leading-relaxed whitespace-pre-wrap line-clamp-2`}>{followUp.notes}</p>
                                </div>
                              )}
                              <p className={`text-xs ${overdue ? 'text-red-500 font-semibold' : dueToday ? 'text-yellow-600 font-semibold' : textSecondaryClass} mt-1`}>
                                {overdue ? `Overdue by ${getDaysAgo(followUp.dueDate)} days` : dueToday ? 'Due today' : `Due ${formatDate(followUp.dueDate)}`}
                              </p>
                            </div>
                            <div className="flex gap-1.5 ml-3">
                              <button
                                onClick={() => {
                                  setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f));
                                  showToast(`Follow-up with ${followUp.contactName} completed!`, 'success');
                                }}
                                className="bg-green-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-green-700 transition"
                                title="Mark as complete"
                              >
                                Done
                              </button>
                              <button
                                onClick={() => {
                                  const newDate = new Date(followUp.dueDate);
                                  newDate.setDate(newDate.getDate() + 1);
                                  setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, dueDate: newDate.toISOString().split('T')[0] } : f));
                                  showToast(`Follow-up snoozed to ${newDate.toLocaleDateString()}`, 'info');
                                }}
                                className={`${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} px-2.5 py-1 rounded text-xs font-semibold transition`}
                                title="Snooze until tomorrow"
                              >
                                Snooze
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Upcoming Calendar Events */}
            <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2`}>
                  <Calendar size={20} />
                  Upcoming Events
                </h3>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>

              {events.filter(e => new Date(e.date) >= new Date()).length === 0 ? (
                <div className={`text-center py-8 ${textSecondaryClass}`}>
                  <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No upcoming events scheduled.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events
                    .filter(e => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3)
                    .map(event => (
                      <div key={event.id} className={`p-3 rounded-lg border ${borderClass} ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${textClass}`}>{event.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                {event.type}
                              </span>
                            </div>
                            {event.location && (
                              <p className={`text-xs ${textSecondaryClass} mt-1`}>📍 {event.location}</p>
                            )}
                            <p className={`text-xs ${textSecondaryClass} mt-1`}>
                              {formatDateTime(event.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
              </>
            )}

            {/* Weekly View */}
            {dashboardView === 'weekly' && (
              <>
                {/* Week Overview Header */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <h3 className={`text-lg font-bold ${textClass} mb-4`}>This Week at a Glance</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

                      return Array.from({ length: 7 }).map((_, index) => {
                        const day = new Date(startOfWeek);
                        day.setDate(startOfWeek.getDate() + index);
                        day.setHours(0, 0, 0, 0);
                        const nextDay = new Date(day);
                        nextDay.setDate(day.getDate() + 1);

                        const dayEvents = events.filter(e => {
                          const eventDate = new Date(e.date);
                          return eventDate >= day && eventDate < nextDay;
                        });

                        const dayFollowUps = followUps.filter(f => {
                          if (f.status === 'completed') return false;
                          const dueDate = new Date(f.dueDate);
                          dueDate.setHours(0, 0, 0, 0);
                          return dueDate.getTime() === day.getTime();
                        });

                        const isToday = day.toDateString() === today.toDateString();
                        const totalItems = dayEvents.length + dayFollowUps.length;

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-2 ${
                              isToday
                                ? 'border-blue-500 bg-blue-50'
                                : totalItems > 0
                                  ? `border-green-300 ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`
                                  : `border-slate-200 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`
                            }`}
                          >
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                            </div>
                            <div className={`text-2xl font-bold ${textClass} my-1`}>
                              {day.getDate()}
                            </div>
                            {totalItems > 0 && (
                              <div className={`text-xs ${textClass} mt-2`}>
                                {dayEvents.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-blue-500" />
                                    <span>{dayEvents.length}</span>
                                  </div>
                                )}
                                {dayFollowUps.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Bell size={12} className="text-orange-500" />
                                    <span>{dayFollowUps.length}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {totalItems === 0 && (
                              <div className={`text-xs ${textSecondaryClass} mt-2`}>Free</div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* This Week's Events */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2 mb-3`}>
                    <Calendar size={20} />
                    This Week's Events
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      startOfWeek.setHours(0, 0, 0, 0);
                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(startOfWeek.getDate() + 7);

                      const weekEvents = events
                        .filter(e => {
                          const eventDate = new Date(e.date);
                          return eventDate >= startOfWeek && eventDate < endOfWeek;
                        })
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                      if (weekEvents.length === 0) {
                        return (
                          <div className={`text-center py-8 ${textSecondaryClass}`}>
                            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No events this week</p>
                          </div>
                        );
                      }

                      return weekEvents.map(event => (
                        <div key={event.id} className={`p-3 rounded-lg border ${borderClass} ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${textClass}`}>{event.title}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                  {event.type}
                                </span>
                              </div>
                              {event.location && (
                                <p className={`text-xs ${textSecondaryClass} mt-1`}>📍 {event.location}</p>
                              )}
                              <p className={`text-xs ${textSecondaryClass} mt-1`}>
                                {formatDateTime(event.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* This Week's Follow-ups */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <h3 className={`text-lg font-bold ${textClass} flex items-center gap-2 mb-3`}>
                    <Bell size={20} />
                    This Week's Follow-ups
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      startOfWeek.setHours(0, 0, 0, 0);
                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(startOfWeek.getDate() + 7);

                      const weekFollowUps = followUps
                        .filter(f => {
                          if (f.status === 'completed') return false;
                          const dueDate = new Date(f.dueDate);
                          dueDate.setHours(0, 0, 0, 0);
                          return dueDate >= startOfWeek && dueDate < endOfWeek;
                        })
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                      if (weekFollowUps.length === 0) {
                        return (
                          <div className={`text-center py-8 ${textSecondaryClass}`}>
                            <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No follow-ups this week</p>
                          </div>
                        );
                      }

                      return weekFollowUps.map(followUp => {
                        const overdue = isOverdue(followUp.dueDate);
                        const dueToday = isDueToday(followUp.dueDate);

                        return (
                          <div key={followUp.id} className={`p-3 rounded-lg border-l-4 ${overdue ? 'border-red-500' : dueToday ? 'border-yellow-500' : 'border-green-500'} ${borderClass} ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${textClass}`}>{followUp.contactName}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>
                                    {followUp.type}
                                  </span>
                                </div>
                                {followUp.notes && (
                                  <p className={`text-xs ${textSecondaryClass} mt-1 line-clamp-1`}>{followUp.notes}</p>
                                )}
                                <p className={`text-xs ${overdue ? 'text-red-500 font-semibold' : dueToday ? 'text-yellow-600 font-semibold' : textSecondaryClass} mt-1`}>
                                  {overdue ? `Overdue by ${getDaysAgo(followUp.dueDate)} days` : dueToday ? 'Due today' : `Due ${formatDate(followUp.dueDate)}`}
                                </p>
                              </div>
                              <div className="flex gap-1.5 ml-3">
                                <button
                                  onClick={() => {
                                    setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f));
                                    showToast(`Follow-up with ${followUp.contactName} completed!`, 'success');
                                  }}
                                  className="bg-green-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-green-700 transition"
                                  title="Mark as complete"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            )}

            {/* Analytics View */}
            {dashboardView === 'analytics' && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Total Contacts</div>
                      <Target size={20} className="text-blue-500" />
                    </div>
                    <div className={`text-3xl font-bold ${textClass}`}>
                      {brokers.length + partners.length + gatekeepers.length}
                    </div>
                    <div className={`text-xs ${textSecondaryClass} mt-1`}>
                      {brokers.length} Brokers • {partners.length} Partners • {gatekeepers.length} Gatekeepers
                    </div>
                  </div>

                  <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Active Follow-ups</div>
                      <Bell size={20} className="text-orange-500" />
                    </div>
                    <div className={`text-3xl font-bold ${textClass}`}>
                      {followUps.filter(f => f.status !== 'completed').length}
                    </div>
                    <div className={`text-xs ${textSecondaryClass} mt-1`}>
                      {followUps.filter(f => isOverdue(f.dueDate) && f.status !== 'completed').length} overdue
                    </div>
                  </div>

                  <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Total Events</div>
                      <Calendar size={20} className="text-green-500" />
                    </div>
                    <div className={`text-3xl font-bold ${textClass}`}>
                      {events.length}
                    </div>
                    <div className={`text-xs ${textSecondaryClass} mt-1`}>
                      {events.filter(e => new Date(e.date) >= new Date()).length} upcoming
                    </div>
                  </div>

                  <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Properties</div>
                      <Building2 size={20} className="text-purple-500" />
                    </div>
                    <div className={`text-3xl font-bold ${textClass}`}>
                      {properties.length}
                    </div>
                    <div className={`text-xs ${textSecondaryClass} mt-1`}>
                      Tracked assets
                    </div>
                  </div>
                </div>

                {/* Activity Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Follow-ups by Type */}
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                    <h3 className={`text-lg font-bold ${textClass} mb-3`}>Follow-ups by Type</h3>
                    <div className="space-y-2">
                      {(() => {
                        const types = ['Call', 'Email', 'Meeting', 'Text'];
                        return types.map(type => {
                          const count = followUps.filter(f => f.type === type).length;
                          const completed = followUps.filter(f => f.type === type && f.status === 'completed').length;
                          const percentage = count > 0 ? (completed / count) * 100 : 0;

                          return (
                            <div key={type}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm ${textClass}`}>{type}</span>
                                <span className={`text-sm ${textSecondaryClass}`}>
                                  {completed}/{count}
                                </span>
                              </div>
                              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Events by Type */}
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                    <h3 className={`text-lg font-bold ${textClass} mb-3`}>Events by Type</h3>
                    <div className="space-y-2">
                      {(() => {
                        const types = ['Meeting', 'Call', 'Site Visit', 'Other'];
                        return types.map(type => {
                          const count = events.filter(e => e.type === type).length;
                          const total = events.length;
                          const percentage = total > 0 ? (count / total) * 100 : 0;

                          return (
                            <div key={type}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm ${textClass}`}>{type}</span>
                                <span className={`text-sm ${textSecondaryClass}`}>
                                  {count} ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                <div
                                  className="h-full rounded-full bg-green-600"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Contact Engagement */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-4 border ${borderClass}`}>
                  <h3 className={`text-lg font-bold ${textClass} mb-3`}>Contact Engagement (Last 30 Days)</h3>
                  <div className="space-y-2">
                    {(() => {
                      const allContacts = [
                        ...brokers.map(b => ({ ...b, contactType: 'broker' })),
                        ...partners.map(p => ({ ...p, contactType: 'partner' })),
                        ...gatekeepers.map(g => ({ ...g, contactType: 'gatekeeper' }))
                      ];

                      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                      const contactEngagement = allContacts
                        .map(contact => {
                          const recentFollowUps = followUps.filter(f =>
                            f.relatedContact === `${contact.contactType}-${contact.id}` &&
                            new Date(f.createdAt || f.dueDate) > thirtyDaysAgo
                          ).length;

                          const recentEvents = events.filter(e => {
                            const type = contact.contactType === 'partner' ? 'partners' : contact.contactType === 'gatekeeper' ? 'gatekeepers' : 'brokers';
                            return e.taggedContacts?.[type]?.includes(contact.id) &&
                              new Date(e.date) > thirtyDaysAgo;
                          }).length;

                          const totalInteractions = recentFollowUps + recentEvents;

                          return { contact, totalInteractions };
                        })
                        .filter(({ totalInteractions }) => totalInteractions > 0)
                        .sort((a, b) => b.totalInteractions - a.totalInteractions)
                        .slice(0, 10);

                      if (contactEngagement.length === 0) {
                        return (
                          <div className={`text-center py-8 ${textSecondaryClass}`}>
                            <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No activity in the last 30 days</p>
                          </div>
                        );
                      }

                      const maxInteractions = Math.max(...contactEngagement.map(({ totalInteractions }) => totalInteractions));

                      return contactEngagement.map(({ contact, totalInteractions }) => (
                        <div key={`${contact.contactType}-${contact.id}`} className="flex items-center gap-3">
                          <div className={`text-sm ${textClass} flex-1`}>{contact.name}</div>
                          <div className="flex-1">
                            <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${(totalInteractions / maxInteractions) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className={`text-sm ${textSecondaryClass} w-12 text-right`}>
                            {totalInteractions}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-3 ${textSecondaryClass}`} size={20} />
                <input
                  type="text"
                  placeholder="Search by address or Crexi link..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                onClick={handleAddProperty}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} /> New Property
              </button>
            </div>

            {/* Property Form */}
            {showPropertyForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                <h2 className={`text-2xl font-bold ${textClass} mb-6`}>
                  {editingId ? 'Edit Property' : 'Add New Property'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Address */}
                  <input
                    type="text"
                    placeholder="Property Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Property Details Section */}
                  <div className="col-span-2">
                    <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Property Details</h3>
                  </div>

                  <input
                    type="text"
                    placeholder="Square Feet"
                    value={formatNumberInput(formData.squareFeet || '')}
                    onChange={(e) => setFormData({ ...formData, squareFeet: stripCommas(e.target.value) })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Monthly Base Rent per Sq Ft (e.g., 1.25)"
                    value={formData.monthlyBaseRentPerSqft || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyBaseRentPerSqft: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Purchase & Costs Section */}
                  <div className="col-span-2 mt-4">
                    <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Purchase & Costs</h3>
                  </div>

                  <input
                    type="text"
                    placeholder="Purchase Price"
                    value={formatNumberInput(formData.purchasePrice || '')}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: stripCommas(e.target.value) })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Improvements (CapEx/Renovation)"
                    value={formatNumberInput(formData.improvements || '')}
                    onChange={(e) => setFormData({ ...formData, improvements: stripCommas(e.target.value) })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Closing Costs (optional)"
                    value={formatNumberInput(formData.closingCosts || '')}
                    onChange={(e) => setFormData({ ...formData, closingCosts: stripCommas(e.target.value) })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Financing Section */}
                  <div className="col-span-2 mt-4">
                    <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Financing</h3>
                  </div>

                  <input
                    type="number"
                    step="0.1"
                    placeholder="LTV % (e.g., 80)"
                    value={formData.ltvPercent || ''}
                    onChange={(e) => setFormData({ ...formData, ltvPercent: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Interest Rate % (e.g., 5.5)"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    placeholder="Loan Term (years, e.g., 30)"
                    value={formData.loanTerm || ''}
                    onChange={(e) => setFormData({ ...formData, loanTerm: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <select
                    value={formData.debtServiceType || 'standard'}
                    onChange={(e) => setFormData({ ...formData, debtServiceType: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="standard">Standard Amortization</option>
                    <option value="interestOnly">Interest-Only</option>
                  </select>

                  {/* Exit & Hold Section */}
                  <div className="col-span-2 mt-4">
                    <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Exit Strategy</h3>
                  </div>

                  <input
                    type="number"
                    step="0.1"
                    placeholder="Exit Cap Rate % (e.g., 6.5)"
                    value={formData.exitCapRate || ''}
                    onChange={(e) => setFormData({ ...formData, exitCapRate: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="number"
                    placeholder="Holding Period (months, e.g., 60)"
                    value={formData.holdingPeriodMonths || ''}
                    onChange={(e) => setFormData({ ...formData, holdingPeriodMonths: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Brokers Section */}
                  <div className="col-span-2 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-lg font-semibold ${textClass}`}>Brokers</h3>
                      <button
                        type="button"
                        onClick={handleShowInlineBrokerForm}
                        className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                      >
                        <Plus size={16} /> Add New Broker
                      </button>
                    </div>

                    {/* Inline Broker Quick-Add Form */}
                    {showInlineBrokerForm && (
                      <div className={`p-4 mb-4 rounded-lg border-2 border-green-500 ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-semibold ${textClass}`}>Quick Add Broker</h4>
                          <button
                            type="button"
                            onClick={() => setShowInlineBrokerForm(false)}
                            className={`p-1 ${textSecondaryClass} ${hoverBgClass} rounded`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Broker Name *"
                            value={inlineBrokerData.name || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, name: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            value={inlineBrokerData.email || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, email: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={inlineBrokerData.phone || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, phone: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="text"
                            placeholder="Firm Name (optional)"
                            value={inlineBrokerData.firmName || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, firmName: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="url"
                            placeholder="Firm Website (optional)"
                            value={inlineBrokerData.firmWebsite || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, firmWebsite: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="url"
                            placeholder="Crexi Profile Link (optional)"
                            value={inlineBrokerData.crexiLink || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, crexiLink: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <input
                            type="text"
                            placeholder="License # (optional)"
                            value={inlineBrokerData.licenseNumber || ''}
                            onChange={(e) => setInlineBrokerData({ ...inlineBrokerData, licenseNumber: e.target.value })}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                          />
                          <button
                            type="button"
                            onClick={handleSaveInlineBroker}
                            className="w-full bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            Add Broker
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Broker Selection */}
                    {brokers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {brokers.map(broker => (
                          <label
                            key={broker.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border ${inputBorderClass} ${
                              formData.brokerIds?.includes(broker.id) ? 'bg-blue-100 border-blue-500' : inputBgClass
                            } cursor-pointer hover:border-blue-400 transition`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.brokerIds?.includes(broker.id) || false}
                              onChange={() => handleToggleBroker(broker.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className={`text-sm font-medium ${textClass}`}>{broker.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${textSecondaryClass} italic`}>
                        No brokers yet. Click "+ Add New Broker" above to create one.
                      </p>
                    )}
                  </div>

                  {/* Photos Section */}
                  <div className="col-span-2 mt-4">
                    <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Property Photos</h3>

                    {/* Method 1: Upload from file */}
                    <div className="mb-3">
                      <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                        Upload from file:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    {/* Method 2: Paste from URL */}
                    <div className="mb-3">
                      <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                        Or paste image URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          id="photoUrlInput"
                          className={`flex-1 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handlePhotoUrlAdd(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = document.getElementById('photoUrlInput');
                            handlePhotoUrlAdd(input.value);
                            input.value = '';
                          }}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Method 3: Paste from clipboard */}
                    <div className="mb-3">
                      <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                        Or paste image directly (Ctrl+V / Cmd+V):
                      </label>
                      <div
                        contentEditable
                        onPaste={handlePasteImage}
                        className={`w-full px-4 py-3 rounded-lg border-2 border-dashed ${inputBorderClass} ${inputBgClass} ${textSecondaryClass} focus:outline-none focus:ring-2 focus:ring-blue-500 italic text-center cursor-text`}
                        suppressContentEditableWarning
                      >
                        Click here and paste image (Ctrl+V / Cmd+V)
                      </div>
                    </div>

                    <p className={`text-xs ${textSecondaryClass} mt-2`}>
                      Maximum 10 photos, 2MB per image. Supported formats: JPG, PNG, GIF, WebP
                    </p>

                    {/* Photo Preview Grid */}
                    {formData.photos && formData.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {formData.photos.map(photo => (
                          <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${borderClass}`}>
                            <img
                              src={photo.data}
                              alt={photo.name}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                              <X size={16} />
                            </button>
                            <div className={`absolute bottom-0 left-0 right-0 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-white bg-opacity-90'} p-1`}>
                              <p className={`text-xs ${textClass} truncate`}>{photo.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other */}
                  <input
                    type="text"
                    placeholder="Crexi Listing Link"
                    value={formData.crexi || ''}
                    onChange={(e) => setFormData({ ...formData, crexi: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProperty}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Update' : 'Add'} Property
                  </button>
                  <button
                    onClick={() => {
                      setShowPropertyForm(false);
                      setShowInlineBrokerForm(false);
                    }}
                    className={`flex-1 border ${borderClass} ${textSecondaryClass} font-semibold py-3 rounded-lg ${hoverBgClass} transition`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Properties List */}
            <div className="grid gap-6">
              {filteredProperties.map(property => {
                const metrics = calculateMetrics(property);
                const propertyBrokers = (property.brokerIds || []).map(id => brokers.find(b => b.id === id)).filter(Boolean);

                return (
                  <div key={property.id} className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass} hover:shadow-xl transition`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3
                          onClick={() => openPropertyProfile(property.id)}
                          className={`text-2xl font-bold ${textClass} cursor-pointer hover:text-blue-600 transition`}
                        >
                          {property.address}
                        </h3>
                        {property.crexi && (
                          <a href={property.crexi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 block">
                            View on Crexi →
                          </a>
                        )}
                        {propertyBrokers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {propertyBrokers.map(broker => (
                              <button
                                key={broker.id}
                                onClick={() => openContactProfile('broker', broker.id)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                                  darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                }`}
                                aria-label={`View ${broker.name} profile`}
                              >
                                {broker.name}{broker.firmName ? ` - ${broker.firmName}` : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProperty(property)}
                          className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Property Photos Gallery */}
                    {property.photos && property.photos.length > 0 && (
                      <div className="mb-6">
                        <h4 className={`text-sm font-semibold ${textSecondaryClass} uppercase mb-3`}>
                          Property Photos ({property.photos.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {property.photos.map((photo, index) => (
                            <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${borderClass} ${hoverBgClass} cursor-pointer transition`}>
                              <img
                                src={photo.data}
                                alt={photo.name}
                                className="w-full h-32 object-cover"
                                onClick={() => openLightbox(property.photos, index)}
                              />
                              <div className={`absolute bottom-0 left-0 right-0 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-white bg-opacity-90'} p-1 opacity-0 group-hover:opacity-100 transition`}>
                                <p className={`text-xs ${textClass} truncate`}>{photo.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All-in Cost & Financing Summary */}
                    <div className={`p-4 rounded-lg mb-6 ${metricsBgClass}`}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>All-in Cost</div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(metrics.allInCost)}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Loan Amount ({property.ltvPercent}% LTV)</div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(metrics.loanAmount)}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Equity Required</div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{formatCurrency(metrics.equityRequired)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Monthly Rent</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.monthlyRent)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Annual NOI</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.noi)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Cap Rate</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatPercent(metrics.capRate)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>DSCR</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{metrics.dscr > 0 ? metrics.dscr.toFixed(2) : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Debt Service & Returns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Debt Service Type</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{property.debtServiceType === 'interestOnly' ? 'Interest-Only' : 'Standard'}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Monthly Debt Service</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.monthlyDebtService)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Annual Cash Flow</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.annualCashFlow)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Cash-on-Cash</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatPercent(metrics.cashOnCash)}</div>
                      </div>
                    </div>

                    {/* Exit Metrics */}
                    {property.holdingPeriodMonths && (
                      <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-sm font-bold ${textSecondaryClass} uppercase mb-3`}>Exit Analysis ({property.holdingPeriodMonths} months)</div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Exit Value</div>
                            <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.exitValue)}</div>
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Remaining Loan</div>
                            <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.remainingLoanBalance)}</div>
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Net Proceeds</div>
                            <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.netProceedsAtExit)}</div>
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Equity Multiple</div>
                            <div className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{metrics.equityMultiple > 0 ? `${metrics.equityMultiple.toFixed(2)}x` : 'N/A'}</div>
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>IRR</div>
                            <div className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{metrics.irr > 0 ? `${metrics.irr.toFixed(2)}%` : 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sensitivity Analysis */}
                    {property.holdingPeriodMonths && (
                      <div className="mb-4">
                        <button
                          onClick={() => {
                            if (sensitivityPropertyId === property.id) {
                              setSensitivityPropertyId(null);
                              setSensitivityTable(null);
                            } else {
                              setSensitivityPropertyId(property.id);
                              setSensitivityTable(null);
                              // Set default ranges based on current property values
                              const currentRent = parseFloat(property.monthlyBaseRentPerSqft) || 1.0;
                              const currentExitCap = parseFloat(property.exitCapRate) || 7.0;
                              setSensitivityRowMin((currentRent * 0.7).toFixed(2));
                              setSensitivityRowMax((currentRent * 1.3).toFixed(2));
                              setSensitivityColMin((currentExitCap - 2).toFixed(2));
                              setSensitivityColMax((currentExitCap + 2).toFixed(2));
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                            darkMode
                              ? 'bg-purple-900 hover:bg-purple-800 text-purple-200'
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                          }`}
                        >
                          {sensitivityPropertyId === property.id ? '− Hide' : '+ Show'} Sensitivity Analysis
                        </button>

                        {sensitivityPropertyId === property.id && (
                          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                            <div className={`text-sm font-bold ${textSecondaryClass} uppercase mb-4`}>
                              Sensitivity Analysis
                            </div>

                            {/* Output Metric Selection */}
                            <div className="mb-4">
                              <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                                Output Metric
                              </label>
                              <select
                                value={sensitivityOutputMetric}
                                onChange={(e) => setSensitivityOutputMetric(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                              >
                                <option value="irr">IRR (Internal Rate of Return) %</option>
                                <option value="equityMultiple">Equity Multiple</option>
                                <option value="dscr">DSCR (Debt Service Coverage Ratio)</option>
                                <option value="cashOnCash">Cash-on-Cash Return %</option>
                                <option value="capRate">Cap Rate %</option>
                                <option value="annualCashFlow">Annual Cash Flow</option>
                                <option value="netProceedsAtExit">Net Proceeds at Exit</option>
                                <option value="noi">NOI (Net Operating Income)</option>
                              </select>
                            </div>

                            {/* Variable Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Row Variable */}
                              <div>
                                <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                                  Row Variable
                                </label>
                                <select
                                  value={sensitivityRowVar}
                                  onChange={(e) => setSensitivityRowVar(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                >
                                  <option value="monthlyBaseRentPerSqft">Monthly Rent/SF</option>
                                  <option value="purchasePrice">Purchase Price</option>
                                  <option value="improvements">Improvements</option>
                                  <option value="closingCosts">Closing Costs</option>
                                  <option value="ltvPercent">LTV %</option>
                                  <option value="interestRate">Interest Rate</option>
                                  <option value="exitCapRate">Exit Cap Rate</option>
                                  <option value="holdingPeriodMonths">Holding Period</option>
                                </select>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className={`block text-xs ${textSecondaryClass} mb-1`}>Min</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sensitivityRowMin}
                                      onChange={(e) => setSensitivityRowMin(e.target.value)}
                                      className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-xs ${textSecondaryClass} mb-1`}>Max</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sensitivityRowMax}
                                      onChange={(e) => setSensitivityRowMax(e.target.value)}
                                      className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Column Variable */}
                              <div>
                                <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                                  Column Variable
                                </label>
                                <select
                                  value={sensitivityColVar}
                                  onChange={(e) => setSensitivityColVar(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                >
                                  <option value="monthlyBaseRentPerSqft">Monthly Rent/SF</option>
                                  <option value="purchasePrice">Purchase Price</option>
                                  <option value="improvements">Improvements</option>
                                  <option value="closingCosts">Closing Costs</option>
                                  <option value="ltvPercent">LTV %</option>
                                  <option value="interestRate">Interest Rate</option>
                                  <option value="exitCapRate">Exit Cap Rate</option>
                                  <option value="holdingPeriodMonths">Holding Period</option>
                                </select>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className={`block text-xs ${textSecondaryClass} mb-1`}>Min</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sensitivityColMin}
                                      onChange={(e) => setSensitivityColMin(e.target.value)}
                                      className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-xs ${textSecondaryClass} mb-1`}>Max</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sensitivityColMax}
                                      onChange={(e) => setSensitivityColMax(e.target.value)}
                                      className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Generate Button */}
                            <button
                              onClick={() => {
                                const table = generateSensitivityTable(
                                  property,
                                  sensitivityRowVar,
                                  sensitivityColVar,
                                  sensitivityRowMin,
                                  sensitivityRowMax,
                                  sensitivityColMin,
                                  sensitivityColMax
                                );
                                setSensitivityTable(table);
                              }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition mb-4"
                            >
                              Generate Sensitivity Table
                            </button>

                            {/* Sensitivity Table Display */}
                            {sensitivityTable && (() => {
                              // Metric metadata
                              const metricMeta = {
                                irr: { label: 'IRR %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 18, fair: 13 },
                                equityMultiple: { label: 'Equity Multiple', format: (v) => v > 0 ? `${v.toFixed(2)}x` : 'N/A', good: 2.0, fair: 1.5 },
                                dscr: { label: 'DSCR', format: (v) => v > 0 ? v.toFixed(2) : 'N/A', good: 1.25, fair: 1.0 },
                                cashOnCash: { label: 'Cash-on-Cash %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 8, fair: 5 },
                                capRate: { label: 'Cap Rate %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 7, fair: 5 },
                                annualCashFlow: { label: 'Annual Cash Flow', format: (v) => formatCurrency(v), good: 50000, fair: 25000 },
                                netProceedsAtExit: { label: 'Net Proceeds at Exit', format: (v) => formatCurrency(v), good: 500000, fair: 250000 },
                                noi: { label: 'NOI', format: (v) => formatCurrency(v), good: 100000, fair: 50000 }
                              };

                              const selectedMetric = metricMeta[sensitivityOutputMetric];

                              return (
                                <div className="overflow-x-auto">
                                  <div className={`text-xs ${textSecondaryClass} mb-2 text-center`}>
                                    {sensitivityTable.rowLabel} (rows) vs {sensitivityTable.colLabel} (columns) → {selectedMetric.label}
                                  </div>
                                  <table className="w-full text-xs border-collapse">
                                    <thead>
                                      <tr>
                                        <th className={`border ${borderClass} p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                          ↓ / →
                                        </th>
                                        {sensitivityTable.colValues.map((colVal, i) => (
                                          <th key={i} className={`border ${borderClass} p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                            {sensitivityTable.colFormat(colVal)}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sensitivityTable.tableData.map((row, rowIdx) => (
                                        <tr key={rowIdx}>
                                          <td className={`border ${borderClass} p-2 font-semibold ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                            {sensitivityTable.rowFormat(sensitivityTable.rowValues[rowIdx])}
                                          </td>
                                          {row.map((cell, colIdx) => {
                                            // Get metric value
                                            const value = cell[sensitivityOutputMetric];

                                            // Color coding based on metric thresholds
                                            let bgColor = '';
                                            if (value >= selectedMetric.good) {
                                              bgColor = darkMode ? 'bg-green-900' : 'bg-green-100';
                                            } else if (value >= selectedMetric.fair) {
                                              bgColor = darkMode ? 'bg-yellow-900' : 'bg-yellow-100';
                                            } else {
                                              bgColor = darkMode ? 'bg-red-900' : 'bg-red-100';
                                            }

                                            return (
                                              <td key={colIdx} className={`border ${borderClass} p-2 text-center font-semibold ${bgColor} ${textClass}`}>
                                                {selectedMetric.format(value)}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className={`text-xs ${textSecondaryClass} mt-2 text-center`}>
                                    Color Guide: Green ≥{selectedMetric.format(selectedMetric.good)} | Yellow {selectedMetric.format(selectedMetric.fair)}-{selectedMetric.format(selectedMetric.good)} | Red &lt;{selectedMetric.format(selectedMetric.fair)}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Property Details */}
                    <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-sm font-bold ${textSecondaryClass} uppercase mb-3`}>Property Details</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Square Feet</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{formatNumber(property.squareFeet)}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Base Rent/SF</div>
                          <div className={`text-sm font-semibold ${textClass}`}>${property.monthlyBaseRentPerSqft || 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Purchase Price</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.purchasePrice ? formatCurrency(stripCommas(property.purchasePrice)) : 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Improvements</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.improvements ? formatCurrency(stripCommas(property.improvements)) : 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Closing Costs</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.closingCosts ? formatCurrency(stripCommas(property.closingCosts)) : '$0'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>LTV %</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.ltvPercent ? `${property.ltvPercent}%` : 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Interest Rate</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.interestRate ? `${property.interestRate}%` : 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Loan Term</div>
                          <div className={`text-sm font-semibold ${textClass}`}>{property.loanTerm ? `${property.loanTerm} yrs` : 'N/A'}</div>
                        </div>
                        {property.exitCapRate && (
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Exit Cap Rate</div>
                            <div className={`text-sm font-semibold ${textClass}`}>{property.exitCapRate}%</div>
                          </div>
                        )}
                        {property.holdingPeriodMonths && (
                          <div>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Holding Period</div>
                            <div className={`text-sm font-semibold ${textClass}`}>{property.holdingPeriodMonths} months ({(property.holdingPeriodMonths / 12).toFixed(1)} yrs)</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes & Activity Section */}
                    <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg`}>
                      <div className={`text-sm font-bold ${textClass} uppercase mb-4 flex items-center justify-between`}>
                        <span>Notes & Activity</span>
                        <span className={`text-xs ${textSecondaryClass} normal-case`}>
                          {(property.noteHistory || []).length} note{(property.noteHistory || []).length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Add Note Form */}
                      <div className="mb-4">
                        <div className="flex gap-2 mb-2">
                          <select
                            value={noteCategory[`property-${property.id}`] || 'general'}
                            onChange={(e) => setNoteCategory({ ...noteCategory, [`property-${property.id}`]: e.target.value })}
                            className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="general">General</option>
                            <option value="call">Call</option>
                            <option value="meeting">Meeting</option>
                            <option value="email">Email</option>
                            <option value="site-visit">Site Visit</option>
                            <option value="due-diligence">Due Diligence</option>
                            <option value="follow-up">Follow-up</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            placeholder="Add a note..."
                            value={noteContent[`property-${property.id}`] || ''}
                            onChange={(e) => setNoteContent({ ...noteContent, [`property-${property.id}`]: e.target.value })}
                            className={`flex-1 px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                            rows="2"
                          />
                          <button
                            onClick={() => {
                              handleAddNote('property', property.id, noteContent[`property-${property.id}`], noteCategory[`property-${property.id}`] || 'general');
                              setNoteContent({ ...noteContent, [`property-${property.id}`]: '' });
                            }}
                            className="px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Note History */}
                      <div className="space-y-3">
                        {(property.noteHistory || []).length === 0 && (
                          <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass}`}>
                            <MessageSquare size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                            <p className={`text-sm ${textSecondaryClass} font-medium`}>
                              No notes yet
                            </p>
                            <p className={`text-xs ${textSecondaryClass} mt-1`}>
                              Add your first note above to track interactions and updates
                            </p>
                          </div>
                        )}
                        {(property.noteHistory || [])
                          .slice()
                          .reverse()
                          .map(note => {
                            const categoryColors = {
                              general: darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800',
                              call: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
                              meeting: darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
                              email: darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
                              'site-visit': darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
                              'due-diligence': darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
                              'follow-up': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                            };

                            const categoryLabels = {
                              general: 'General',
                              call: 'Call',
                              meeting: 'Meeting',
                              email: 'Email',
                              'site-visit': 'Site Visit',
                              'due-diligence': 'Due Diligence',
                              'follow-up': 'Follow-up'
                            };

                            const isLongNote = note.content.length > 300;
                            const isExpanded = expandedNotes[note.id];

                            // Function to make URLs clickable
                            const linkifyText = (text) => {
                              const urlRegex = /(https?:\/\/[^\s]+)/g;
                              const parts = text.split(urlRegex);
                              return parts.map((part, i) => {
                                if (part.match(urlRegex)) {
                                  return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">{part}</a>;
                                }
                                return part;
                              });
                            };

                            return (
                              <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 rounded-lg border ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${categoryColors[note.category] || categoryColors.general}`}>
                                      {categoryLabels[note.category] || categoryLabels.general}
                                    </span>
                                    <span className={`text-xs ${textSecondaryClass} font-medium`}>
                                      {formatRelativeTime(note.timestamp)}
                                      {note.edited && ' • Edited'}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {editingNoteId === note.id ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            handleEditNote('property', property.id, note.id, editingNoteContent);
                                            setEditingNoteId(null);
                                            setEditingNoteContent('');
                                          }}
                                          className="text-green-600 hover:text-green-700 text-xs p-1"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingNoteId(null);
                                            setEditingNoteContent('');
                                          }}
                                          className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingNoteId(note.id);
                                            setEditingNoteContent(note.content);
                                          }}
                                          className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteNote('property', property.id, note.id)}
                                          className="text-red-600 hover:text-red-700 text-xs p-1"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingNoteId === note.id ? (
                                  <textarea
                                    value={editingNoteContent}
                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    rows="4"
                                  />
                                ) : (
                                  <div>
                                    <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                                      {isLongNote && !isExpanded
                                        ? linkifyText(note.content.substring(0, 300) + '...')
                                        : linkifyText(note.content)
                                      }
                                    </p>
                                    {isLongNote && (
                                      <button
                                        onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                                        className="text-blue-500 hover:text-blue-600 text-xs font-semibold mt-2"
                                      >
                                        {isExpanded ? 'Show less' : 'Read more'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProperties.length === 0 && !showPropertyForm && (
              <EmptyState
                icon={Building2}
                title="No Properties Yet"
                message="Click 'New Property' to add your first property and start tracking your industrial real estate portfolio."
                action={{
                  label: 'New Property',
                  onClick: handleAddProperty
                }}
                darkMode={darkMode}
              />
            )}
          </div>
        )}

        {/* Brokers Tab */}
        {activeTab === 'brokers' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-2.5 ${textSecondaryClass}`} size={20} />
                <input
                  type="text"
                  placeholder="Search brokers by name, firm, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                onClick={handleAddBroker}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} /> Add Broker
              </button>
            </div>

            {/* Broker Form */}
            {showBrokerForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                <h2 className={`text-2xl font-bold ${textClass} mb-6`}>
                  {editingId ? 'Edit Broker' : 'Add New Broker'}
                </h2>

                <div className="space-y-6 mb-6">
                  <input
                    type="text"
                    placeholder="Broker Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Firm Name"
                    value={formData.firmName || ''}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="url"
                    placeholder="Firm Website"
                    value={formData.firmWebsite || ''}
                    onChange={(e) => setFormData({ ...formData, firmWebsite: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="url"
                    placeholder="Crexi Profile Link"
                    value={formData.crexiLink || ''}
                    onChange={(e) => setFormData({ ...formData, crexiLink: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="License #"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveBroker}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Update' : 'Add'} Broker
                  </button>
                  <button
                    onClick={() => setShowBrokerForm(false)}
                    className={`flex-1 border ${borderClass} ${textSecondaryClass} font-semibold py-3 rounded-lg ${hoverBgClass} transition`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Brokers List */}
            <div className="grid gap-6">
              {brokers.filter(broker =>
                broker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                broker.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                broker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                broker.phone?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(broker => {
                // Get initials for avatar
                const getInitials = (name) => {
                  if (!name) return '?';
                  const parts = name.split(' ');
                  if (parts.length === 1) return parts[0][0].toUpperCase();
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                };

                // Get last contact date
                const lastContact = broker.noteHistory && broker.noteHistory.length > 0
                  ? formatRelativeTime(broker.noteHistory[broker.noteHistory.length - 1].timestamp)
                  : null;

                return (
                <div key={broker.id} className={`${cardBgClass} rounded-xl shadow-lg border ${borderClass} hover:shadow-xl transition overflow-hidden`}>
                  {/* Header with Avatar and Quick Actions */}
                  <div className={`p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                      {/* Avatar Circle */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {getInitials(broker.name)}
                        </div>
                      </div>

                      {/* Name and Title */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => openContactProfile('broker', broker.id)}
                          className={`text-2xl font-bold ${textClass} mb-1 cursor-pointer hover:text-blue-500 transition`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && openContactProfile('broker', broker.id)}
                          aria-label={`View ${broker.name} profile`}
                        >
                          {broker.name}
                        </h3>
                        {broker.firmName && (
                          <p className={`text-sm ${textSecondaryClass} flex items-center gap-1`}>
                            <Building2 size={14} />
                            {broker.firmName}
                          </p>
                        )}
                        {lastContact && (
                          <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Last contact: {lastContact}
                          </p>
                        )}
                      </div>

                      {/* Edit/Delete Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBroker(broker)}
                          className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                          title="Edit broker"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBroker(broker.id)}
                          className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}`}
                          title="Delete broker"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {broker.phone && (
                        <a
                          href={`tel:${broker.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                      {broker.email && (
                        <a
                          href={`mailto:${broker.email}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const noteInput = document.querySelector(`#note-input-broker-${broker.id}`);
                          if (noteInput) noteInput.focus();
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition text-sm`}
                      >
                        <MessageSquare size={16} />
                        Note
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {broker.email && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Mail size={18} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Email</div>
                            <a href={`mailto:${broker.email}`} className="text-sm text-blue-600 hover:text-blue-700 truncate block">
                              {broker.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {broker.phone && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Phone size={18} className="text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Phone</div>
                            <a href={`tel:${broker.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                              {broker.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {broker.firmWebsite && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Globe size={18} className="text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Website</div>
                            <a href={broker.firmWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 truncate">
                              {broker.firmWebsite.replace(/^https?:\/\//, '')}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      )}
                      {broker.crexiLink && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Building2 size={18} className="text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Crexi Profile</div>
                            <a href={broker.crexiLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                              View Profile
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      )}
                      {broker.licenseNumber && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Target size={18} className="text-cyan-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>License #</div>
                            <div className={`text-sm ${textClass}`}>
                              {broker.licenseNumber}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Notes & Activity Section */}
                  <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg`}>
                    <div className={`text-sm font-bold ${textClass} uppercase mb-4 flex items-center justify-between`}>
                      <span>Notes & Activity</span>
                      <span className={`text-xs ${textSecondaryClass} normal-case`}>
                        {(broker.noteHistory || []).length} note{(broker.noteHistory || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Add Note Form */}
                    <div className="mb-4">
                      <div className="flex gap-2 mb-2">
                        <select
                          value={noteCategory[`broker-${broker.id}`] || 'general'}
                          onChange={(e) => setNoteCategory({ ...noteCategory, [`broker-${broker.id}`]: e.target.value })}
                          className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="general">General</option>
                          <option value="call">Call</option>
                          <option value="meeting">Meeting</option>
                          <option value="email">Email</option>
                          <option value="site-visit">Site Visit</option>
                          <option value="due-diligence">Due Diligence</option>
                          <option value="follow-up">Follow-up</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          id={`note-input-broker-${broker.id}`}
                          placeholder="Add a note..."
                          value={noteContent[`broker-${broker.id}`] || ''}
                          onChange={(e) => setNoteContent({ ...noteContent, [`broker-${broker.id}`]: e.target.value })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                          rows="2"
                        />
                        <button
                          onClick={() => {
                            handleAddNote('broker', broker.id, noteContent[`broker-${broker.id}`], noteCategory[`broker-${broker.id}`] || 'general');
                            setNoteContent({ ...noteContent, [`broker-${broker.id}`]: '' });
                          }}
                          className="px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Note History */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {(broker.noteHistory || []).length === 0 && (
                        <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass}`}>
                          <MessageSquare size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                          <p className={`text-sm ${textSecondaryClass} font-medium`}>
                            No notes yet
                          </p>
                          <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Add your first note above to track interactions and updates
                          </p>
                        </div>
                      )}
                      {(broker.noteHistory || [])
                        .slice()
                        .reverse()
                        .map(note => {
                          const categoryColors = {
                            general: darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800',
                            call: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
                            meeting: darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
                            email: darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
                            'site-visit': darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
                            'due-diligence': darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
                            'follow-up': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                          };

                          const categoryLabels = {
                            general: 'General',
                            call: 'Call',
                            meeting: 'Meeting',
                            email: 'Email',
                            'site-visit': 'Site Visit',
                            'due-diligence': 'Due Diligence',
                            'follow-up': 'Follow-up'
                          };

                          const categoryLetters = {
                            general: 'G',
                            call: 'C',
                            meeting: 'M',
                            email: 'E',
                            'site-visit': 'S',
                            'due-diligence': 'D',
                            'follow-up': 'F'
                          };

                          const categoryBorderColors = {
                            general: 'border-l-gray-500',
                            call: 'border-l-green-500',
                            meeting: 'border-l-blue-500',
                            email: 'border-l-purple-500',
                            'site-visit': 'border-l-orange-500',
                            'due-diligence': 'border-l-red-500',
                            'follow-up': 'border-l-yellow-500'
                          };

                          const categoryBadgeColors = {
                            general: darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white',
                            call: darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white',
                            meeting: darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
                            email: darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white',
                            'site-visit': darkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white',
                            'due-diligence': darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white',
                            'follow-up': darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                          };

                          const isLongNote = note.content.length > 300;
                          const isExpanded = expandedNotes[note.id];

                          // Function to make URLs clickable
                          const linkifyText = (text) => {
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const parts = text.split(urlRegex);
                            return parts.map((part, i) => {
                              if (part.match(urlRegex)) {
                                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">{part}</a>;
                              }
                              return part;
                            });
                          };

                          return (
                            <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 rounded-lg border-l-4 ${categoryBorderColors[note.category] || categoryBorderColors.general} border-r ${borderClass} border-t ${borderClass} border-b ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
                              <div className="flex items-start gap-3 mb-3">
                                {/* Letter Badge */}
                                <div className={`w-8 h-8 rounded-full ${categoryBadgeColors[note.category] || categoryBadgeColors.general} flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
                                  {categoryLetters[note.category] || categoryLetters.general}
                                </div>

                                {/* Note Header */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-semibold ${textClass}`}>
                                        {categoryLabels[note.category] || categoryLabels.general}
                                      </span>
                                      <span className={`text-xs ${textSecondaryClass} font-medium`}>
                                        • {formatRelativeTime(note.timestamp)}
                                        {note.edited && ' • Edited'}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      {editingNoteId === note.id ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              handleEditNote('broker', broker.id, note.id, editingNoteContent);
                                              setEditingNoteId(null);
                                              setEditingNoteContent('');
                                            }}
                                            className="text-green-600 hover:text-green-700 text-xs p-1"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingNoteId(null);
                                              setEditingNoteContent('');
                                            }}
                                            className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setEditingNoteId(note.id);
                                              setEditingNoteContent(note.content);
                                            }}
                                            className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteNote('broker', broker.id, note.id)}
                                            className="text-red-600 hover:text-red-700 text-xs p-1"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Note Content */}
                                  {editingNoteId === note.id ? (
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  rows="4"
                                />
                              ) : (
                                <div>
                                  <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                                    {isLongNote && !isExpanded
                                      ? linkifyText(note.content.substring(0, 300) + '...')
                                      : linkifyText(note.content)
                                    }
                                  </p>
                                  {isLongNote && (
                                    <button
                                      onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                                      className="text-blue-500 hover:text-blue-600 text-xs font-semibold mt-2"
                                    >
                                      {isExpanded ? 'Show less' : 'Read more'}
                                    </button>
                                  )}
                                </div>
                              )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  </div>
                </div>
              );
              })}
            </div>

            {brokers.length === 0 && !showBrokerForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No brokers yet. Click "Add Broker" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${textClass}`}>Partners & LPs</h2>
                <p className={textSecondaryClass}>Manage your equity partners and limited partners</p>
              </div>
              <button
                onClick={handleAddPartner}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Add Partner
              </button>
            </div>

            {/* Partner Form */}
            {showPartnerForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8`}>
                <h3 className={`text-xl font-bold ${textClass} mb-6`}>
                  {editingId ? 'Edit Partner' : 'New Partner'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Info */}
                  <input
                    type="text"
                    placeholder="Name *"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Entity/Company Name"
                    value={formData.entityName || ''}
                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />

                  {/* Investment Profile */}
                  <div className="col-span-2 mt-4">
                    <h4 className={`text-md font-semibold ${textClass} mb-3`}>Investment Profile</h4>
                  </div>

                  <select
                    value={formData.checkSize || ''}
                    onChange={(e) => setFormData({ ...formData, checkSize: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Typical Check Size</option>
                    <option value="$50K-$100K">$50K-$100K</option>
                    <option value="$100K-$250K">$100K-$250K</option>
                    <option value="$250K-$500K">$250K-$500K</option>
                    <option value="$500K-$1M">$500K-$1M</option>
                    <option value="$1M+">$1M+</option>
                  </select>

                  <select
                    value={formData.creExperience || ''}
                    onChange={(e) => setFormData({ ...formData, creExperience: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">CRE Experience Level</option>
                    <option value="First-Time Investor">First-Time Investor</option>
                    <option value="1-3 Deals">1-3 Deals</option>
                    <option value="Experienced (5+ Deals)">Experienced (5+ Deals)</option>
                    <option value="Sophisticated Investor">Sophisticated Investor</option>
                  </select>

                  <select
                    value={formData.background || ''}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Background</option>
                    <option value="Real Estate Professional">Real Estate Professional</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Finance/Banking">Finance/Banking</option>
                    <option value="W2/Professional">W2/Professional</option>
                    <option value="Inherited Wealth">Inherited Wealth</option>
                    <option value="Self-Made">Self-Made</option>
                  </select>

                  <select
                    value={formData.riskTolerance || ''}
                    onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Risk Tolerance</option>
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>

                  {/* Asset Classes (multiple select) */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium ${textClass} mb-2`}>
                      Favorite Asset Classes (select all that apply)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['NNN Industrial', 'NNN Retail', 'NNN Office', 'Multi-Family', 'Self-Storage', 'CRE Lending', 'Other'].map(assetClass => (
                        <label key={assetClass} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.assetClasses || []).includes(assetClass)}
                            onChange={(e) => {
                              const current = formData.assetClasses || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, assetClasses: [...current, assetClass] });
                              } else {
                                setFormData({ ...formData, assetClasses: current.filter(ac => ac !== assetClass) });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${textClass}`}>{assetClass}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Tags */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium ${textClass} mb-2`}>
                      Tags (comma-separated: Active, 1031 Exchange, Repeat Investor, etc.)
                    </label>
                    <input
                      type="text"
                      placeholder="Active, 1031 Exchange, Preferred Partner"
                      value={(formData.customTags || []).join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setFormData({ ...formData, customTags: tags });
                      }}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Initial Notes */}
                  <div className="col-span-2 mt-4">
                    <h4 className={`text-md font-semibold ${textClass} mb-3`}>Initial Notes</h4>
                    <select
                      value={formData.initialNoteCategory || 'general'}
                      onChange={(e) => setFormData({ ...formData, initialNoteCategory: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2`}
                    >
                      <option value="general">General</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                    </select>
                    <textarea
                      placeholder="Add notes about this partner (optional)..."
                      value={formData.initialNotes || ''}
                      onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 h-24`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSavePartner}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Update Partner' : 'Create Partner'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPartnerForm(false);
                      setFormData({});
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${textClass}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Partner Cards */}
            <div className="grid gap-6">
              {partners.filter(partner =>
                partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(partner => {
                const getInitials = (name) => {
                  if (!name) return '?';
                  const parts = name.split(' ');
                  if (parts.length === 1) return parts[0][0].toUpperCase();
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                };

                const lastContact = partner.noteHistory && partner.noteHistory.length > 0
                  ? formatRelativeTime(partner.noteHistory[partner.noteHistory.length - 1].timestamp)
                  : null;

                return (
                <div key={partner.id} className={`${cardBgClass} rounded-xl shadow-lg border ${borderClass} hover:shadow-xl transition overflow-hidden`}>
                  {/* Header */}
                  <div className={`p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {getInitials(partner.name)}
                        </div>
                      </div>

                      {/* Name and Entity */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => openContactProfile('partner', partner.id)}
                          className={`text-2xl font-bold ${textClass} mb-1 cursor-pointer hover:text-green-500 transition`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && openContactProfile('partner', partner.id)}
                          aria-label={`View ${partner.name} profile`}
                        >
                          {partner.name}
                        </h3>
                        {partner.entityName && (
                          <p className={`text-sm ${textSecondaryClass} flex items-center gap-1`}>
                            <Building2 size={14} />
                            {partner.entityName}
                          </p>
                        )}
                        {lastContact && (
                          <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Last contact: {lastContact}
                          </p>
                        )}
                      </div>

                      {/* Edit/Delete */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPartner(partner)}
                          className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                          title="Edit partner"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}`}
                          title="Delete partner"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const noteInput = document.querySelector(`#note-input-partner-${partner.id}`);
                          if (noteInput) noteInput.focus();
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition text-sm`}
                      >
                        <MessageSquare size={16} />
                        Note
                      </button>
                    </div>
                  </div>

                  {/* Contact & Investment Info */}
                  <div className="p-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b ${borderClass}">
                      {partner.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className={textSecondaryClass} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold mb-0.5`}>Email</div>
                            <a href={`mailto:${partner.email}`} className="text-sm text-blue-600 hover:text-blue-700 truncate block">
                              {partner.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {partner.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className={textSecondaryClass} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold mb-0.5`}>Phone</div>
                            <a href={`tel:${partner.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                              {partner.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Investment Profile */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4`}>
                    {partner.checkSize && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Check Size</div>
                        <div className={`text-sm font-medium ${textClass}`}>{partner.checkSize}</div>
                      </div>
                    )}
                    {partner.creExperience && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>CRE Experience</div>
                        <div className={`text-sm font-medium ${textClass}`}>{partner.creExperience}</div>
                      </div>
                    )}
                    {partner.background && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Background</div>
                        <div className={`text-sm font-medium ${textClass}`}>{partner.background}</div>
                      </div>
                    )}
                    {partner.riskTolerance && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Risk Tolerance</div>
                        <div className={`text-sm font-medium ${textClass}`}>{partner.riskTolerance}</div>
                      </div>
                    )}
                  </div>

                  {/* Asset Classes */}
                  {partner.assetClasses && partner.assetClasses.length > 0 && (
                    <div className="mb-4">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>Asset Classes</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.assetClasses.map(ac => (
                          <span key={ac} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {ac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Tags */}
                  {partner.customTags && partner.customTags.length > 0 && (
                    <div className="mb-4">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.customTags.map(tag => (
                          <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes & Activity Section */}
                  <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg`}>
                    <div className={`text-sm font-bold ${textClass} uppercase mb-4 flex items-center justify-between`}>
                      <span>Notes & Activity</span>
                      <span className={`text-xs ${textSecondaryClass} normal-case`}>
                        {(partner.noteHistory || []).length} note{(partner.noteHistory || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Add Note Form */}
                    <div className="mb-4">
                      <div className="flex gap-2 mb-2">
                        <select
                          value={noteCategory[`partner-${partner.id}`] || 'general'}
                          onChange={(e) => setNoteCategory({ ...noteCategory, [`partner-${partner.id}`]: e.target.value })}
                          className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="general">General</option>
                          <option value="call">Call</option>
                          <option value="meeting">Meeting</option>
                          <option value="email">Email</option>
                          <option value="site-visit">Site Visit</option>
                          <option value="due-diligence">Due Diligence</option>
                          <option value="follow-up">Follow-up</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          id={`note-input-partner-${partner.id}`}
                          placeholder="Add a note..."
                          value={noteContent[`partner-${partner.id}`] || ''}
                          onChange={(e) => setNoteContent({ ...noteContent, [`partner-${partner.id}`]: e.target.value })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                          rows="2"
                        />
                        <button
                          onClick={() => {
                            handleAddNote('partner', partner.id, noteContent[`partner-${partner.id}`], noteCategory[`partner-${partner.id}`] || 'general');
                            setNoteContent({ ...noteContent, [`partner-${partner.id}`]: '' });
                          }}
                          className="px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Note History */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {(partner.noteHistory || []).length === 0 && (
                        <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass}`}>
                          <MessageSquare size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                          <p className={`text-sm ${textSecondaryClass} font-medium`}>
                            No notes yet
                          </p>
                          <p className={`text-xs ${textSecondaryClass} mt-1`}>
                            Add your first note above to track interactions and updates
                          </p>
                        </div>
                      )}
                      {(partner.noteHistory || [])
                        .slice()
                        .reverse()
                        .map(note => {
                          const categoryColors = {
                            general: darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800',
                            call: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
                            meeting: darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
                            email: darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
                            'site-visit': darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
                            'due-diligence': darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
                            'follow-up': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                          };

                          const categoryLabels = {
                            general: 'General',
                            call: 'Call',
                            meeting: 'Meeting',
                            email: 'Email',
                            'site-visit': 'Site Visit',
                            'due-diligence': 'Due Diligence',
                            'follow-up': 'Follow-up'
                          };

                          const categoryLetters = {
                            general: 'G',
                            call: 'C',
                            meeting: 'M',
                            email: 'E',
                            'site-visit': 'S',
                            'due-diligence': 'D',
                            'follow-up': 'F'
                          };

                          const categoryBorderColors = {
                            general: 'border-l-gray-500',
                            call: 'border-l-green-500',
                            meeting: 'border-l-blue-500',
                            email: 'border-l-purple-500',
                            'site-visit': 'border-l-orange-500',
                            'due-diligence': 'border-l-red-500',
                            'follow-up': 'border-l-yellow-500'
                          };

                          const categoryBadgeColors = {
                            general: darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white',
                            call: darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white',
                            meeting: darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
                            email: darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white',
                            'site-visit': darkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white',
                            'due-diligence': darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white',
                            'follow-up': darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                          };

                          const isLongNote = note.content.length > 300;
                          const isExpanded = expandedNotes[note.id];

                          // Function to make URLs clickable
                          const linkifyText = (text) => {
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const parts = text.split(urlRegex);
                            return parts.map((part, i) => {
                              if (part.match(urlRegex)) {
                                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">{part}</a>;
                              }
                              return part;
                            });
                          };

                          return (
                            <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 rounded-lg border-l-4 ${categoryBorderColors[note.category] || categoryBorderColors.general} border-r ${borderClass} border-t ${borderClass} border-b ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
                              <div className="flex items-start gap-3 mb-3">
                                {/* Letter Badge */}
                                <div className={`w-8 h-8 rounded-full ${categoryBadgeColors[note.category] || categoryBadgeColors.general} flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
                                  {categoryLetters[note.category] || categoryLetters.general}
                                </div>

                                {/* Note Header */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-semibold ${textClass}`}>
                                        {categoryLabels[note.category] || categoryLabels.general}
                                      </span>
                                      <span className={`text-xs ${textSecondaryClass} font-medium`}>
                                        • {formatRelativeTime(note.timestamp)}
                                        {note.edited && ' • Edited'}
                                      </span>
                                    </div>
                                <div className="flex gap-1">
                                  {editingNoteId === note.id ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleEditNote('partner', partner.id, note.id, editingNoteContent);
                                          setEditingNoteId(null);
                                          setEditingNoteContent('');
                                        }}
                                        className="text-green-600 hover:text-green-700 text-xs p-1"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingNoteId(null);
                                          setEditingNoteContent('');
                                        }}
                                        className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingNoteId(note.id);
                                          setEditingNoteContent(note.content);
                                        }}
                                        className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNote('partner', partner.id, note.id)}
                                        className="text-red-600 hover:text-red-700 text-xs p-1"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              {editingNoteId === note.id ? (
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  rows="4"
                                />
                              ) : (
                                <div>
                                  <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                                    {isLongNote && !isExpanded
                                      ? linkifyText(note.content.substring(0, 300) + '...')
                                      : linkifyText(note.content)
                                    }
                                  </p>
                                  {isLongNote && (
                                    <button
                                      onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                                      className="text-blue-500 hover:text-blue-600 text-xs font-semibold mt-2"
                                    >
                                      {isExpanded ? 'Show less' : 'Read more'}
                                    </button>
                                  )}
                                </div>
                              )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  </div>
                </div>
              );
              })}
            </div>

            {partners.length === 0 && !showPartnerForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No partners yet. Click "Add Partner" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Gatekeepers Tab */}
        {activeTab === 'gatekeepers' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-2.5 ${textSecondaryClass}`} size={20} />
                <input
                  type="text"
                  placeholder="Search gatekeepers by name, company, title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                onClick={handleAddGatekeeper}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} /> Add Gatekeeper
              </button>
            </div>

            {/* Gatekeeper Form */}
            {showGatekeeperForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                <h2 className={`text-2xl font-bold ${textClass} mb-6`}>
                  {editingId ? 'Edit Gatekeeper' : 'Add New Gatekeeper'}
                </h2>

                <div className="space-y-6 mb-6">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Title (e.g., Executive Assistant, Office Manager)"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Company/Firm"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <input
                    type="text"
                    placeholder="Related To (optional - broker or contact they gate for)"
                    value={formData.relatedTo || ''}
                    onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveGatekeeper}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Update' : 'Add'} Gatekeeper
                  </button>
                  <button
                    onClick={() => setShowGatekeeperForm(false)}
                    className={`flex-1 border ${borderClass} ${textSecondaryClass} font-semibold py-3 rounded-lg ${hoverBgClass} transition`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Gatekeepers List */}
            <div className="grid gap-6">
              {gatekeepers.filter(gatekeeper =>
                gatekeeper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gatekeeper.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gatekeeper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gatekeeper.email?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(gatekeeper => {
                const getInitials = (name) => {
                  if (!name) return '?';
                  const parts = name.split(' ');
                  if (parts.length === 1) return parts[0][0].toUpperCase();
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                };

                return (
                <div key={gatekeeper.id} className={`${cardBgClass} rounded-xl shadow-lg border ${borderClass} hover:shadow-xl transition overflow-hidden`}>
                  {/* Header */}
                  <div className={`p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {getInitials(gatekeeper.name)}
                        </div>
                      </div>

                      {/* Name and Title */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => openContactProfile('gatekeeper', gatekeeper.id)}
                          className={`text-2xl font-bold ${textClass} mb-1 cursor-pointer hover:text-purple-500 transition`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && openContactProfile('gatekeeper', gatekeeper.id)}
                          aria-label={`View ${gatekeeper.name} profile`}
                        >
                          {gatekeeper.name}
                        </h3>
                        {gatekeeper.title && (
                          <p className={`text-sm ${textSecondaryClass}`}>{gatekeeper.title}</p>
                        )}
                        {gatekeeper.company && (
                          <p className={`text-sm ${textSecondaryClass} flex items-center gap-1 mt-1`}>
                            <Building2 size={14} />
                            {gatekeeper.company}
                          </p>
                        )}
                      </div>

                      {/* Edit/Delete */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGatekeeper(gatekeeper)}
                          className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                          title="Edit gatekeeper"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteGatekeeper(gatekeeper.id)}
                          className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}`}
                          title="Delete gatekeeper"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      {gatekeeper.phone && (
                        <a
                          href={`tel:${gatekeeper.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                      {gatekeeper.email && (
                        <a
                          href={`mailto:${gatekeeper.email}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gatekeeper.email && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Mail size={18} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Email</div>
                            <a href={`mailto:${gatekeeper.email}`} className="text-sm text-blue-600 hover:text-blue-700 truncate block">
                              {gatekeeper.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {gatekeeper.phone && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Phone size={18} className="text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Phone</div>
                            <a href={`tel:${gatekeeper.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                              {gatekeeper.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {gatekeeper.relatedTo && (
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Target size={18} className="text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Related To</div>
                            <div className={`text-sm ${textClass}`}>
                              {gatekeeper.relatedTo}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {gatekeepers.length === 0 && !showGatekeeperForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No gatekeepers yet. Click "Add Gatekeeper" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Total Contacts Tab */}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${textClass}`}>All Contacts</h2>
                <p className={textSecondaryClass}>
                  {brokers.length} Brokers • {gatekeepers.length} Gatekeepers • {partners.length} Partners
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondaryClass}`} size={20} />
                <input
                  type="text"
                  placeholder="Search contacts by name, company, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textSecondaryClass} hover:${textClass}`}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setContactFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      contactFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : `${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass}`
                    }`}
                  >
                    All ({brokers.length + gatekeepers.length + partners.length})
                  </button>
                  <button
                    onClick={() => setContactFilter('brokers')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      contactFilter === 'brokers'
                        ? 'bg-blue-600 text-white'
                        : `${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass}`
                    }`}
                  >
                    Brokers ({brokers.length})
                  </button>
                  <button
                    onClick={() => setContactFilter('gatekeepers')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      contactFilter === 'gatekeepers'
                        ? 'bg-blue-600 text-white'
                        : `${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass}`
                    }`}
                  >
                    Gatekeepers ({gatekeepers.length})
                  </button>
                  <button
                    onClick={() => setContactFilter('partners')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      contactFilter === 'partners'
                        ? 'bg-blue-600 text-white'
                        : `${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass}`
                    }`}
                  >
                    Partners ({partners.length})
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="ml-auto">
                  <select
                    value={contactSort}
                    onChange={(e) => setContactSort(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm`}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="recent">Sort by Recent Activity</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || contactFilter !== 'all') && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${textSecondaryClass}`}>Active filters:</span>
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {contactFilter !== 'all' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      {contactFilter.charAt(0).toUpperCase() + contactFilter.slice(1)}
                      <button onClick={() => setContactFilter('all')} className="hover:text-purple-900">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setContactFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Combined Contacts List */}
            <div className="grid gap-6">
              {(() => {
                // Combine all contacts with type information
                const allContacts = [
                  ...brokers.map(b => ({ ...b, contactType: 'broker', displayName: b.name, company: b.firmName })),
                  ...gatekeepers.map(g => ({ ...g, contactType: 'gatekeeper', displayName: g.name, company: g.company })),
                  ...partners.map(p => ({ ...p, contactType: 'partner', displayName: p.name, company: p.entityName }))
                ];

                // Apply filters
                let filtered = allContacts.filter(contact => {
                  // Type filter
                  if (contactFilter !== 'all' && contact.contactType !== contactFilter.slice(0, -1)) {
                    return false;
                  }

                  // Search filter
                  if (searchTerm) {
                    const search = searchTerm.toLowerCase();
                    return (
                      contact.displayName?.toLowerCase().includes(search) ||
                      contact.company?.toLowerCase().includes(search) ||
                      contact.email?.toLowerCase().includes(search) ||
                      contact.phone?.toLowerCase().includes(search) ||
                      contact.title?.toLowerCase().includes(search)
                    );
                  }

                  return true;
                });

                // Apply sorting
                if (contactSort === 'name') {
                  filtered.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
                } else if (contactSort === 'type') {
                  filtered.sort((a, b) => a.contactType.localeCompare(b.contactType));
                } else if (contactSort === 'recent') {
                  filtered.sort((a, b) => {
                    const aHistory = a.noteHistory || [];
                    const bHistory = b.noteHistory || [];
                    const aLastNote = aHistory.length > 0 ? new Date(aHistory[aHistory.length - 1].timestamp) : new Date(0);
                    const bLastNote = bHistory.length > 0 ? new Date(bHistory[bHistory.length - 1].timestamp) : new Date(0);
                    return bLastNote - aLastNote;
                  });
                }

                // Show empty state if no results
                if (filtered.length === 0) {
                  return (
                    <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center border ${borderClass}`}>
                      <Search size={64} className={`mx-auto mb-4 ${textSecondaryClass} opacity-50`} />
                      <p className={`${textClass} text-lg font-semibold mb-2`}>No contacts found</p>
                      <p className={`${textSecondaryClass}`}>
                        {searchTerm ? `No contacts match "${searchTerm}"` : 'Try adjusting your filters'}
                      </p>
                    </div>
                  );
                }

                // Render filtered contacts
                return filtered.map(contact => {
                  const typeConfig = {
                    broker: {
                      label: 'BROKER',
                      color: 'bg-blue-100 text-blue-800',
                      detailsTab: 'brokers'
                    },
                    gatekeeper: {
                      label: 'GATEKEEPER',
                      color: 'bg-purple-100 text-purple-800',
                      detailsTab: 'gatekeepers'
                    },
                    partner: {
                      label: 'PARTNER',
                      color: 'bg-green-100 text-green-800',
                      detailsTab: 'partners'
                    }
                  };

                  const config = typeConfig[contact.contactType];

                  return (
                    <div
                      key={`${contact.contactType}-${contact.id}`}
                      className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass} hover:shadow-xl transition cursor-pointer`}
                      onClick={() => {
                        setProfileContact(contact);
                        setViewingContactProfile(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-2xl font-bold ${textClass}`}>{contact.displayName}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          {contact.title && (
                            <p className={`${textSecondaryClass} text-sm`}>{contact.title}</p>
                          )}
                        </div>
                        <div className={`text-sm ${textSecondaryClass} flex items-center gap-1`}>
                          View Details
                          <ExternalLink size={14} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contact.company && (
                          <div className="text-sm">
                            <span className={`font-medium ${textSecondaryClass}`}>
                              {contact.contactType === 'broker' ? 'Firm:' : 'Company:'}
                            </span>
                            <span className={`${textClass} ml-2`}>{contact.company}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="text-sm">
                            <span className={`font-medium ${textSecondaryClass}`}>Email:</span>
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline ml-2">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="text-sm">
                            <span className={`font-medium ${textSecondaryClass}`}>Phone:</span>
                            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline ml-2">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.noteHistory && contact.noteHistory.length > 0 && (
                          <div className="text-sm">
                            <span className={`font-medium ${textSecondaryClass}`}>Last activity:</span>
                            <span className={`${textClass} ml-2`}>
                              {formatRelativeTime(contact.noteHistory[contact.noteHistory.length - 1].timestamp)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {(brokers.length === 0 && gatekeepers.length === 0 && partners.length === 0) && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No contacts yet. Add brokers, gatekeepers, and partners to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Follow-ups Tab (keeping old brokers section start) */}
        {activeTab === 'followups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${textClass}`}>Follow-ups</h2>
                <p className={textSecondaryClass}>Track and manage contact follow-ups</p>
              </div>
              <button
                onClick={() => {
                  setFormData({});
                  setEditingId(null);
                  setShowFollowUpForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Add Follow-up
              </button>
            </div>

            {/* Follow-up Form */}
            {showFollowUpForm && (
              <FollowUpForm
                contacts={[
                  ...brokers.map(b => ({
                    id: b.id,
                    name: b.name,
                    type: 'broker',
                    typeLabel: 'Broker',
                    company: b.firmName || b.company
                  })),
                  ...partners.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: 'partner',
                    typeLabel: 'Partner',
                    company: p.entityName
                  })),
                  ...gatekeepers.map(g => ({
                    id: g.id,
                    name: g.name,
                    type: 'gatekeeper',
                    typeLabel: 'Gatekeeper',
                    company: g.company
                  }))
                ]}
                onSave={async (followUpData) => {
                  const dataToSave = editingId ? { ...followUpData, id: editingId } : followUpData;
                  const success = await handleSaveFollowUp(dataToSave);
                  if (success) {
                    setShowFollowUpForm(false);
                    setFormData({});
                    setEditingId(null);
                  }
                }}
                onCancel={() => {
                  setShowFollowUpForm(false);
                  setFormData({});
                  setEditingId(null);
                }}
                initialData={formData}
                darkMode={darkMode}
                isEditing={!!editingId}
              />
            )}

            {/* Follow-ups List */}
            <div className="space-y-4">
              {followUps.filter(f => f.status !== 'completed').length === 0 && !showFollowUpForm && (
                <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                  <CheckCircle size={64} className={`mx-auto mb-4 ${textSecondaryClass} opacity-50`} />
                  <p className={`${textSecondaryClass} text-lg`}>No pending follow-ups. You're all caught up!</p>
                </div>
              )}

              {followUps
                .filter(f => f.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map(followUp => {
                  const overdue = isOverdue(followUp.dueDate);
                  const dueToday = isDueToday(followUp.dueDate);

                  return (
                    <div key={followUp.id} className={`${cardBgClass} rounded-xl shadow-lg p-6 border-l-4 ${
                      overdue ? 'border-red-500' : dueToday ? 'border-yellow-500' : 'border-green-500'
                    } ${borderClass}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {overdue && <AlertCircle size={20} className="text-red-500" />}
                            {dueToday && <Clock size={20} className="text-yellow-500" />}
                            {!overdue && !dueToday && <CheckCircle size={20} className="text-green-500" />}
                            <h3 className={`text-lg font-bold ${textClass}`}>{followUp.contactName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              darkMode ? 'bg-slate-700' : 'bg-slate-100'
                            }`}>
                              {followUp.type}
                            </span>
                            {followUp.priority === 'High' && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">HIGH</span>
                            )}
                          </div>
                          {followUp.notes && (
                            <div className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                              <p className={`text-sm ${textClass} leading-relaxed whitespace-pre-wrap`}>{followUp.notes}</p>
                            </div>
                          )}
                          <p className={`text-sm font-semibold ${
                            overdue ? 'text-red-500' : dueToday ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {overdue ? `⚠️ Overdue by ${getDaysAgo(followUp.dueDate)} days` :
                             dueToday ? '⏰ Due today' :
                             `📅 Due ${formatDate(followUp.dueDate)}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f));
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                            title="Mark as completed"
                          >
                            <CheckCircle size={18} />
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setFormData(followUp);
                              setEditingId(followUp.id);
                              setShowFollowUpForm(true);
                            }}
                            className={`p-2 rounded-lg ${hoverBgClass} transition`}
                            title="Edit"
                          >
                            <Edit2 size={18} style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmDialog(
                                'Delete Follow-up',
                                'Are you sure you want to delete this follow-up?',
                                () => setFollowUps(followUps.filter(f => f.id !== followUp.id)),
                                'danger'
                              );
                            }}
                            className={`p-2 rounded-lg ${hoverBgClass} transition`}
                            title="Delete"
                            aria-label="Delete follow-up"
                          >
                            <Trash2 size={18} style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Completed Follow-ups */}
            {followUps.filter(f => f.status === 'completed').length > 0 && (
              <div className="mt-8">
                <h3 className={`text-lg font-bold ${textClass} mb-4`}>Completed Follow-ups</h3>
                <div className="space-y-3">
                  {followUps
                    .filter(f => f.status === 'completed')
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                    .map(followUp => (
                      <div key={followUp.id} className={`${cardBgClass} rounded-lg p-4 border ${borderClass} opacity-60`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-500" />
                            <span className={`font-semibold ${textClass}`}>{followUp.contactName}</span>
                            <span className={`text-xs ${textSecondaryClass}`}>({followUp.type})</span>
                          </div>
                          <span className={`text-xs ${textSecondaryClass}`}>
                            Completed {formatDate(followUp.completedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${textClass}`}>Calendar & Events</h2>
                <p className={textSecondaryClass}>Schedule property tours, meetings, and deadlines</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarView(calendarView === 'month' ? 'list' : 'month')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  {calendarView === 'month' ? 'List View' : 'Month View'}
                </button>
                <button
                  onClick={() => {
                    setFormData({});
                    setEditingId(null);
                    setShowEventForm(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Add Event
                </button>
              </div>
            </div>

            {/* Event Form */}
            {showEventForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                <h3 className={`text-xl font-bold ${textClass} mb-6`}>
                  {editingId ? 'Edit Event' : 'New Event'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                  />
                  <select
                    value={formData.type || 'Property Tour'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                  >
                    <option value="Property Tour">Property Tour</option>
                    <option value="Broker Meeting">Broker Meeting</option>
                    <option value="Partner Presentation">Partner Presentation</option>
                    <option value="Due Diligence Deadline">Due Diligence Deadline</option>
                    <option value="Closing Date">Closing Date</option>
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="General">General</option>
                  </select>

                  {/* Date and Time Inputs */}
                  <div className="col-span-2 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${textClass} mb-2`}>Date</label>
                        <input
                          type="date"
                          value={formData.date ? formData.date.split('T')[0] : ''}
                          onChange={(e) => {
                            const time = formData.date ? formData.date.split('T')[1] || '12:00' : '12:00';
                            setFormData({ ...formData, date: `${e.target.value}T${time}` });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${textClass} mb-2`}>Time</label>
                        <input
                          type="time"
                          value={formData.date ? formData.date.split('T')[1]?.slice(0, 5) || '12:00' : '12:00'}
                          onChange={(e) => {
                            const date = formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0];
                            setFormData({ ...formData, date: `${date}T${e.target.value}` });
                          }}
                          className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                        />
                      </div>
                    </div>

                    {/* Time Presets */}
                    <div>
                      <label className={`block text-sm font-medium ${textClass} mb-2`}>Quick Time Presets</label>
                      <div className="flex flex-wrap gap-2">
                        {['09:00', '10:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              const date = formData.date ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0];
                              setFormData({ ...formData, date: `${date}T${time}` });
                            }}
                            className={`px-3 py-1.5 text-sm rounded-lg border ${borderClass} ${
                              darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                            } ${textClass} transition`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                  />

                  {/* Contact Tagging */}
                  <div className="col-span-2 space-y-3">
                    <label className={`block text-sm font-medium ${textClass}`}>Tag Contacts (Optional)</label>

                    {/* Selected Contacts (Chips) */}
                    {(formData.taggedContacts?.brokers?.length > 0 ||
                      formData.taggedContacts?.partners?.length > 0 ||
                      formData.taggedContacts?.gatekeepers?.length > 0) && (
                      <div className={`flex flex-wrap gap-2 p-3 rounded-lg border ${borderClass} ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        {formData.taggedContacts?.brokers?.map(brokerId => {
                          const broker = brokers.find(b => b.id === brokerId);
                          return broker ? (
                            <span key={brokerId} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-600 text-white">
                              {broker.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    taggedContacts: {
                                      ...formData.taggedContacts,
                                      brokers: formData.taggedContacts.brokers.filter(id => id !== brokerId)
                                    }
                                  });
                                }}
                                className="hover:bg-blue-700 rounded"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {formData.taggedContacts?.partners?.map(partnerId => {
                          const partner = partners.find(p => p.id === partnerId);
                          return partner ? (
                            <span key={partnerId} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-green-600 text-white">
                              {partner.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    taggedContacts: {
                                      ...formData.taggedContacts,
                                      partners: formData.taggedContacts.partners.filter(id => id !== partnerId)
                                    }
                                  });
                                }}
                                className="hover:bg-green-700 rounded"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {formData.taggedContacts?.gatekeepers?.map(gatekeeperId => {
                          const gatekeeper = gatekeepers.find(g => g.id === gatekeeperId);
                          return gatekeeper ? (
                            <span key={gatekeeperId} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-purple-600 text-white">
                              {gatekeeper.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    taggedContacts: {
                                      ...formData.taggedContacts,
                                      gatekeepers: formData.taggedContacts.gatekeepers.filter(id => id !== gatekeeperId)
                                    }
                                  });
                                }}
                                className="hover:bg-purple-700 rounded"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search contacts to tag..."
                        value={contactTagSearch}
                        onChange={(e) => setContactTagSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondaryClass}`} />
                    </div>

                    {/* Filtered Contacts List */}
                    {contactTagSearch && (
                      <div className={`max-h-64 overflow-y-auto rounded-lg border ${borderClass} ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {(() => {
                          const searchLower = contactTagSearch.toLowerCase();
                          const filteredBrokers = brokers.filter(b => b.name.toLowerCase().includes(searchLower));
                          const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchLower));
                          const filteredGatekeepers = gatekeepers.filter(g => g.name.toLowerCase().includes(searchLower));

                          const hasResults = filteredBrokers.length > 0 || filteredPartners.length > 0 || filteredGatekeepers.length > 0;

                          if (!hasResults) {
                            return (
                              <div className="p-4 text-center">
                                <p className={`text-sm ${textSecondaryClass}`}>No contacts found</p>
                              </div>
                            );
                          }

                          return (
                            <div className="p-2 space-y-2">
                              {filteredBrokers.length > 0 && (
                                <div>
                                  <div className={`text-xs font-semibold ${textSecondaryClass} px-2 py-1`}>Brokers</div>
                                  {filteredBrokers.map(broker => {
                                    const isSelected = formData.taggedContacts?.brokers?.includes(broker.id);
                                    return (
                                      <button
                                        key={broker.id}
                                        type="button"
                                        onClick={() => {
                                          const currentBrokers = formData.taggedContacts?.brokers || [];
                                          const newBrokers = isSelected
                                            ? currentBrokers.filter(id => id !== broker.id)
                                            : [...currentBrokers, broker.id];
                                          setFormData({
                                            ...formData,
                                            taggedContacts: {
                                              ...formData.taggedContacts,
                                              brokers: newBrokers
                                            }
                                          });
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                          isSelected
                                            ? 'bg-blue-600 text-white'
                                            : `${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} ${textClass}`
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{broker.name}</span>
                                          {isSelected && <span className="text-xs">✓</span>}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {filteredPartners.length > 0 && (
                                <div>
                                  <div className={`text-xs font-semibold ${textSecondaryClass} px-2 py-1`}>Partners</div>
                                  {filteredPartners.map(partner => {
                                    const isSelected = formData.taggedContacts?.partners?.includes(partner.id);
                                    return (
                                      <button
                                        key={partner.id}
                                        type="button"
                                        onClick={() => {
                                          const currentPartners = formData.taggedContacts?.partners || [];
                                          const newPartners = isSelected
                                            ? currentPartners.filter(id => id !== partner.id)
                                            : [...currentPartners, partner.id];
                                          setFormData({
                                            ...formData,
                                            taggedContacts: {
                                              ...formData.taggedContacts,
                                              partners: newPartners
                                            }
                                          });
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                          isSelected
                                            ? 'bg-green-600 text-white'
                                            : `${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} ${textClass}`
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{partner.name}</span>
                                          {isSelected && <span className="text-xs">✓</span>}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {filteredGatekeepers.length > 0 && (
                                <div>
                                  <div className={`text-xs font-semibold ${textSecondaryClass} px-2 py-1`}>Gatekeepers</div>
                                  {filteredGatekeepers.map(gatekeeper => {
                                    const isSelected = formData.taggedContacts?.gatekeepers?.includes(gatekeeper.id);
                                    return (
                                      <button
                                        key={gatekeeper.id}
                                        type="button"
                                        onClick={() => {
                                          const currentGatekeepers = formData.taggedContacts?.gatekeepers || [];
                                          const newGatekeepers = isSelected
                                            ? currentGatekeepers.filter(id => id !== gatekeeper.id)
                                            : [...currentGatekeepers, gatekeeper.id];
                                          setFormData({
                                            ...formData,
                                            taggedContacts: {
                                              ...formData.taggedContacts,
                                              gatekeepers: newGatekeepers
                                            }
                                          });
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                          isSelected
                                            ? 'bg-purple-600 text-white'
                                            : `${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} ${textClass}`
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>{gatekeeper.name}</span>
                                          {isSelected && <span className="text-xs">✓</span>}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {brokers.length === 0 && partners.length === 0 && gatekeepers.length === 0 && (
                      <p className={`text-sm ${textSecondaryClass} italic`}>
                        No contacts available. Add brokers, partners, or gatekeepers first.
                      </p>
                    )}
                  </div>

                  <textarea
                    placeholder="Description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass}`}
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={async () => {
                      const eventData = editingId ? { ...formData, id: editingId } : { ...formData };
                      const success = await handleSaveEvent(eventData);
                      if (success) {
                        setShowEventForm(false);
                        setFormData({});
                        setEditingId(null);
                        setContactTagSearch('');
                      }
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    {editingId ? 'Update' : 'Save'} Event
                  </button>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      setFormData({});
                      setEditingId(null);
                      setContactTagSearch('');
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Calendar Month View */}
            {calendarView === 'month' && (
              <div className={`${cardBgClass} rounded-xl shadow-lg border ${borderClass} overflow-hidden`}>
                {/* Calendar Header */}
                <div className={`p-6 border-b ${borderClass} flex items-center justify-between`}>
                  <button
                    onClick={goToPreviousMonth}
                    className={`p-2 rounded-lg ${hoverBgClass} transition`}
                    title="Previous Month"
                  >
                    <ChevronLeft size={24} className={textClass} />
                  </button>

                  <div className="text-center">
                    <h3 className={`text-2xl font-bold ${textClass}`}>
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </h3>
                    <button
                      onClick={goToToday}
                      className={`mt-1 text-sm ${textSecondaryClass} hover:text-blue-500 transition`}
                    >
                      Today
                    </button>
                  </div>

                  <button
                    onClick={goToNextMonth}
                    className={`p-2 rounded-lg ${hoverBgClass} transition`}
                    title="Next Month"
                  >
                    <ChevronRight size={24} className={textClass} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className={`text-center text-sm font-semibold ${textSecondaryClass} py-2`}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((day, index) => {
                      const dayEvents = day ? getEventsForDay(day) : [];
                      const isTodayCell = day && isToday(day);

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (day) {
                              // Show day details modal
                              setSelectedDayDetails({
                                day,
                                month: currentMonth,
                                year: currentYear,
                                events: dayEvents
                              });
                            }
                          }}
                          className={`min-h-[100px] p-2 rounded-lg border ${borderClass} ${
                            day
                              ? `${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'} cursor-pointer transition`
                              : darkMode ? 'bg-slate-900' : 'bg-slate-100'
                          } ${isTodayCell ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          {day && (
                            <>
                              <div className={`text-sm font-semibold mb-1 ${
                                isTodayCell ? 'text-blue-500' : textClass
                              }`}>
                                {day}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map(event => {
                                  const eventTime = new Date(event.date);
                                  const timeStr = eventTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                                  // Color code by event type
                                  const eventTypeColors = {
                                    'Property Tour': darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
                                    'Broker Meeting': darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800',
                                    'Partner Presentation': darkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800',
                                    'Due Diligence Deadline': darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800',
                                    'Closing Date': darkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800',
                                    'Follow-up Call': darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800',
                                    'General': darkMode ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-800',
                                  };

                                  return (
                                    <div
                                      key={event.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData(event);
                                        setEditingId(event.id);
                                        setShowEventForm(true);
                                      }}
                                      className={`text-xs px-2 py-1 rounded ${
                                        eventTypeColors[event.type] || (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800')
                                      } hover:opacity-80 transition cursor-pointer`}
                                      title={`${timeStr} - ${event.title}`}
                                    >
                                      <div className="font-semibold truncate">{timeStr}</div>
                                      <div className="truncate">{event.title}</div>
                                    </div>
                                  );
                                })}
                                {dayEvents.length > 2 && (
                                  <div
                                    className={`text-xs ${textSecondaryClass} px-2 py-1 font-semibold hover:text-blue-500 cursor-pointer transition`}
                                    title="Click day to view all events"
                                  >
                                    +{dayEvents.length - 2} more →
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Events List View */}
            {calendarView === 'list' && (
              <div className="space-y-4">
              {events.length === 0 && !showEventForm && (
                <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                  <Calendar size={64} className={`mx-auto mb-4 ${textSecondaryClass} opacity-50`} />
                  <p className={`${textSecondaryClass} text-lg`}>No events scheduled. Add your first event!</p>
                </div>
              )}

              {events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => {
                  const eventDate = new Date(event.date);
                  const isPast = eventDate < new Date();

                  return (
                    <div key={event.id} className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass} ${isPast ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar size={20} className="text-blue-500" />
                            <h3 className={`text-lg font-bold ${textClass}`}>{event.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              darkMode ? 'bg-slate-700' : 'bg-slate-100'
                            }`}>
                              {event.type}
                            </span>
                            {isPast && <span className="text-xs text-gray-500">(Past)</span>}
                          </div>
                          <p className={`${textSecondaryClass} mb-2`}>
                            📅 {formatDateTime(event.date)}
                          </p>
                          {event.location && (
                            <p className={`${textSecondaryClass} mb-2`}>
                              📍 {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className={`${textSecondaryClass} text-sm`}>{event.description}</p>
                          )}

                          {/* Tagged Contacts */}
                          {event.taggedContacts && (
                            <div className="mt-3 space-y-2">
                              {event.taggedContacts.brokers && event.taggedContacts.brokers.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className={`text-xs ${textSecondaryClass}`}>Brokers:</span>
                                  {event.taggedContacts.brokers.map(brokerId => {
                                    const broker = brokers.find(b => b.id === brokerId);
                                    return broker ? (
                                      <span key={brokerId} className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {broker.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              {event.taggedContacts.partners && event.taggedContacts.partners.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className={`text-xs ${textSecondaryClass}`}>Partners:</span>
                                  {event.taggedContacts.partners.map(partnerId => {
                                    const partner = partners.find(p => p.id === partnerId);
                                    return partner ? (
                                      <span key={partnerId} className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {partner.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              {event.taggedContacts.gatekeepers && event.taggedContacts.gatekeepers.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className={`text-xs ${textSecondaryClass}`}>Gatekeepers:</span>
                                  {event.taggedContacts.gatekeepers.map(gatekeeperId => {
                                    const gatekeeper = gatekeepers.find(g => g.id === gatekeeperId);
                                    return gatekeeper ? (
                                      <span key={gatekeeperId} className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                        {gatekeeper.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => exportToGoogleCalendar(event)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            title="Add to Google Calendar"
                          >
                            <Calendar size={18} />
                            Google Cal
                          </button>
                          <button
                            onClick={() => {
                              setFormData(event);
                              setEditingId(event.id);
                              setShowEventForm(true);
                            }}
                            className={`p-2 rounded-lg ${hoverBgClass} transition`}
                            title="Edit"
                          >
                            <Edit2 size={18} style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmDialog(
                                'Delete Event',
                                'Are you sure you want to delete this event?',
                                () => setEvents(events.filter(e => e.id !== event.id)),
                                'danger'
                              );
                            }}
                            className={`p-2 rounded-lg ${hoverBgClass} transition`}
                            title="Delete"
                            aria-label="Delete event"
                          >
                            <Trash2 size={18} style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedDayDetails(null)}
        >
          <div
            className={`${cardBgClass} rounded-xl shadow-xl border ${borderClass} max-w-2xl w-full max-h-[80vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b ${borderClass} flex items-center justify-between sticky top-0 ${cardBgClass} z-10`}>
              <div>
                <h3 className={`text-2xl font-bold ${textClass}`}>
                  {MONTH_NAMES[selectedDayDetails.month]} {selectedDayDetails.day}, {selectedDayDetails.year}
                </h3>
                <p className={`text-sm ${textSecondaryClass} mt-1`}>
                  {selectedDayDetails.events.length} event{selectedDayDetails.events.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className={`p-2 rounded-lg ${hoverBgClass} transition`}
                title="Close"
              >
                <X size={24} className={textClass} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Create New Event Button */}
              <button
                onClick={() => {
                  const selectedDate = new Date(selectedDayDetails.year, selectedDayDetails.month, selectedDayDetails.day, 12, 0);
                  const dateTimeString = selectedDate.toISOString().slice(0, 16);
                  setFormData({ date: dateTimeString });
                  setEditingId(null);
                  setShowEventForm(true);
                  setSelectedDayDetails(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Create Event on This Day
              </button>

              {/* Events List */}
              {selectedDayDetails.events.length === 0 ? (
                <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center`}>
                  <Calendar size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                  <p className={`${textSecondaryClass}`}>No events scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayDetails.events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(event => {
                      const eventDate = new Date(event.date);
                      const isPast = eventDate < new Date();

                      return (
                        <div
                          key={event.id}
                          className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-4 border ${borderClass} ${
                            isPast ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`font-bold ${textClass}`}>{event.title}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  darkMode ? 'bg-slate-700' : 'bg-slate-200'
                                } ${textSecondaryClass}`}>
                                  {event.type}
                                </span>
                                {isPast && <span className="text-xs text-gray-500">(Past)</span>}
                              </div>
                              <p className={`text-sm ${textSecondaryClass} mb-1`}>
                                🕐 {formatDateTime(event.date)}
                              </p>
                              {event.location && (
                                <p className={`text-sm ${textSecondaryClass} mb-1`}>
                                  📍 {event.location}
                                </p>
                              )}
                              {event.description && (
                                <p className={`text-sm ${textSecondaryClass} mt-2`}>{event.description}</p>
                              )}

                              {/* Tagged Contacts */}
                              {event.taggedContacts && (
                                <div className="mt-3 space-y-2">
                                  {event.taggedContacts.brokers && event.taggedContacts.brokers.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className={`text-xs ${textSecondaryClass}`}>Brokers:</span>
                                      {event.taggedContacts.brokers.map(brokerId => {
                                        const broker = brokers.find(b => b.id === brokerId);
                                        return broker ? (
                                          <span key={brokerId} className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {broker.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  {event.taggedContacts.partners && event.taggedContacts.partners.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className={`text-xs ${textSecondaryClass}`}>Partners:</span>
                                      {event.taggedContacts.partners.map(partnerId => {
                                        const partner = partners.find(p => p.id === partnerId);
                                        return partner ? (
                                          <span key={partnerId} className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {partner.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  {event.taggedContacts.gatekeepers && event.taggedContacts.gatekeepers.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className={`text-xs ${textSecondaryClass}`}>Gatekeepers:</span>
                                      {event.taggedContacts.gatekeepers.map(gatekeeperId => {
                                        const gatekeeper = gatekeepers.find(g => g.id === gatekeeperId);
                                        return gatekeeper ? (
                                          <span key={gatekeeperId} className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {gatekeeper.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFormData(event);
                                  setEditingId(event.id);
                                  setShowEventForm(true);
                                  setSelectedDayDetails(null);
                                }}
                                className={`p-2 rounded-lg ${hoverBgClass} transition`}
                                title="Edit"
                              >
                                <Edit2 size={16} style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
                              </button>
                              <button
                                onClick={() => {
                                  showConfirmDialog(
                                    'Delete Event',
                                    'Are you sure you want to delete this event?',
                                    () => {
                                      setEvents(events.filter(e => e.id !== event.id));
                                      setSelectedDayDetails({
                                        ...selectedDayDetails,
                                        events: selectedDayDetails.events.filter(e => e.id !== event.id)
                                      });
                                    },
                                    'danger'
                                  );
                                }}
                                className={`p-2 rounded-lg ${hoverBgClass} transition`}
                                title="Delete"
                              >
                                <Trash2 size={16} style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {lightboxOpen && lightboxPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50"
          >
            <X size={36} />
          </button>

          {/* Previous Button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition z-50"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div
            className="max-w-7xl max-h-[90vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhotos[lightboxIndex]?.data}
              alt={lightboxPhotos[lightboxIndex]?.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {/* Image Info */}
            <div className="text-center mt-4 text-white">
              <p className="text-lg font-semibold">{lightboxPhotos[lightboxIndex]?.name}</p>
              <p className="text-sm text-gray-300 mt-1">
                {lightboxIndex + 1} / {lightboxPhotos.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          {lightboxPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition z-50"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
            <p className="opacity-75">
              Use arrow keys to navigate • Press ESC to close • Click outside to close
            </p>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {contactDetailOpen && selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setContactDetailOpen(false)}
        >
          <div
            className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setContactDetailOpen(false)}
              className={`absolute top-4 right-4 ${textSecondaryClass} hover:${textClass} transition`}
            >
              <X size={24} />
            </button>

            {/* Contact Header */}
            <div className={`p-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} border-b ${borderClass}`}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                    selectedContact.contactType === 'broker' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    selectedContact.contactType === 'gatekeeper' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                    'bg-gradient-to-br from-green-500 to-green-600'
                  }`}>
                    {(() => {
                      const name = selectedContact.displayName || '';
                      const parts = name.split(' ');
                      if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    })()}
                  </div>
                </div>

                {/* Name and Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className={`text-3xl font-bold ${textClass}`}>{selectedContact.displayName}</h2>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      selectedContact.contactType === 'broker' ? 'bg-blue-100 text-blue-800' :
                      selectedContact.contactType === 'gatekeeper' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedContact.contactType.toUpperCase()}
                    </span>
                  </div>
                  {selectedContact.title && (
                    <p className={`${textSecondaryClass} mb-1`}>{selectedContact.title}</p>
                  )}
                  {selectedContact.company && (
                    <p className={`text-sm ${textSecondaryClass} flex items-center gap-1`}>
                      <Building2 size={14} />
                      {selectedContact.company}
                    </p>
                  )}
                  {selectedContact.noteHistory && selectedContact.noteHistory.length > 0 && (
                    <p className={`text-xs ${textSecondaryClass} mt-1`}>
                      Last contact: {formatRelativeTime(selectedContact.noteHistory[selectedContact.noteHistory.length - 1].timestamp)}
                    </p>
                  )}
                </div>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedContact.contactType === 'broker') {
                        const broker = brokers.find(b => b.id === selectedContact.id);
                        if (broker) handleEditBroker(broker);
                      } else if (selectedContact.contactType === 'gatekeeper') {
                        const gatekeeper = gatekeepers.find(g => g.id === selectedContact.id);
                        if (gatekeeper) handleEditGatekeeper(gatekeeper);
                      } else if (selectedContact.contactType === 'partner') {
                        const partner = partners.find(p => p.id === selectedContact.id);
                        if (partner) handleEditPartner(partner);
                      }
                      setContactDetailOpen(false);
                      setActiveTab(selectedContact.contactType === 'broker' ? 'brokers' : selectedContact.contactType === 'gatekeeper' ? 'gatekeepers' : 'partners');
                    }}
                    className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                    title="Edit contact"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedContact.contactType === 'broker') {
                        handleDeleteBroker(selectedContact.id);
                      } else if (selectedContact.contactType === 'gatekeeper') {
                        handleDeleteGatekeeper(selectedContact.id);
                      } else if (selectedContact.contactType === 'partner') {
                        handleDeletePartner(selectedContact.id);
                      }
                      setContactDetailOpen(false);
                    }}
                    aria-label={`Delete ${selectedContact.displayName}`}
                    className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'}`}
                    title="Delete contact"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-2 mt-4">
                {selectedContact.phone && (
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                )}
                {selectedContact.email && (
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                )}
                <button
                  onClick={() => {
                    const noteInput = document.querySelector(`#note-input-contact-detail-${selectedContact.contactType}-${selectedContact.id}`);
                    if (noteInput) noteInput.focus();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition text-sm`}
                >
                  <MessageSquare size={16} />
                  Note
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedContact.email && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Mail size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Email</div>
                      <a href={`mailto:${selectedContact.email}`} className="text-sm text-blue-600 hover:text-blue-700 truncate block">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Phone size={18} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Phone</div>
                      <a href={`tel:${selectedContact.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {(selectedContact.firmWebsite || selectedContact.website) && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Globe size={18} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Website</div>
                      <a href={selectedContact.firmWebsite || selectedContact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 truncate">
                        {(selectedContact.firmWebsite || selectedContact.website).replace(/^https?:\/\//, '')}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.crexiLink && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Building2 size={18} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Crexi Profile</div>
                      <a href={selectedContact.crexiLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View Profile
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.licenseNumber && (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Target size={18} className="text-cyan-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>License #</div>
                      <div className={`text-sm ${textClass}`}>
                        {selectedContact.licenseNumber}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes & Activity Section */}
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg`}>
                <div className={`text-sm font-bold ${textClass} uppercase mb-4 flex items-center justify-between`}>
                  <span>Notes & Activity</span>
                  <span className={`text-xs ${textSecondaryClass} normal-case`}>
                    {(selectedContact.noteHistory || []).length} note{(selectedContact.noteHistory || []).length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Add Note Form */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={noteCategory[`${selectedContact.contactType}-${selectedContact.id}`] || 'general'}
                      onChange={(e) => setNoteCategory({ ...noteCategory, [`${selectedContact.contactType}-${selectedContact.id}`]: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="general">General</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                      <option value="site-visit">Site Visit</option>
                      <option value="due-diligence">Due Diligence</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      id={`note-input-contact-detail-${selectedContact.contactType}-${selectedContact.id}`}
                      placeholder="Add a note..."
                      value={noteContent[`${selectedContact.contactType}-${selectedContact.id}`] || ''}
                      onChange={(e) => setNoteContent({ ...noteContent, [`${selectedContact.contactType}-${selectedContact.id}`]: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                      rows="3"
                    />
                    <button
                      onClick={() => {
                        handleAddNote(selectedContact.contactType, selectedContact.id, noteContent[`${selectedContact.contactType}-${selectedContact.id}`], noteCategory[`${selectedContact.contactType}-${selectedContact.id}`] || 'general');
                        setNoteContent({ ...noteContent, [`${selectedContact.contactType}-${selectedContact.id}`]: '' });
                        // Update selected contact to refresh the note history
                        setTimeout(() => {
                          const updatedContact =
                            selectedContact.contactType === 'broker' ? brokers.find(b => b.id === selectedContact.id) :
                            selectedContact.contactType === 'gatekeeper' ? gatekeepers.find(g => g.id === selectedContact.id) :
                            partners.find(p => p.id === selectedContact.id);
                          if (updatedContact) {
                            setSelectedContact({ ...updatedContact, contactType: selectedContact.contactType, displayName: updatedContact.name, company: selectedContact.company });
                          }
                        }, 100);
                      }}
                      className="px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Note History */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {(selectedContact.noteHistory || []).length === 0 && (
                    <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass}`}>
                      <MessageSquare size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                      <p className={`text-sm ${textSecondaryClass} font-medium`}>
                        No notes yet
                      </p>
                      <p className={`text-xs ${textSecondaryClass} mt-1`}>
                        Add your first note above to track interactions and updates
                      </p>
                    </div>
                  )}
                  {(selectedContact.noteHistory || [])
                    .slice()
                    .reverse()
                    .map(note => {
                      const categoryBadgeColors = {
                        general: darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white',
                        call: darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white',
                        meeting: darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
                        email: darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white',
                        'site-visit': darkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white',
                        'due-diligence': darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white',
                        'follow-up': darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                      };

                      const categoryLabels = {
                        general: 'G',
                        call: 'C',
                        meeting: 'M',
                        email: 'E',
                        'site-visit': 'S',
                        'due-diligence': 'D',
                        'follow-up': 'F'
                      };

                      const categoryBorderColors = {
                        general: 'border-l-gray-500',
                        call: 'border-l-green-500',
                        meeting: 'border-l-blue-500',
                        email: 'border-l-purple-500',
                        'site-visit': 'border-l-orange-500',
                        'due-diligence': 'border-l-red-500',
                        'follow-up': 'border-l-yellow-500'
                      };

                      const isLongNote = note.content.length > 300;
                      const isExpanded = expandedNotes[note.id];

                      const linkifyText = (text) => {
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = text.split(urlRegex);
                        return parts.map((part, i) => {
                          if (part.match(urlRegex)) {
                            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">{part}</a>;
                          }
                          return part;
                        });
                      };

                      return (
                        <div
                          key={note.id}
                          className={`p-3 rounded-lg border-l-4 ${categoryBorderColors[note.category || 'general']} ${darkMode ? 'bg-slate-800' : 'bg-white'} ${borderClass}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${categoryBadgeColors[note.category || 'general']}`}>
                                {categoryLabels[note.category || 'general']}
                              </div>
                              <span className={`text-xs ${textSecondaryClass}`}>
                                {formatRelativeTime(note.timestamp)}
                              </span>
                            </div>
                            {editingNoteId !== note.id && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteContent(note.content);
                                  }}
                                  className={`p-1 ${textSecondaryClass} hover:${textClass} transition`}
                                  title="Edit note"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteNote(selectedContact.contactType, selectedContact.id, note.id);
                                    setTimeout(() => {
                                      const updatedContact =
                                        selectedContact.contactType === 'broker' ? brokers.find(b => b.id === selectedContact.id) :
                                        selectedContact.contactType === 'gatekeeper' ? gatekeepers.find(g => g.id === selectedContact.id) :
                                        partners.find(p => p.id === selectedContact.id);
                                      if (updatedContact) {
                                        setSelectedContact({ ...updatedContact, contactType: selectedContact.contactType, displayName: updatedContact.name, company: selectedContact.company });
                                      }
                                    }, 100);
                                  }}
                                  className={`p-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition`}
                                  title="Delete note"
                                  aria-label="Delete note"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                rows="3"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    handleEditNote(selectedContact.contactType, selectedContact.id, note.id, editingNoteContent);
                                    setEditingNoteId(null);
                                    setTimeout(() => {
                                      const updatedContact =
                                        selectedContact.contactType === 'broker' ? brokers.find(b => b.id === selectedContact.id) :
                                        selectedContact.contactType === 'gatekeeper' ? gatekeepers.find(g => g.id === selectedContact.id) :
                                        partners.find(p => p.id === selectedContact.id);
                                      if (updatedContact) {
                                        setSelectedContact({ ...updatedContact, contactType: selectedContact.contactType, displayName: updatedContact.name, company: selectedContact.company });
                                      }
                                    }, 100);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className={`px-3 py-1 ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded text-xs font-semibold transition`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                                {isLongNote && !isExpanded
                                  ? <>{linkifyText(note.content.slice(0, 300))}...</>
                                  : linkifyText(note.content)
                                }
                              </p>
                              {isLongNote && (
                                <button
                                  onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Contact Profile */}
      {viewingContactProfile && profileContact && (
        <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
          <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
            {/* Sticky Header */}
            <div className={`sticky top-0 z-10 ${darkMode ? 'bg-slate-800' : 'bg-white'} border-b ${borderClass} shadow-md`}>
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setViewingContactProfile(false);
                    setShowInlineFollowUpForm(false);
                    setShowInlineEventForm(false);
                    setEditingObjective(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                >
                  <X size={20} />
                  Close Profile
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (profileContact.contactType === 'broker') {
                        const broker = brokers.find(b => b.id === profileContact.id);
                        if (broker) handleEditBroker(broker);
                      } else if (profileContact.contactType === 'gatekeeper') {
                        const gatekeeper = gatekeepers.find(g => g.id === profileContact.id);
                        if (gatekeeper) handleEditGatekeeper(gatekeeper);
                      } else if (profileContact.contactType === 'partner') {
                        const partner = partners.find(p => p.id === profileContact.id);
                        if (partner) handleEditPartner(partner);
                      }
                      setViewingContactProfile(false);
                      setActiveTab(profileContact.contactType === 'broker' ? 'brokers' : profileContact.contactType === 'gatekeeper' ? 'gatekeepers' : 'partners');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (profileContact.contactType === 'broker') {
                        handleDeleteBroker(profileContact.id);
                      } else if (profileContact.contactType === 'gatekeeper') {
                        handleDeleteGatekeeper(profileContact.id);
                      } else if (profileContact.contactType === 'partner') {
                        handleDeletePartner(profileContact.id);
                      }
                      setViewingContactProfile(false);
                    }}
                    aria-label={`Delete ${profileContact.displayName}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 space-y-6">
              {/* Profile Header */}
              <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${
                      profileContact.contactType === 'broker' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      profileContact.contactType === 'gatekeeper' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {(() => {
                        const name = profileContact.displayName || '';
                        const parts = name.split(' ');
                        if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className={`text-4xl font-bold ${textClass}`}>{profileContact.displayName}</h1>
                      <span className={`px-3 py-1 text-sm font-semibold rounded ${
                        profileContact.contactType === 'broker' ? 'bg-blue-100 text-blue-800' :
                        profileContact.contactType === 'gatekeeper' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {profileContact.contactType.toUpperCase()}
                      </span>
                    </div>
                    {profileContact.title && (
                      <p className={`text-lg ${textSecondaryClass} mb-2`}>{profileContact.title}</p>
                    )}
                    {profileContact.company && (
                      <p className={`text-md ${textSecondaryClass} flex items-center gap-2`}>
                        <Building2 size={18} />
                        {profileContact.company}
                      </p>
                    )}
                    {profileContact.noteHistory && profileContact.noteHistory.length > 0 && (
                      <p className={`text-sm ${textSecondaryClass} mt-2`}>
                        Last contact: {formatRelativeTime(profileContact.noteHistory[profileContact.noteHistory.length - 1].timestamp)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Objective */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} border-l-4 border-blue-500 mb-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-bold ${textClass} uppercase flex items-center gap-2`}>
                      <Target size={18} />
                      Current Objective
                    </h3>
                    {!editingObjective && (
                      <button
                        onClick={() => {
                          setEditingObjective(true);
                          setObjectiveText(profileContact.currentObjective || '');
                        }}
                        className={`text-xs px-3 py-1 rounded ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-blue-200 hover:bg-blue-300'} ${textClass} font-semibold transition`}
                      >
                        {profileContact.currentObjective ? 'Edit' : 'Set Objective'}
                      </button>
                    )}
                  </div>
                  {editingObjective ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g., Send Pitch Deck, Send OnBoarding Agreements, Schedule Site Visit..."
                        value={objectiveText}
                        onChange={(e) => setObjectiveText(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (profileContact.contactType === 'broker') {
                              setBrokers(brokers.map(b => b.id === profileContact.id ? { ...b, currentObjective: objectiveText } : b));
                            } else if (profileContact.contactType === 'gatekeeper') {
                              setGatekeepers(gatekeepers.map(g => g.id === profileContact.id ? { ...g, currentObjective: objectiveText } : g));
                            } else if (profileContact.contactType === 'partner') {
                              setPartners(partners.map(p => p.id === profileContact.id ? { ...p, currentObjective: objectiveText } : p));
                            }
                            setProfileContact({ ...profileContact, currentObjective: objectiveText });
                            setEditingObjective(false);
                            showToast('Objective updated!', 'success');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingObjective(false)}
                          className={`px-4 py-2 ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg text-sm font-semibold transition`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${textClass} ${!profileContact.currentObjective && 'italic opacity-60'}`}>
                      {profileContact.currentObjective || 'No current objective set'}
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {profileContact.phone && (
                    <a
                      href={`tel:${profileContact.phone}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                      <Phone size={20} />
                      Call {profileContact.phone}
                    </a>
                  )}
                  {profileContact.email && (
                    <a
                      href={`mailto:${profileContact.email}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      <Mail size={20} />
                      Send Email
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const noteInput = document.querySelector(`#note-input-profile-${profileContact.contactType}-${profileContact.id}`);
                      if (noteInput) {
                        noteInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => noteInput.focus(), 500);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-6 py-3 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} ${textClass} rounded-lg font-semibold transition`}
                  >
                    <MessageSquare size={20} />
                    Add Note
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                <h2 className={`text-xl font-bold ${textClass} mb-4`}>Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileContact.email && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Mail size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Email</div>
                        <a href={`mailto:${profileContact.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                          {profileContact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {profileContact.phone && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Phone size={20} className="text-green-500" />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Phone</div>
                        <a href={`tel:${profileContact.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                          {profileContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {(profileContact.firmWebsite || profileContact.website) && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Globe size={20} className="text-purple-500" />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Website</div>
                        <a href={profileContact.firmWebsite || profileContact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          {(profileContact.firmWebsite || profileContact.website).replace(/^https?:\/\//, '')}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  {profileContact.crexiLink && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Building2 size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>Crexi Profile</div>
                        <a href={profileContact.crexiLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          View Profile
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  {profileContact.licenseNumber && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Target size={20} className="text-cyan-500" />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondaryClass} uppercase font-semibold`}>License #</div>
                        <div className={`text-sm ${textClass}`}>
                          {profileContact.licenseNumber}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-ups & Events Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Follow-ups */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${textClass} flex items-center gap-2`}>
                      <Bell size={24} />
                      Follow-ups
                    </h2>
                    <button
                      onClick={() => {
                        setShowInlineFollowUpForm(!showInlineFollowUpForm);
                        if (!showInlineFollowUpForm) {
                          setInlineFollowUpData({ contactName: profileContact.displayName, type: 'Call', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      <Plus size={16} />
                      {showInlineFollowUpForm ? 'Cancel' : 'New'}
                    </button>
                  </div>

                  {showInlineFollowUpForm && (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} border-2 border-blue-500 mb-4`}>
                      <h3 className={`text-sm font-bold ${textClass} mb-3`}>Create Follow-up</h3>
                      <div className="space-y-3">
                        <select
                          value={inlineFollowUpData.type || 'Call'}
                          onChange={(e) => setInlineFollowUpData({ ...inlineFollowUpData, type: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option>Call</option>
                          <option>Email</option>
                          <option>Meeting</option>
                          <option>Site Visit</option>
                        </select>
                        <input
                          type="date"
                          value={inlineFollowUpData.dueDate || ''}
                          onChange={(e) => setInlineFollowUpData({ ...inlineFollowUpData, dueDate: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <select
                          value={inlineFollowUpData.priority || 'Medium'}
                          onChange={(e) => setInlineFollowUpData({ ...inlineFollowUpData, priority: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                        <textarea
                          placeholder="Notes..."
                          value={inlineFollowUpData.notes || ''}
                          onChange={(e) => setInlineFollowUpData({ ...inlineFollowUpData, notes: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                          rows="2"
                        />
                        <button
                          onClick={async () => {
                            const newFollowUp = {
                              ...inlineFollowUpData,
                              contactName: profileContact.displayName,
                              status: 'pending',
                              createdAt: new Date().toISOString()
                            };
                            const success = await handleSaveFollowUp(newFollowUp);
                            if (success) {
                              setShowInlineFollowUpForm(false);
                              setInlineFollowUpData({});
                            }
                          }}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Create Follow-up
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(() => {
                      const contactFollowUps = followUps.filter(f => f.contactName === profileContact.displayName).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                      if (contactFollowUps.length === 0) {
                        return (
                          <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-lg p-8 text-center`}>
                            <Bell size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                            <p className={`text-sm ${textSecondaryClass}`}>No follow-ups</p>
                          </div>
                        );
                      }
                      return contactFollowUps.map(followUp => {
                        const overdue = isOverdue(followUp.dueDate);
                        const dueToday = isDueToday(followUp.dueDate);
                        return (
                          <div key={followUp.id} className={`p-3 rounded-lg border-l-4 ${overdue ? 'border-red-500' : dueToday ? 'border-yellow-500' : 'border-green-500'} ${borderClass} ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>{followUp.type}</span>
                                  {followUp.status === 'completed' && (<span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">COMPLETED</span>)}
                                </div>
                                {followUp.notes && (<p className={`text-sm ${textClass} mb-1`}>{followUp.notes}</p>)}
                                <p className={`text-xs ${overdue ? 'text-red-500 font-semibold' : dueToday ? 'text-yellow-600 font-semibold' : textSecondaryClass}`}>
                                  {overdue ? `Overdue by ${getDaysAgo(followUp.dueDate)} days` : dueToday ? 'Due today' : `Due ${formatDate(followUp.dueDate)}`}
                                </p>
                              </div>
                              {followUp.status !== 'completed' && (
                                <button
                                  onClick={() => {
                                    setFollowUps(followUps.map(f => f.id === followUp.id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f));
                                    showToast('Follow-up completed!', 'success');
                                  }}
                                  className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-green-700 transition"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Calendar Events */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${textClass} flex items-center gap-2`}>
                      <Calendar size={24} />
                      Events
                    </h2>
                    <button
                      onClick={() => {
                        setShowInlineEventForm(!showInlineEventForm);
                        if (!showInlineEventForm) {
                          setInlineEventData({ title: `Meeting with ${profileContact.displayName}`, type: 'Meeting', date: new Date().toISOString().slice(0,16) });
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      <Plus size={16} />
                      {showInlineEventForm ? 'Cancel' : 'New'}
                    </button>
                  </div>

                  {showInlineEventForm && (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} border-2 border-blue-500 mb-4`}>
                      <h3 className={`text-sm font-bold ${textClass} mb-3`}>Create Event</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Event Title"
                          value={inlineEventData.title || ''}
                          onChange={(e) => setInlineEventData({ ...inlineEventData, title: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <select
                          value={inlineEventData.type || 'Meeting'}
                          onChange={(e) => setInlineEventData({ ...inlineEventData, type: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option>Meeting</option>
                          <option>Site Visit</option>
                          <option>Phone Call</option>
                          <option>Conference</option>
                          <option>Other</option>
                        </select>
                        <input
                          type="datetime-local"
                          value={inlineEventData.date || ''}
                          onChange={(e) => setInlineEventData({ ...inlineEventData, date: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <input
                          type="text"
                          placeholder="Location (optional)"
                          value={inlineEventData.location || ''}
                          onChange={(e) => setInlineEventData({ ...inlineEventData, location: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <button
                          onClick={async () => {
                            const newEvent = {
                              ...inlineEventData,
                              createdAt: new Date().toISOString()
                            };
                            const success = await handleSaveEvent(newEvent);
                            if (success) {
                              setShowInlineEventForm(false);
                              setInlineEventData({});
                            }
                          }}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Create Event
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(() => {
                      const contactEvents = events.filter(e => {
                        // Check if contact name appears in event text
                        const nameMatch = e.title?.includes(profileContact.displayName) ||
                                         e.location?.includes(profileContact.displayName) ||
                                         e.description?.includes(profileContact.displayName);

                        // Check if contact is tagged in the event
                        const tagMatch = profileContact.contactType === 'broker'
                          ? e.taggedContacts?.brokers?.includes(profileContact.id)
                          : profileContact.contactType === 'partner'
                          ? e.taggedContacts?.partners?.includes(profileContact.id)
                          : profileContact.contactType === 'gatekeeper'
                          ? e.taggedContacts?.gatekeepers?.includes(profileContact.id)
                          : false;

                        return nameMatch || tagMatch;
                      }).sort((a, b) => new Date(a.date) - new Date(b.date));
                      if (contactEvents.length === 0) {
                        return (
                          <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-lg p-8 text-center`}>
                            <Calendar size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                            <p className={`text-sm ${textSecondaryClass}`}>No events</p>
                          </div>
                        );
                      }
                      return contactEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setFormData(event);
                            setEditingId(event.id);
                            setShowEventForm(true);
                            setActiveTab('calendar');
                            setViewingContactProfile(false);
                          }}
                          className={`p-3 rounded-lg border ${borderClass} ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'} cursor-pointer transition`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold ${textClass} text-sm`}>{event.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-600' : 'bg-slate-200'} ${textSecondaryClass}`}>{event.type}</span>
                              </div>
                              {event.location && (<p className={`text-xs ${textSecondaryClass} mb-1`}>📍 {event.location}</p>)}
                              <p className={`text-xs ${textSecondaryClass}`}>{formatDateTime(event.date)}</p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Notes Section - Full Width */}
              <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                <div className={`text-xl font-bold ${textClass} mb-4 flex items-center justify-between`}>
                  <span className="flex items-center gap-2">
                    <MessageSquare size={24} />
                    Notes & Activity
                  </span>
                  <span className={`text-sm ${textSecondaryClass} normal-case font-normal`}>
                    {(profileContact.noteHistory || []).length} note{(profileContact.noteHistory || []).length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={noteCategory[`${profileContact.contactType}-${profileContact.id}`] || 'general'}
                      onChange={(e) => setNoteCategory({ ...noteCategory, [`${profileContact.contactType}-${profileContact.id}`]: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="general">General</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                      <option value="site-visit">Site Visit</option>
                      <option value="due-diligence">Due Diligence</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      id={`note-input-profile-${profileContact.contactType}-${profileContact.id}`}
                      placeholder="Add a note..."
                      value={noteContent[`${profileContact.contactType}-${profileContact.id}`] || ''}
                      onChange={(e) => setNoteContent({ ...noteContent, [`${profileContact.contactType}-${profileContact.id}`]: e.target.value })}
                      className={`flex-1 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                      rows="3"
                    />
                    <button
                      onClick={() => {
                        handleAddNote(profileContact.contactType, profileContact.id, noteContent[`${profileContact.contactType}-${profileContact.id}`], noteCategory[`${profileContact.contactType}-${profileContact.id}`] || 'general');
                        setNoteContent({ ...noteContent, [`${profileContact.contactType}-${profileContact.id}`]: '' });
                        setTimeout(() => {
                          const updatedContact =
                            profileContact.contactType === 'broker' ? brokers.find(b => b.id === profileContact.id) :
                            profileContact.contactType === 'gatekeeper' ? gatekeepers.find(g => g.id === profileContact.id) :
                            partners.find(p => p.id === profileContact.id);
                          if (updatedContact) {
                            setProfileContact({ ...updatedContact, contactType: profileContact.contactType, displayName: updatedContact.name, company: profileContact.company });
                          }
                        }, 100);
                      }}
                      className="px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Add Note
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(profileContact.noteHistory || []).length === 0 && (
                    <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-lg p-12 text-center border-2 border-dashed ${borderClass}`}>
                      <MessageSquare size={64} className={`mx-auto mb-4 ${textSecondaryClass} opacity-50`} />
                      <p className={`text-lg ${textClass} font-semibold mb-2`}>No notes yet</p>
                      <p className={`text-sm ${textSecondaryClass}`}>Add your first note above</p>
                    </div>
                  )}
                  {(profileContact.noteHistory || []).slice().reverse().map(note => {
                    const categoryColors = {
                      general: 'border-l-gray-500',
                      call: 'border-l-green-500',
                      meeting: 'border-l-blue-500',
                      email: 'border-l-purple-500',
                      'site-visit': 'border-l-orange-500',
                      'due-diligence': 'border-l-red-500',
                      'follow-up': 'border-l-yellow-500'
                    };
                    const isLongNote = note.content.length > 300;
                    const isExpanded = expandedNotes[note.id];
                    return (
                      <div key={note.id} className={`p-4 rounded-lg border-l-4 ${categoryColors[note.category || 'general']} ${darkMode ? 'bg-slate-700' : 'bg-white'} ${borderClass}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`text-sm font-semibold ${textClass}`}>{note.category || 'general'}</span>
                            <span className={`text-xs ${textSecondaryClass} ml-2`}>{formatRelativeTime(note.timestamp)}</span>
                          </div>
                        </div>
                        <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                          {isLongNote && !isExpanded ? note.content.slice(0, 300) + '...' : note.content}
                        </p>
                        {isLongNote && (
                          <button
                            onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                            className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-semibold"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Profile Full-Screen View */}
      {viewingPropertyProfile && profileProperty && (() => {
        const metrics = calculateMetrics(profileProperty);
        const propertyBrokers = (profileProperty.brokerIds || []).map(id => brokers.find(b => b.id === id)).filter(Boolean);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
            <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              {/* Sticky Header */}
              <div className={`sticky top-0 z-10 ${darkMode ? 'bg-slate-800' : 'bg-white'} border-b ${borderClass} shadow-md`}>
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setViewingPropertyProfile(false);
                      setSensitivityPropertyId(null);
                      setSensitivityTable(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                  >
                    <X size={20} />
                    Close Property
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        handleEditProperty(profileProperty);
                        setViewingPropertyProfile(false);
                        setActiveTab('assets');
                      }}
                      className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteProperty(profileProperty.id);
                        setViewingPropertyProfile(false);
                      }}
                      aria-label={`Delete ${profileProperty.address}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-100' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="container mx-auto px-6 py-8 space-y-6">
                {/* Property Header */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass}`}>
                  <div className="flex items-start gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
                        <Building2 size={48} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h1 className={`text-4xl font-bold ${textClass}`}>{profileProperty.address}</h1>
                        <span className="px-3 py-1 text-sm font-semibold rounded bg-indigo-100 text-indigo-800">
                          PROPERTY
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <p className={`text-lg ${textSecondaryClass} flex items-center gap-2`}>
                          <TrendingUp size={18} />
                          {formatNumber(profileProperty.squareFeet)} SF
                        </p>
                        {profileProperty.crexi && (
                          <a href={profileProperty.crexi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                            View on Crexi
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      {profileProperty.noteHistory && profileProperty.noteHistory.length > 0 && (
                        <p className={`text-sm ${textSecondaryClass} mt-2`}>
                          Last update: {formatRelativeTime(profileProperty.noteHistory[profileProperty.noteHistory.length - 1].timestamp)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Associated Brokers */}
                  {propertyBrokers.length > 0 && (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'} border-l-4 border-blue-500 mb-6`}>
                      <h3 className={`text-sm font-bold ${textClass} uppercase flex items-center gap-2 mb-3`}>
                        <User size={18} />
                        Associated Brokers
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {propertyBrokers.map(broker => (
                          <button
                            key={broker.id}
                            onClick={() => {
                              setViewingPropertyProfile(false);
                              openContactProfile('broker', broker.id);
                            }}
                            className={`inline-flex items-center px-3 py-2 rounded-lg font-medium cursor-pointer hover:opacity-80 transition ${
                              darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {broker.name}{broker.firmName ? ` - ${broker.firmName}` : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Photos */}
                {profileProperty.photos && profileProperty.photos.length > 0 && (
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                    <h2 className={`text-xl font-bold ${textClass} mb-4`}>
                      Property Photos ({profileProperty.photos.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profileProperty.photos.map((photo, index) => (
                        <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${borderClass} ${hoverBgClass} cursor-pointer transition`}>
                          <img
                            src={photo.data}
                            alt={photo.name}
                            className="w-full h-40 object-cover"
                            onClick={() => openLightbox(profileProperty.photos, index)}
                          />
                          <div className={`absolute bottom-0 left-0 right-0 ${darkMode ? 'bg-black bg-opacity-70' : 'bg-white bg-opacity-90'} p-2 opacity-0 group-hover:opacity-100 transition`}>
                            <p className={`text-xs ${textClass} truncate`}>{photo.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Metrics Overview */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <h2 className={`text-xl font-bold ${textClass} mb-4`}>Financial Metrics</h2>

                  {/* All-in Cost & Financing Summary */}
                  <div className={`p-4 rounded-lg mb-6 ${metricsBgClass}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>All-in Cost</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(metrics.allInCost)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Loan Amount ({profileProperty.ltvPercent}% LTV)</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(metrics.loanAmount)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Equity Required</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{formatCurrency(metrics.equityRequired)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Operating Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Rent</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.monthlyRent)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Annual NOI</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.noi)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Cap Rate</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatPercent(metrics.capRate)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>DSCR</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{metrics.dscr > 0 ? metrics.dscr.toFixed(2) : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Returns Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Debt Service Type</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.debtServiceType === 'interestOnly' ? 'Interest-Only' : 'Standard'}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Debt Service</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.monthlyDebtService)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Annual Cash Flow</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.annualCashFlow)}</div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Cash-on-Cash</div>
                      <div className={`text-lg font-semibold ${textClass}`}>{formatPercent(metrics.cashOnCash)}</div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <h2 className={`text-xl font-bold ${textClass} mb-4`}>Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Square Feet</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{formatNumber(profileProperty.squareFeet)}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Base Rent/SF</div>
                      <div className={`text-sm font-semibold ${textClass}`}>${profileProperty.monthlyBaseRentPerSqft || 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Purchase Price</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.purchasePrice ? formatCurrency(stripCommas(profileProperty.purchasePrice)) : 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Improvements</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.improvements ? formatCurrency(stripCommas(profileProperty.improvements)) : 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Closing Costs</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.closingCosts ? formatCurrency(stripCommas(profileProperty.closingCosts)) : '$0'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>LTV %</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.ltvPercent ? `${profileProperty.ltvPercent}%` : 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Interest Rate</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.interestRate ? `${profileProperty.interestRate}%` : 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Loan Term</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.loanTerm ? `${profileProperty.loanTerm} yrs` : 'N/A'}</div>
                    </div>
                    {profileProperty.exitCapRate && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Exit Cap Rate</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.exitCapRate}%</div>
                      </div>
                    )}
                    {profileProperty.holdingPeriodMonths && (
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Holding Period</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.holdingPeriodMonths} months ({(profileProperty.holdingPeriodMonths / 12).toFixed(1)} yrs)</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exit Analysis */}
                {profileProperty.holdingPeriodMonths && (
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                    <h2 className={`text-xl font-bold ${textClass} mb-4`}>Exit Analysis ({profileProperty.holdingPeriodMonths} months)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Exit Value</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.exitValue)}</div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Remaining Loan</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.remainingLoanBalance)}</div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Net Proceeds</div>
                        <div className={`text-lg font-semibold ${textClass}`}>{formatCurrency(metrics.netProceedsAtExit)}</div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Equity Multiple</div>
                        <div className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{metrics.equityMultiple > 0 ? `${metrics.equityMultiple.toFixed(2)}x` : 'N/A'}</div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>IRR</div>
                        <div className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{metrics.irr > 0 ? `${metrics.irr.toFixed(2)}%` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sensitivity Analysis */}
                {profileProperty.holdingPeriodMonths && (
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                    <button
                      onClick={() => {
                        if (sensitivityPropertyId === profileProperty.id) {
                          setSensitivityPropertyId(null);
                          setSensitivityTable(null);
                        } else {
                          setSensitivityPropertyId(profileProperty.id);
                          setSensitivityTable(null);
                          // Set default ranges based on current property values
                          const currentRent = parseFloat(profileProperty.monthlyBaseRentPerSqft) || 1.0;
                          const currentExitCap = parseFloat(profileProperty.exitCapRate) || 7.0;
                          setSensitivityRowMin((currentRent * 0.7).toFixed(2));
                          setSensitivityRowMax((currentRent * 1.3).toFixed(2));
                          setSensitivityColMin((currentExitCap - 2).toFixed(2));
                          setSensitivityColMax((currentExitCap + 2).toFixed(2));
                        }
                      }}
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                        darkMode
                          ? 'bg-purple-900 hover:bg-purple-800 text-purple-200'
                          : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                      }`}
                    >
                      {sensitivityPropertyId === profileProperty.id ? '− Hide' : '+ Show'} Sensitivity Analysis
                    </button>

                    {sensitivityPropertyId === profileProperty.id && (
                      <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className={`text-sm font-bold ${textSecondaryClass} uppercase mb-4`}>
                          Sensitivity Analysis
                        </div>

                        {/* Output Metric Selection */}
                        <div className="mb-4">
                          <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                            Output Metric
                          </label>
                          <select
                            value={sensitivityOutputMetric}
                            onChange={(e) => setSensitivityOutputMetric(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                          >
                            <option value="irr">IRR (Internal Rate of Return) %</option>
                            <option value="equityMultiple">Equity Multiple</option>
                            <option value="dscr">DSCR (Debt Service Coverage Ratio)</option>
                            <option value="cashOnCash">Cash-on-Cash Return %</option>
                            <option value="capRate">Cap Rate %</option>
                            <option value="annualCashFlow">Annual Cash Flow</option>
                            <option value="netProceedsAtExit">Net Proceeds at Exit</option>
                            <option value="noi">NOI (Net Operating Income)</option>
                          </select>
                        </div>

                        {/* Variable Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Row Variable */}
                          <div>
                            <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                              Row Variable
                            </label>
                            <select
                              value={sensitivityRowVar}
                              onChange={(e) => setSensitivityRowVar(e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                            >
                              <option value="monthlyBaseRentPerSqft">Monthly Rent/SF</option>
                              <option value="purchasePrice">Purchase Price</option>
                              <option value="improvements">Improvements</option>
                              <option value="closingCosts">Closing Costs</option>
                              <option value="ltvPercent">LTV %</option>
                              <option value="interestRate">Interest Rate</option>
                              <option value="exitCapRate">Exit Cap Rate</option>
                              <option value="holdingPeriodMonths">Holding Period</option>
                            </select>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className={`block text-xs ${textSecondaryClass} mb-1`}>Min</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sensitivityRowMin}
                                  onChange={(e) => setSensitivityRowMin(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs ${textSecondaryClass} mb-1`}>Max</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sensitivityRowMax}
                                  onChange={(e) => setSensitivityRowMax(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Column Variable */}
                          <div>
                            <label className={`block text-xs font-semibold ${textSecondaryClass} uppercase mb-2`}>
                              Column Variable
                            </label>
                            <select
                              value={sensitivityColVar}
                              onChange={(e) => setSensitivityColVar(e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                            >
                              <option value="monthlyBaseRentPerSqft">Monthly Rent/SF</option>
                              <option value="purchasePrice">Purchase Price</option>
                              <option value="improvements">Improvements</option>
                              <option value="closingCosts">Closing Costs</option>
                              <option value="ltvPercent">LTV %</option>
                              <option value="interestRate">Interest Rate</option>
                              <option value="exitCapRate">Exit Cap Rate</option>
                              <option value="holdingPeriodMonths">Holding Period</option>
                            </select>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className={`block text-xs ${textSecondaryClass} mb-1`}>Min</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sensitivityColMin}
                                  onChange={(e) => setSensitivityColMin(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs ${textSecondaryClass} mb-1`}>Max</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={sensitivityColMax}
                                  onChange={(e) => setSensitivityColMax(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Generate Button */}
                        <button
                          onClick={() => {
                            const table = generateSensitivityTable(
                              profileProperty,
                              sensitivityRowVar,
                              sensitivityColVar,
                              sensitivityRowMin,
                              sensitivityRowMax,
                              sensitivityColMin,
                              sensitivityColMax
                            );
                            setSensitivityTable(table);
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition mb-4"
                        >
                          Generate Sensitivity Table
                        </button>

                        {/* Sensitivity Table Display */}
                        {sensitivityTable && (() => {
                          // Metric metadata
                          const metricMeta = {
                            irr: { label: 'IRR %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 18, fair: 13 },
                            equityMultiple: { label: 'Equity Multiple', format: (v) => v > 0 ? `${v.toFixed(2)}x` : 'N/A', good: 2.0, fair: 1.5 },
                            dscr: { label: 'DSCR', format: (v) => v > 0 ? v.toFixed(2) : 'N/A', good: 1.25, fair: 1.0 },
                            cashOnCash: { label: 'Cash-on-Cash %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 8, fair: 5 },
                            capRate: { label: 'Cap Rate %', format: (v) => v > 0 ? `${v.toFixed(2)}%` : 'N/A', good: 7, fair: 5 },
                            annualCashFlow: { label: 'Annual Cash Flow', format: (v) => formatCurrency(v), good: 50000, fair: 25000 },
                            netProceedsAtExit: { label: 'Net Proceeds at Exit', format: (v) => formatCurrency(v), good: 500000, fair: 250000 },
                            noi: { label: 'NOI', format: (v) => formatCurrency(v), good: 100000, fair: 50000 }
                          };

                          const selectedMetric = metricMeta[sensitivityOutputMetric];

                          return (
                            <div className="overflow-x-auto">
                              <div className={`text-xs ${textSecondaryClass} mb-2 text-center`}>
                                {sensitivityTable.rowLabel} (rows) vs {sensitivityTable.colLabel} (columns) → {selectedMetric.label}
                              </div>
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr>
                                    <th className={`border ${borderClass} p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                      ↓ / →
                                    </th>
                                    {sensitivityTable.colValues.map((colVal, i) => (
                                      <th key={i} className={`border ${borderClass} p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                        {sensitivityTable.colFormat(colVal)}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sensitivityTable.tableData.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                      <td className={`border ${borderClass} p-2 font-semibold ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} ${textClass}`}>
                                        {sensitivityTable.rowFormat(sensitivityTable.rowValues[rowIdx])}
                                      </td>
                                      {row.map((cell, colIdx) => {
                                        // Get metric value
                                        const value = cell[sensitivityOutputMetric];

                                        // Color coding based on metric thresholds
                                        let bgColor = '';
                                        if (value >= selectedMetric.good) {
                                          bgColor = darkMode ? 'bg-green-900' : 'bg-green-100';
                                        } else if (value >= selectedMetric.fair) {
                                          bgColor = darkMode ? 'bg-yellow-900' : 'bg-yellow-100';
                                        } else {
                                          bgColor = darkMode ? 'bg-red-900' : 'bg-red-100';
                                        }

                                        return (
                                          <td key={colIdx} className={`border ${borderClass} p-2 text-center font-semibold ${bgColor} ${textClass}`}>
                                            {selectedMetric.format(value)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className={`text-xs ${textSecondaryClass} mt-2 text-center`}>
                                Color Guide: Green ≥{selectedMetric.format(selectedMetric.good)} | Yellow {selectedMetric.format(selectedMetric.fair)}-{selectedMetric.format(selectedMetric.good)} | Red &lt;{selectedMetric.format(selectedMetric.fair)}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes & Activity */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <div className={`text-xl font-bold ${textClass} mb-4 flex items-center justify-between`}>
                    <span>Notes & Activity</span>
                    <span className={`text-sm ${textSecondaryClass} font-normal`}>
                      {(profileProperty.noteHistory || []).length} note{(profileProperty.noteHistory || []).length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Add Note Form */}
                  <div className="mb-6">
                    <div className="flex gap-2 mb-2">
                      <select
                        value={noteCategory[`property-${profileProperty.id}`] || 'general'}
                        onChange={(e) => setNoteCategory({ ...noteCategory, [`property-${profileProperty.id}`]: e.target.value })}
                        className={`px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="general">General</option>
                        <option value="call">Call</option>
                        <option value="meeting">Meeting</option>
                        <option value="email">Email</option>
                        <option value="site-visit">Site Visit</option>
                        <option value="due-diligence">Due Diligence</option>
                        <option value="follow-up">Follow-up</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Add a note..."
                        value={noteContent[`property-${profileProperty.id}`] || ''}
                        onChange={(e) => setNoteContent({ ...noteContent, [`property-${profileProperty.id}`]: e.target.value })}
                        className={`flex-1 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        rows="3"
                      />
                      <button
                        onClick={() => {
                          handleAddNote('property', profileProperty.id, noteContent[`property-${profileProperty.id}`], noteCategory[`property-${profileProperty.id}`] || 'general');
                          setNoteContent({ ...noteContent, [`property-${profileProperty.id}`]: '' });
                          setTimeout(() => {
                            const updatedProperty = properties.find(p => p.id === profileProperty.id);
                            if (updatedProperty) {
                              setProfileProperty(updatedProperty);
                            }
                          }, 100);
                        }}
                        className="px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Note History */}
                  <div className="space-y-3">
                    {(profileProperty.noteHistory || []).length === 0 && (
                      <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass}`}>
                        <MessageSquare size={48} className={`mx-auto mb-3 ${textSecondaryClass} opacity-50`} />
                        <p className={`text-sm ${textSecondaryClass} font-medium`}>
                          No notes yet
                        </p>
                        <p className={`text-xs ${textSecondaryClass} mt-1`}>
                          Add your first note above to track interactions and updates
                        </p>
                      </div>
                    )}
                    {(profileProperty.noteHistory || [])
                      .slice()
                      .reverse()
                      .map(note => {
                        const categoryColors = {
                          general: darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800',
                          call: darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
                          meeting: darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
                          email: darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
                          'site-visit': darkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800',
                          'due-diligence': darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
                          'follow-up': darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                        };

                        const categoryLabels = {
                          general: 'General',
                          call: 'Call',
                          meeting: 'Meeting',
                          email: 'Email',
                          'site-visit': 'Site Visit',
                          'due-diligence': 'Due Diligence',
                          'follow-up': 'Follow-up'
                        };

                        const isLongNote = note.content.length > 300;
                        const isExpanded = expandedNotes[note.id];

                        const linkifyText = (text) => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g;
                          const parts = text.split(urlRegex);
                          return parts.map((part, i) => {
                            if (part.match(urlRegex)) {
                              return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">{part}</a>;
                            }
                            return part;
                          });
                        };

                        return (
                          <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 rounded-lg border ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${categoryColors[note.category] || categoryColors.general}`}>
                                  {categoryLabels[note.category] || categoryLabels.general}
                                </span>
                                <span className={`text-xs ${textSecondaryClass} font-medium`}>
                                  {formatRelativeTime(note.timestamp)}
                                  {note.edited && ' • Edited'}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {editingNoteId === note.id ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleEditNote('property', profileProperty.id, note.id, editingNoteContent);
                                        setEditingNoteId(null);
                                        setEditingNoteContent('');
                                        setTimeout(() => {
                                          const updatedProperty = properties.find(p => p.id === profileProperty.id);
                                          if (updatedProperty) {
                                            setProfileProperty(updatedProperty);
                                          }
                                        }, 100);
                                      }}
                                      className="text-green-600 hover:text-green-700 text-xs p-1"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(null);
                                        setEditingNoteContent('');
                                      }}
                                      className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(note.id);
                                        setEditingNoteContent(note.content);
                                      }}
                                      className={`${textSecondaryClass} hover:${textClass} text-xs p-1`}
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteNote('property', profileProperty.id, note.id);
                                        setTimeout(() => {
                                          const updatedProperty = properties.find(p => p.id === profileProperty.id);
                                          if (updatedProperty) {
                                            setProfileProperty(updatedProperty);
                                          }
                                        }, 100);
                                      }}
                                      className="text-red-600 hover:text-red-700 text-xs p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {editingNoteId === note.id ? (
                              <textarea
                                value={editingNoteContent}
                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                rows="4"
                              />
                            ) : (
                              <div>
                                <p className={`text-sm ${textClass} whitespace-pre-wrap leading-relaxed`}>
                                  {isLongNote && !isExpanded
                                    ? linkifyText(note.content.substring(0, 300) + '...')
                                    : linkifyText(note.content)
                                  }
                                </p>
                                {isLongNote && (
                                  <button
                                    onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })}
                                    className="text-blue-500 hover:text-blue-600 text-xs font-semibold mt-2"
                                  >
                                    {isExpanded ? 'Show less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Contact Tagging */}
                <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                  <h2 className={`text-xl font-bold ${textClass} mb-4`}>Associated Contacts</h2>

                  {/* Brokers */}
                  <div className="mb-4">
                    <label className={`block text-sm font-semibold ${textSecondaryClass} uppercase mb-2`}>Brokers</label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-2.5 ${textSecondaryClass}`} size={18} />
                      <input
                        type="text"
                        placeholder="Search brokers..."
                        value={propertyBrokerSearch}
                        onChange={(e) => setPropertyBrokerSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    {propertyBrokerSearch && (
                      <div className={`mt-2 max-h-48 overflow-y-auto border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {brokers.filter(b => b.name.toLowerCase().includes(propertyBrokerSearch.toLowerCase()) || (b.firmName && b.firmName.toLowerCase().includes(propertyBrokerSearch.toLowerCase()))).map(broker => (
                          <div
                            key={broker.id}
                            onClick={() => {
                              const currentIds = profileProperty.brokerIds || [];
                              if (!currentIds.includes(broker.id)) {
                                const updatedProperty = { ...profileProperty, brokerIds: [...currentIds, broker.id] };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                setPropertyBrokerSearch('');
                                showToast('Broker added', 'success');
                              }
                            }}
                            className={`p-3 border-b ${borderClass} cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition`}
                          >
                            <div className={`text-sm font-medium ${textClass}`}>{broker.name}</div>
                            {broker.firmName && <div className={`text-xs ${textSecondaryClass}`}>{broker.firmName}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(profileProperty.brokerIds || []).map(id => {
                        const broker = brokers.find(b => b.id === id);
                        if (!broker) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                            {broker.name}
                            <X
                              size={14}
                              className="cursor-pointer hover:text-blue-600"
                              onClick={() => {
                                const updatedProperty = { ...profileProperty, brokerIds: (profileProperty.brokerIds || []).filter(bid => bid !== id) };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                showToast('Broker removed', 'success');
                              }}
                            />
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Partners */}
                  <div className="mb-4">
                    <label className={`block text-sm font-semibold ${textSecondaryClass} uppercase mb-2`}>Partners</label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-2.5 ${textSecondaryClass}`} size={18} />
                      <input
                        type="text"
                        placeholder="Search partners..."
                        value={propertyPartnerSearch}
                        onChange={(e) => setPropertyPartnerSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                    </div>
                    {propertyPartnerSearch && (
                      <div className={`mt-2 max-h-48 overflow-y-auto border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {partners.filter(p => p.name.toLowerCase().includes(propertyPartnerSearch.toLowerCase()) || (p.type && p.type.toLowerCase().includes(propertyPartnerSearch.toLowerCase()))).map(partner => (
                          <div
                            key={partner.id}
                            onClick={() => {
                              const currentIds = profileProperty.partnerIds || [];
                              if (!currentIds.includes(partner.id)) {
                                const updatedProperty = { ...profileProperty, partnerIds: [...currentIds, partner.id] };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                setPropertyPartnerSearch('');
                                showToast('Partner added', 'success');
                              }
                            }}
                            className={`p-3 border-b ${borderClass} cursor-pointer hover:bg-green-50 dark:hover:bg-green-900 transition`}
                          >
                            <div className={`text-sm font-medium ${textClass}`}>{partner.name}</div>
                            {partner.type && <div className={`text-xs ${textSecondaryClass}`}>{partner.type}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(profileProperty.partnerIds || []).map(id => {
                        const partner = partners.find(p => p.id === id);
                        if (!partner) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                            {partner.name}
                            <X
                              size={14}
                              className="cursor-pointer hover:text-green-600"
                              onClick={() => {
                                const updatedProperty = { ...profileProperty, partnerIds: (profileProperty.partnerIds || []).filter(pid => pid !== id) };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                showToast('Partner removed', 'success');
                              }}
                            />
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gatekeepers */}
                  <div>
                    <label className={`block text-sm font-semibold ${textSecondaryClass} uppercase mb-2`}>Gatekeepers</label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-2.5 ${textSecondaryClass}`} size={18} />
                      <input
                        type="text"
                        placeholder="Search gatekeepers..."
                        value={propertyGatekeeperSearch}
                        onChange={(e) => setPropertyGatekeeperSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    {propertyGatekeeperSearch && (
                      <div className={`mt-2 max-h-48 overflow-y-auto border ${borderClass} rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {gatekeepers.filter(g => g.name.toLowerCase().includes(propertyGatekeeperSearch.toLowerCase()) || (g.company && g.company.toLowerCase().includes(propertyGatekeeperSearch.toLowerCase()))).map(gatekeeper => (
                          <div
                            key={gatekeeper.id}
                            onClick={() => {
                              const currentIds = profileProperty.gatekeeperIds || [];
                              if (!currentIds.includes(gatekeeper.id)) {
                                const updatedProperty = { ...profileProperty, gatekeeperIds: [...currentIds, gatekeeper.id] };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                setPropertyGatekeeperSearch('');
                                showToast('Gatekeeper added', 'success');
                              }
                            }}
                            className={`p-3 border-b ${borderClass} cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900 transition`}
                          >
                            <div className={`text-sm font-medium ${textClass}`}>{gatekeeper.name}</div>
                            {gatekeeper.company && <div className={`text-xs ${textSecondaryClass}`}>{gatekeeper.company}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(profileProperty.gatekeeperIds || []).map(id => {
                        const gatekeeper = gatekeepers.find(g => g.id === id);
                        if (!gatekeeper) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                            {gatekeeper.name}
                            <X
                              size={14}
                              className="cursor-pointer hover:text-purple-600"
                              onClick={() => {
                                const updatedProperty = { ...profileProperty, gatekeeperIds: (profileProperty.gatekeeperIds || []).filter(gid => gid !== id) };
                                setProperties(properties.map(p => p.id === profileProperty.id ? updatedProperty : p));
                                setProfileProperty(updatedProperty);
                                showToast('Gatekeeper removed', 'success');
                              }}
                            />
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'warning' && <AlertTriangle size={20} />}
            {toast.type === 'info' && <Bell size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        darkMode={darkMode}
      />
    </div>
  );
}
