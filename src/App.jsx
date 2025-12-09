import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Edit2, Search, Moon, Sun, X, Database, AlertTriangle, Calendar, Bell, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, Building2, Target, Phone, Mail, Video, MessageSquare, User, Globe, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import InlineEditField from './components/InlineEditField';
import ConfirmDialog from './components/ConfirmDialog';
import LoadingSpinner from './components/LoadingSpinner';
import FollowUpForm from './components/FollowUpForm';
import CustomSelect from './components/CustomSelect';
import NotesSidebar from './components/NotesSidebar';
import CommandCenter from './components/Dashboard/CommandCenter';
import { supabaseService, notesService, isSupabaseConfigured, supabase } from './services/supabase';
import {
  initGoogleCalendar,
  initGoogleOAuth,
  isGoogleCalendarReady,
  isGoogleCalendarConnected,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  syncEventToGoogle,
  deleteGoogleCalendarEvent,
  syncFromGoogleCalendar,
  syncAllEventsToGoogle
} from './services/googleCalendar';

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
  const [partnersInDeal, setPartnersInDeal] = useState([]);
  const [leases, setLeases] = useState([]);
  const [notes, setNotes] = useState([]); // Categorized notes for all entities

  // ==================
  // UI NAVIGATION STATE
  // ==================
  const [activeTab, setActiveTab] = useState('dashboard');
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
  // GOOGLE CALENDAR SYNC STATE
  // ==================
  const [googleCalendarReady, setGoogleCalendarReady] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ message: '', type: '' });
  const [isSyncing, setIsSyncing] = useState(false);

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
  // DEDICATED CARD EDIT MODE STATE
  // ==================
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editedCardData, setEditedCardData] = useState({});

  // Tab card edit mode state (for broker/partner/gatekeeper cards in tabs)
  const [editingBrokerCardId, setEditingBrokerCardId] = useState(null);
  const [editedBrokerCardData, setEditedBrokerCardData] = useState({});
  const [editingPartnerCardId, setEditingPartnerCardId] = useState(null);
  const [editedPartnerCardData, setEditedPartnerCardData] = useState({});
  const [editingGatekeeperCardId, setEditingGatekeeperCardId] = useState(null);
  const [editedGatekeeperCardData, setEditedGatekeeperCardData] = useState({});

  // ==================
  // PROPERTY PROFILE STATE
  // ==================
  const [viewingPropertyProfile, setViewingPropertyProfile] = useState(false);
  const [profileProperty, setProfileProperty] = useState(null);
  const [propertyBrokerSearch, setPropertyBrokerSearch] = useState('');
  const [propertyPartnerSearch, setPropertyPartnerSearch] = useState('');
  const [propertyGatekeeperSearch, setPropertyGatekeeperSearch] = useState('');

  // ==================
  // PARTNER RETURNS STATE
  // ==================
  const [showPartnerDealModal, setShowPartnerDealModal] = useState(false);
  const [selectedPropertyForDeal, setSelectedPropertyForDeal] = useState(null);
  const [partnerDealFormData, setPartnerDealFormData] = useState({
    partnerSelectionMode: 'existing', // 'existing' or 'custom'
    partnerId: '',
    partnerName: '',
    investmentAmount: ''
  });
  const [editingInvestment, setEditingInvestment] = useState({}); // Track which investment is being edited

  // ==================
  // LEASE MANAGEMENT STATE
  // ==================
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [editingLeaseId, setEditingLeaseId] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [leaseFormData, setLeaseFormData] = useState({
    name: '',
    pricePerSfMonth: '',
    termYears: '',
    // CAM fields
    camAmount: '',
    camType: 'per_month',
    // Rent increase fields
    rentIncreaseType: 'none',
    flatAnnualIncreasePercent: '',
    rentSteps: [],
    baseAnnualEscalationPercent: '',
    // TI and Allowance
    tenantImprovementAmount: '',
    tenantAllowanceAmount: ''
  });

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

  /**
   * Connect to Google Calendar
   * Initiates OAuth flow for calendar access
   * @async
   * @returns {Promise<void>}
   */
  const handleConnectCalendar = async () => {
    try {
      setSyncStatus({ message: 'Connecting to Google Calendar...', type: '' });
      await connectGoogleCalendar();
      setGoogleCalendarReady(true);
      setSyncStatus({ message: 'Google Calendar connected', type: 'success' });
      showToast('Google Calendar connected successfully', 'success');

      // Perform initial sync
      if (user) {
        const result = await syncFromGoogleCalendar();
        if (result.success) {
          setLastSyncTime(new Date());
          // Reload events and follow-ups after sync
          const [dbEvents, dbFollowUps] = await Promise.all([
            supabaseService.getAll('events'),
            supabaseService.getAll('follow_ups')
          ]);
          if (dbEvents) setEvents(dbEvents);
          if (dbFollowUps) setFollowUps(dbFollowUps);
        }
      }
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      setSyncStatus({ message: `Connection failed: ${error.message}`, type: 'error' });
      showToast('Failed to connect Google Calendar', 'error');
    }
  };

  /**
   * Disconnect from Google Calendar
   * Revokes OAuth token and clears stored credentials
   * @async
   * @returns {Promise<void>}
   */
  const handleDisconnectCalendar = async () => {
    try {
      await disconnectGoogleCalendar();
      setGoogleCalendarReady(false);
      setSyncStatus({ message: 'Google Calendar disconnected', type: '' });
      showToast('Google Calendar disconnected', 'success');
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
      showToast('Failed to disconnect Google Calendar', 'error');
    }
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
        const [dbProperties, dbBrokers, dbPartners, dbGatekeepers, dbEvents, dbFollowUps, dbPartnersInDeal, dbLeases, dbNotes] = await Promise.all([
          supabaseService.getAll('properties'),
          supabaseService.getAll('brokers'),
          supabaseService.getAll('partners'),
          supabaseService.getAll('gatekeepers'),
          supabaseService.getAll('events'),
          supabaseService.getAll('follow_ups'),
          supabaseService.getAll('partners_in_deal'),
          supabaseService.getAll('leases'),
          notesService.getAllNotes()
        ]);

        if (dbProperties) setProperties(dbProperties);
        if (dbBrokers) setBrokers(dbBrokers);
        if (dbPartners) setPartners(dbPartners);
        if (dbGatekeepers) setGatekeepers(dbGatekeepers);
        if (dbEvents) setEvents(dbEvents);
        if (dbFollowUps) setFollowUps(dbFollowUps);
        if (dbPartnersInDeal) setPartnersInDeal(dbPartnersInDeal);
        if (dbLeases) setLeases(dbLeases);
        if (dbNotes) setNotes(dbNotes);

        // Always load UI preferences from localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
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

  // Initialize Google Calendar API and OAuth client
  useEffect(() => {
    const initCalendar = async () => {
      try {
        // Initialize gapi client (no auth required yet)
        await initGoogleCalendar();

        // Initialize OAuth client
        await initGoogleOAuth();

        // Check if user already has a calendar token
        if (isGoogleCalendarConnected()) {
          setGoogleCalendarReady(true);
          console.log('Google Calendar already connected');
          setSyncStatus({ message: 'Google Calendar connected', type: 'success' });

          // Perform initial sync if user is logged in
          if (user) {
            const result = await syncFromGoogleCalendar();
            if (result.success) {
              setLastSyncTime(new Date());
              // Reload events and follow-ups after sync
              const [dbEvents, dbFollowUps] = await Promise.all([
                supabaseService.getAll('events'),
                supabaseService.getAll('follow_ups')
              ]);
              if (dbEvents) setEvents(dbEvents);
              if (dbFollowUps) setFollowUps(dbFollowUps);
            }
          }
        } else {
          setGoogleCalendarReady(false);
          setSyncStatus({ message: 'Connect Google Calendar to enable sync', type: '' });
        }
      } catch (error) {
        console.error('Failed to initialize Google Calendar:', error);
        setGoogleCalendarReady(false);
        setSyncStatus({ message: `Calendar initialization error: ${error.message}`, type: 'error' });
      }
    };

    initCalendar();
  }, [user]);

  // Periodic sync from Google Calendar (every 5 minutes)
  useEffect(() => {
    if (!googleCalendarReady || !user) return;

    const syncInterval = setInterval(async () => {
      try {
        setIsSyncing(true);
        console.log('Running periodic sync from Google Calendar...');

        const result = await syncFromGoogleCalendar();

        if (result.success) {
          setLastSyncTime(new Date());
          setSyncStatus({
            message: result.message || 'Synced successfully',
            type: 'success'
          });

          // Reload events and follow-ups after sync
          const [dbEvents, dbFollowUps] = await Promise.all([
            supabaseService.getAll('events'),
            supabaseService.getAll('follow_ups')
          ]);
          if (dbEvents) setEvents(dbEvents);
          if (dbFollowUps) setFollowUps(dbFollowUps);
        } else {
          setSyncStatus({
            message: result.message || 'Sync failed',
            type: 'warning'
          });
        }
      } catch (error) {
        console.error('Periodic sync error:', error);
        setSyncStatus({
          message: `Sync error: ${error.message}`,
          type: 'error'
        });
      } finally {
        setIsSyncing(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [googleCalendarReady, user]);

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
      initialLeaseTermYears: '',
      renewalOptionCount: '',
      renewalTermYears: '',
      annualRentEscalator: '',
      optionRentEscalator: '',
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
  // INLINE FIELD UPDATE OPERATIONS
  // ==================

  /**
   * Update a single field on a property inline
   * @param {string} propertyId - Property ID
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const updatePropertyField = async (propertyId, field, value) => {
    const updates = { [field]: value };

    // Update local state
    setProperties(properties.map(p =>
      p.id === propertyId ? { ...p, ...updates } : p
    ));

    // Update profile property state if this is the property being viewed
    if (profileProperty && profileProperty.id === propertyId) {
      setProfileProperty({ ...profileProperty, ...updates });
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.update('properties', propertyId, updates);
        showToast('Field updated', 'success');
      } catch (error) {
        console.error('Error updating property field:', error);
        showToast('Error updating field', 'error');
        throw error;
      }
    } else {
      showToast('Field updated (local only)', 'success');
    }
  };

  /**
   * Update a single field on a broker inline
   * @param {string} brokerId - Broker ID
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const updateBrokerField = async (brokerId, field, value) => {
    const updates = { [field]: value };

    // Update local state
    setBrokers(brokers.map(b =>
      b.id === brokerId ? { ...b, ...updates } : b
    ));

    // Update profile contact state if this is the broker being viewed
    if (profileContact && profileContact.contactType === 'broker' && profileContact.id === brokerId) {
      setProfileContact({ ...profileContact, ...updates });
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.update('brokers', brokerId, updates);
        showToast('Field updated', 'success');
      } catch (error) {
        console.error('Error updating broker field:', error);
        showToast('Error updating field', 'error');
        throw error;
      }
    } else {
      showToast('Field updated (local only)', 'success');
    }
  };

  /**
   * Update a single field on a partner inline
   * @param {string} partnerId - Partner ID
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const updatePartnerField = async (partnerId, field, value) => {
    const updates = { [field]: value };

    // Update local state
    setPartners(partners.map(p =>
      p.id === partnerId ? { ...p, ...updates } : p
    ));

    // Update profile contact state if this is the partner being viewed
    if (profileContact && profileContact.contactType === 'partner' && profileContact.id === partnerId) {
      setProfileContact({ ...profileContact, ...updates });
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.update('partners', partnerId, updates);
        showToast('Field updated', 'success');
      } catch (error) {
        console.error('Error updating partner field:', error);
        showToast('Error updating field', 'error');
        throw error;
      }
    } else {
      showToast('Field updated (local only)', 'success');
    }
  };

  /**
   * Update a single field on a gatekeeper inline
   * @param {string} gatekeeperId - Gatekeeper ID
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const updateGatekeeperField = async (gatekeeperId, field, value) => {
    const updates = { [field]: value };

    // Update local state
    setGatekeepers(gatekeepers.map(g =>
      g.id === gatekeeperId ? { ...g, ...updates } : g
    ));

    // Update profile contact state if this is the gatekeeper being viewed
    if (profileContact && profileContact.contactType === 'gatekeeper' && profileContact.id === gatekeeperId) {
      setProfileContact({ ...profileContact, ...updates });
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.update('gatekeepers', gatekeeperId, updates);
        showToast('Field updated', 'success');
      } catch (error) {
        console.error('Error updating gatekeeper field:', error);
        showToast('Error updating field', 'error');
        throw error;
      }
    } else {
      showToast('Field updated (local only)', 'success');
    }
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
  // PARTNER DEAL OPERATIONS
  // ==================

  /**
   * Open partner deal modal for a property
   * @param {string|number} propertyId - Property ID
   */
  const handleOpenPartnerDealModal = (propertyId) => {
    setSelectedPropertyForDeal(propertyId);
    setPartnerDealFormData({
      partnerSelectionMode: 'existing',
      partnerId: '',
      partnerName: '',
      investmentAmount: ''
    });
    setShowPartnerDealModal(true);
  };

  /**
   * Save partner deal (existing or custom partner)
   * @async
   */
  const handleSavePartnerDeal = async () => {
    const { partnerSelectionMode, partnerId, partnerName, investmentAmount } = partnerDealFormData;

    // Validate based on selection mode
    if (partnerSelectionMode === 'existing' && !partnerId) {
      showToast('Please select a partner', 'error');
      return;
    }
    if (partnerSelectionMode === 'custom' && !partnerName.trim()) {
      showToast('Please enter a partner name', 'error');
      return;
    }
    if (!investmentAmount) {
      showToast('Please enter investment amount', 'error');
      return;
    }

    // Build deal data based on selection mode
    const dealData = {
      property_id: selectedPropertyForDeal,
      partner_id: partnerSelectionMode === 'existing' ? partnerId : null,
      partner_name: partnerSelectionMode === 'custom' ? partnerName.trim() : null,
      investment_amount: parseFloat(investmentAmount)
    };

    try {
      if (isSupabaseConfigured()) {
        const savedDeal = await supabaseService.create('partners_in_deal', dealData);
        if (savedDeal) {
          setPartnersInDeal([...partnersInDeal, savedDeal]);
        }
      } else {
        setPartnersInDeal([...partnersInDeal, { ...dealData, id: Date.now() }]);
      }

      setShowPartnerDealModal(false);
      setSelectedPropertyForDeal(null);
      setPartnerDealFormData({
        partnerSelectionMode: 'existing',
        partnerId: '',
        partnerName: '',
        investmentAmount: ''
      });
      showToast('Partner added to deal', 'success');
    } catch (error) {
      console.error('Error adding partner to deal:', error);
      showToast('Error adding partner to deal', 'error');
    }
  };

  /**
   * Remove partner deal
   * @param {string|number} dealId - Deal ID to remove
   */
  const handleRemovePartnerDeal = (dealId) => {
    showConfirmDialog(
      'Remove Partner',
      'Are you sure you want to remove this partner from the deal?',
      async () => {
        setPartnersInDeal(partnersInDeal.filter(d => d.id !== dealId));

        if (isSupabaseConfigured()) {
          await supabaseService.delete('partners_in_deal', dealId);
        }

        showToast('Partner removed from deal', 'success');
      },
      'danger'
    );
  };

  /**
   * Start editing investment amount for a partner deal
   * @param {string|number} dealId - Deal ID
   * @param {number} currentAmount - Current investment amount
   */
  const handleStartEditInvestment = (dealId, currentAmount) => {
    setEditingInvestment({ ...editingInvestment, [dealId]: currentAmount });
  };

  /**
   * Save updated investment amount for a partner deal
   * @param {string|number} dealId - Deal ID
   * @async
   */
  const handleSaveInvestment = async (dealId) => {
    const newAmount = parseFloat(editingInvestment[dealId]);

    if (!newAmount || newAmount <= 0) {
      showToast('Please enter a valid investment amount', 'error');
      return;
    }

    try {
      // Update in state
      const updatedDeals = partnersInDeal.map(d =>
        d.id === dealId ? { ...d, investment_amount: newAmount } : d
      );
      setPartnersInDeal(updatedDeals);

      // Update in database
      if (isSupabaseConfigured()) {
        await supabaseService.update('partners_in_deal', dealId, {
          investment_amount: newAmount
        });
      }

      // Clear editing state
      const newEditingState = { ...editingInvestment };
      delete newEditingState[dealId];
      setEditingInvestment(newEditingState);

      showToast('Investment amount updated', 'success');
    } catch (error) {
      console.error('Error updating investment amount:', error);
      showToast('Error updating investment amount', 'error');
    }
  };

  /**
   * Cancel editing investment amount
   * @param {string|number} dealId - Deal ID
   */
  const handleCancelEditInvestment = (dealId) => {
    const newEditingState = { ...editingInvestment };
    delete newEditingState[dealId];
    setEditingInvestment(newEditingState);
  };

  /**
   * Calculate partner-specific returns based on their investment amount
   * @param {Object} property - Property object with all metrics
   * @param {number} partnerInvestmentAmount - Partner's investment amount
   * @returns {Object} Partner return metrics
   */
  const calculatePartnerReturns = (property, partnerInvestmentAmount) => {
    const metrics = calculateMetrics(property);
    const investmentAmount = parseFloat(partnerInvestmentAmount) || 0;

    if (investmentAmount <= 0 || metrics.equityRequired <= 0) {
      return {
        ownership_percent: 0,
        annual_cash_flow: 0,
        cash_on_cash: 0,
        exit_proceeds: 0,
        total_return: 0,
        irr: 0,
        equity_multiple: 0
      };
    }

    const holdingPeriodMonths = parseFloat(property.holdingPeriodMonths) || 0;
    const holdingPeriodYears = holdingPeriodMonths / 12;

    // Calculate ownership percentage
    const ownership_percent = (investmentAmount / metrics.equityRequired) * 100;

    // Calculate pro-rata annual cash flow
    const annual_cash_flow = (ownership_percent / 100) * metrics.annualCashFlow;

    // Calculate cash-on-cash return
    const cash_on_cash = investmentAmount > 0 ? (annual_cash_flow / investmentAmount) * 100 : 0;

    // Calculate pro-rata exit proceeds
    const exit_proceeds = (ownership_percent / 100) * metrics.netProceedsAtExit;

    // Calculate total return over holding period
    const total_return = (annual_cash_flow * holdingPeriodYears) + exit_proceeds;

    // IRR is same as deal IRR (pro-rata basis)
    const irr = metrics.irr;

    // Calculate equity multiple
    const equity_multiple = investmentAmount > 0 ? total_return / investmentAmount : 0;

    return {
      ownership_percent,
      annual_cash_flow,
      cash_on_cash,
      exit_proceeds,
      total_return,
      irr,
      equity_multiple
    };
  };

  // ==================
  // LEASE CRUD OPERATIONS
  // ==================

  /**
   * Open modal to add a new lease (property-specific)
   */
  const handleAddLease = (propertyId) => {
    if (!propertyId) {
      console.error('Cannot add lease: propertyId is missing');
      return;
    }
    setLeaseFormData({
      name: '',
      pricePerSfMonth: '',
      termYears: '',
      camAmount: '',
      camType: 'per_month',
      rentIncreaseType: 'none',
      flatAnnualIncreasePercent: '',
      rentSteps: [],
      baseAnnualEscalationPercent: '',
      tenantImprovementAmount: '',
      tenantAllowanceAmount: ''
    });
    setEditingLeaseId(null);
    setEditingPropertyId(propertyId);
    setShowLeaseModal(true);
  };

  /**
   * Open modal to edit an existing lease (property-specific)
   */
  const handleEditLease = (lease, propertyId) => {
    if (!propertyId) {
      console.error('Cannot edit lease: propertyId is missing');
      return;
    }
    setLeaseFormData({
      name: lease.lease_name || lease.name,
      pricePerSfMonth: lease.price_per_sf_month,
      termYears: lease.term_years,
      camAmount: lease.cam_amount || '',
      camType: lease.cam_type || 'per_month',
      rentIncreaseType: lease.rent_increase_type || 'none',
      flatAnnualIncreasePercent: lease.flat_annual_increase_percent || '',
      rentSteps: lease.rent_steps || [],
      baseAnnualEscalationPercent: lease.base_annual_escalation_percent || '',
      tenantImprovementAmount: lease.tenant_improvement_amount || '',
      tenantAllowanceAmount: lease.tenant_allowance_amount || ''
    });
    setEditingLeaseId(lease.id);
    setEditingPropertyId(propertyId);
    setShowLeaseModal(true);
  };

  /**
   * Save lease (create or update) - Property-specific
   */
  const handleSaveLease = async () => {
    if (!leaseFormData.name || !leaseFormData.pricePerSfMonth || !leaseFormData.termYears) {
      showToast('Please fill in all required lease fields (Name, Price per SF, Term)', 'error');
      return;
    }

    if (!editingPropertyId) {
      showToast('Property ID is required. Please select a property first.', 'error');
      return;
    }

    try {
      const leaseData = {
        lease_name: leaseFormData.name,
        price_per_sf_month: parseFloat(leaseFormData.pricePerSfMonth),
        term_years: parseInt(leaseFormData.termYears),
        property_id: editingPropertyId,
        // CAM fields
        cam_amount: leaseFormData.camAmount ? parseFloat(leaseFormData.camAmount) : null,
        cam_type: leaseFormData.camAmount ? leaseFormData.camType : null,
        // Rent increase fields
        rent_increase_type: leaseFormData.rentIncreaseType || 'none',
        flat_annual_increase_percent: leaseFormData.flatAnnualIncreasePercent ? parseFloat(leaseFormData.flatAnnualIncreasePercent) : 0,
        rent_steps: leaseFormData.rentSteps || [],
        base_annual_escalation_percent: leaseFormData.baseAnnualEscalationPercent ? parseFloat(leaseFormData.baseAnnualEscalationPercent) : 0,
        // TI and Allowance
        tenant_improvement_amount: leaseFormData.tenantImprovementAmount ? parseFloat(leaseFormData.tenantImprovementAmount) : null,
        tenant_allowance_amount: leaseFormData.tenantAllowanceAmount ? parseFloat(leaseFormData.tenantAllowanceAmount) : null
      };

      if (editingLeaseId) {
        // Update existing lease
        setLeases(leases.map(l => l.id === editingLeaseId ? { ...l, ...leaseData, id: editingLeaseId } : l));

        if (isSupabaseConfigured()) {
          await supabaseService.update('leases', editingLeaseId, leaseData);
        }

        showToast('Lease updated successfully', 'success');
      } else {
        // Create new lease
        if (isSupabaseConfigured()) {
          const savedLease = await supabaseService.create('leases', leaseData);
          setLeases([...leases, savedLease]);
        } else {
          setLeases([...leases, { ...leaseData, id: Date.now().toString() }]);
        }

        showToast('Lease created successfully', 'success');
      }

      setShowLeaseModal(false);
      setLeaseFormData({
        name: '',
        pricePerSfMonth: '',
        termYears: '',
        camAmount: '',
        camType: 'per_month',
        rentIncreaseType: 'none',
        flatAnnualIncreasePercent: '',
        rentSteps: [],
        baseAnnualEscalationPercent: '',
        tenantImprovementAmount: '',
        tenantAllowanceAmount: ''
      });
      setEditingLeaseId(null);
      setEditingPropertyId(null);
    } catch (error) {
      console.error('Error saving lease:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      showToast(`Failed to save lease: ${errorMessage}. Please check your inputs and try again.`, 'error');
    }
  };

  /**
   * Delete a lease
   */
  const handleDeleteLease = (leaseId) => {
    showConfirmDialog(
      'Delete Lease',
      'Are you sure you want to delete this lease? This action cannot be undone.',
      async () => {
        setLeases(leases.filter(l => l.id !== leaseId));

        if (isSupabaseConfigured()) {
          await supabaseService.delete('leases', leaseId);
        }

        showToast('Lease deleted', 'success');
      },
      'danger'
    );
  };

  /**
   * Update property's selected lease
   */
  const handlePropertyLeaseChange = async (propertyId, leaseId) => {
    try {
      // Update local state
      setProperties(properties.map(p =>
        p.id === propertyId ? { ...p, selected_lease_id: leaseId } : p
      ));

      // Update profile property if it's the one being viewed
      if (profileProperty && profileProperty.id === propertyId) {
        setProfileProperty({ ...profileProperty, selected_lease_id: leaseId });
      }

      // Update in database
      if (isSupabaseConfigured()) {
        await supabaseService.update('properties', propertyId, { selected_lease_id: leaseId });
      }

      showToast('Lease selection updated', 'success');
    } catch (error) {
      console.error('Error updating property lease:', error);
      showToast('Failed to update lease selection', 'error');
    }
  };

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
      let savedEvent = null;

      if (eventData.id && events.some(e => e.id === eventData.id)) {
        // Update existing event
        setEvents(events.map(e => e.id === eventData.id ? eventData : e));

        if (isSupabaseConfigured()) {
          await supabaseService.update('events', eventData.id, eventData);
          savedEvent = eventData;
        }
      } else {
        // Create new event
        const newEvent = { ...eventData, createdAt: eventData.createdAt || new Date().toISOString() };

        if (isSupabaseConfigured()) {
          savedEvent = await supabaseService.create('events', newEvent);
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

      // Sync to Google Calendar immediately
      if (savedEvent && isGoogleCalendarReady()) {
        try {
          await syncEventToGoogle(savedEvent, 'events');
          console.log('Event synced to Google Calendar');
        } catch (error) {
          console.error('Failed to sync event to Google Calendar:', error);
          showToast('Event saved but Google Calendar sync failed', 'warning');
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
        // Find the event to get google_event_id before deletion
        const eventToDelete = events.find(e => e.id === id);
        const googleEventId = eventToDelete?.google_event_id;

        setEvents(events.filter(e => e.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('events', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }

        // Delete from Google Calendar if synced
        if (googleEventId && isGoogleCalendarReady()) {
          try {
            await deleteGoogleCalendarEvent(googleEventId);
            console.log('Event deleted from Google Calendar');
          } catch (error) {
            console.error('Failed to delete from Google Calendar:', error);
            showToast('Deleted locally but Google Calendar sync failed', 'warning');
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

      let savedFollowUp = null;

      if (followUpData.id && followUps.some(f => f.id === followUpData.id)) {
        // Update existing follow-up
        setFollowUps(followUps.map(f => f.id === followUpData.id ? dataWithStatus : f));

        if (isSupabaseConfigured()) {
          await supabaseService.update('follow_ups', followUpData.id, dataWithStatus);
          savedFollowUp = dataWithStatus;
        }
      } else {
        // Create new follow-up
        const newFollowUp = { ...dataWithStatus, createdAt: dataWithStatus.createdAt || new Date().toISOString() };

        if (isSupabaseConfigured()) {
          savedFollowUp = await supabaseService.create('follow_ups', newFollowUp);
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

      // Sync to Google Calendar immediately
      if (savedFollowUp && isGoogleCalendarReady()) {
        try {
          await syncEventToGoogle(savedFollowUp, 'follow_ups');
          console.log('Follow-up synced to Google Calendar');
        } catch (error) {
          console.error('Failed to sync follow-up to Google Calendar:', error);
          showToast('Follow-up saved but Google Calendar sync failed', 'warning');
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
        // Find the follow-up to get google_event_id before deletion
        const followUpToDelete = followUps.find(f => f.id === id);
        const googleEventId = followUpToDelete?.google_event_id;

        setFollowUps(followUps.filter(f => f.id !== id));

        if (isSupabaseConfigured()) {
          const success = await supabaseService.delete('follow_ups', id);
          if (!success) {
            showToast('Deleted locally but Supabase sync failed', 'warning');
          }
        }

        // Delete from Google Calendar if synced
        if (googleEventId && isGoogleCalendarReady()) {
          try {
            await deleteGoogleCalendarEvent(googleEventId);
            console.log('Follow-up deleted from Google Calendar');
          } catch (error) {
            console.error('Failed to delete from Google Calendar:', error);
            showToast('Deleted locally but Google Calendar sync failed', 'warning');
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

    // Use selected lease if available, otherwise fall back to property's monthlyBaseRentPerSqft
    let monthlyBaseRent = parseFloat(prop.monthlyBaseRentPerSqft) || 0;
    let selectedLease = null;
    let camPerSfMonth = 0;
    let tenantImprovementAmount = 0;
    let tenantAllowanceAmount = 0;
    let rentIncreaseType = 'none';
    let flatAnnualIncreasePercent = 0;
    let rentSteps = [];
    let baseAnnualEscalationPercent = 0;

    if (prop.selected_lease_id) {
      selectedLease = leases.find(l => l.id === prop.selected_lease_id);
      if (selectedLease) {
        monthlyBaseRent = parseFloat(selectedLease.price_per_sf_month) || 0;

        // CAM charges
        if (selectedLease.cam_amount && selectedLease.cam_type) {
          const camAmount = parseFloat(selectedLease.cam_amount);
          if (selectedLease.cam_type === 'per_month') {
            camPerSfMonth = camAmount;
          } else if (selectedLease.cam_type === 'per_year') {
            camPerSfMonth = camAmount / 12;
          } else if (selectedLease.cam_type === 'total_annual' && sqft > 0) {
            camPerSfMonth = (camAmount / sqft) / 12;
          }
        }

        // TI and Allowance
        tenantImprovementAmount = parseFloat(selectedLease.tenant_improvement_amount) || 0;
        tenantAllowanceAmount = parseFloat(selectedLease.tenant_allowance_amount) || 0;

        // Rent increase structure
        rentIncreaseType = selectedLease.rent_increase_type || 'none';
        flatAnnualIncreasePercent = parseFloat(selectedLease.flat_annual_increase_percent) || 0;
        rentSteps = selectedLease.rent_steps || [];
        baseAnnualEscalationPercent = parseFloat(selectedLease.base_annual_escalation_percent) || 0;
      }
    }

    const purchasePrice = parseFloat(stripCommas(prop.purchasePrice)) || 0;
    const improvements = parseFloat(stripCommas(prop.improvements)) || 0;
    const closingCosts = parseFloat(stripCommas(prop.closingCosts)) || 0;
    const ltvPercent = parseFloat(prop.ltvPercent) || 0;
    const interestRate = parseFloat(prop.interestRate) || 0;
    const loanTerm = parseFloat(prop.loanTerm) || 30;
    const debtServiceType = prop.debtServiceType || 'standard';
    const exitCapRate = parseFloat(prop.exitCapRate) || 0;
    const holdingPeriodMonths = parseFloat(prop.holdingPeriodMonths) || 0;

    // Calculate All-in Cost (including TI and Allowance)
    const allInCost = purchasePrice + improvements + closingCosts + tenantImprovementAmount + tenantAllowanceAmount;

    // Calculate Monthly & Annual Rent including CAM (NNN - no expenses)
    const monthlyRent = sqft * (monthlyBaseRent + camPerSfMonth);
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

    // Calculate IRR (Internal Rate of Return) with rent increases
    let irr = 0;
    if (holdingPeriodMonths > 0 && equityRequired > 0) {
      const holdingPeriodYears = holdingPeriodMonths / 12;
      const cashFlows = [];

      // Year 0: Initial equity investment (negative)
      cashFlows.push(-equityRequired);

      // Helper function to calculate rent for a given year based on increase structure
      const calculateYearRent = (year) => {
        let yearlyRent = annualRent; // Base rent for Year 1

        if (rentIncreaseType === 'flat_annual' && flatAnnualIncreasePercent > 0) {
          // Apply flat annual increase: rent * (1 + rate)^(year - 1)
          yearlyRent = annualRent * Math.pow(1 + (flatAnnualIncreasePercent / 100), year - 1);
        } else if (rentIncreaseType === 'stepped' && rentSteps.length > 0) {
          // Apply stepped increases
          let cumulativeIncrease = 1.0;
          let lastStepYear = 0;

          // Sort steps by trigger year
          const sortedSteps = [...rentSteps].sort((a, b) => a.trigger_year - b.trigger_year);

          for (const step of sortedSteps) {
            if (step.trigger_year <= year) {
              // Apply the step increase
              cumulativeIncrease *= (1 + (step.increase_percent / 100));

              // Apply base escalation between steps
              if (baseAnnualEscalationPercent > 0 && lastStepYear > 0) {
                const yearsBetween = step.trigger_year - lastStepYear;
                cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), yearsBetween);
              }

              lastStepYear = step.trigger_year;
            }
          }

          // Apply base escalation from last step to current year
          if (baseAnnualEscalationPercent > 0 && lastStepYear > 0 && year > lastStepYear) {
            const yearsSinceLastStep = year - lastStepYear;
            cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), yearsSinceLastStep);
          } else if (baseAnnualEscalationPercent > 0 && lastStepYear === 0) {
            // No steps triggered yet, just apply base escalation
            cumulativeIncrease *= Math.pow(1 + (baseAnnualEscalationPercent / 100), year - 1);
          }

          yearlyRent = annualRent * cumulativeIncrease;
        } else if (rentIncreaseType === 'stepped_monthly' && rentSteps.length > 0) {
          // Apply monthly stepped rent (different price per SF for different month ranges)
          // Calculate the average rent for this year based on monthly steps
          const startMonth = (year - 1) * 12 + 1;
          const endMonth = year * 12;

          // Sort steps by month
          const sortedSteps = [...rentSteps].sort((a, b) => a.month - b.month);

          let totalYearRent = 0;
          for (let month = startMonth; month <= endMonth; month++) {
            // Find the applicable price per SF for this month
            let pricePerSF = monthlyBaseRent; // Default to base price

            // Find the last step that applies to this month
            for (let i = sortedSteps.length - 1; i >= 0; i--) {
              if (sortedSteps[i].month <= month) {
                pricePerSF = sortedSteps[i].price_per_sf;
                break;
              }
            }

            // Add this month's rent to the year total
            totalYearRent += pricePerSF * sqft;
          }

          yearlyRent = totalYearRent;
        }

        return yearlyRent;
      };

      // Years 1 through N: Annual cash flows with rent increases
      for (let year = 1; year <= Math.floor(holdingPeriodYears); year++) {
        const yearRent = calculateYearRent(year);
        const yearNOI = yearRent; // NNN: NOI = Rent
        const yearCashFlow = yearNOI - annualDebtService;
        cashFlows.push(yearCashFlow);
      }

      // Calculate final NOI for exit value (based on last year's rent with increases)
      const finalYear = Math.ceil(holdingPeriodYears);
      const finalYearRent = calculateYearRent(finalYear);
      const finalNOI = finalYearRent;
      const adjustedExitValue = exitCapRate > 0 ? finalNOI / (exitCapRate / 100) : 0;

      // Final year: Add exit proceeds to final cash flow
      if (cashFlows.length > 1) {
        cashFlows[cashFlows.length - 1] += (adjustedExitValue - remainingLoanBalance);
      } else {
        // If holding period < 1 year, still calculate with single period
        const yearRent = calculateYearRent(1);
        const yearNOI = yearRent;
        const yearCashFlow = yearNOI - annualDebtService;
        cashFlows.push(yearCashFlow * (holdingPeriodMonths / 12) + (adjustedExitValue - remainingLoanBalance));
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
          {/* Google Calendar Sync Status */}
          {user && (
            <div className={`px-3 py-2 rounded-lg text-xs ${
              darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className={
                  googleCalendarReady
                    ? 'text-green-500'
                    : 'text-slate-400'
                } />
                <span className={`font-semibold ${textClass}`}>
                  {googleCalendarReady ? 'Calendar Sync' : 'Calendar Offline'}
                </span>
              </div>
              {googleCalendarReady && lastSyncTime && (
                <div className={`${textSecondaryClass} text-[10px]`}>
                  Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </div>
              )}
              {syncStatus.message && (
                <div className={`mt-1 text-[10px] ${
                  syncStatus.type === 'success' ? 'text-green-500' :
                  syncStatus.type === 'error' ? 'text-red-500' :
                  syncStatus.type === 'warning' ? 'text-yellow-500' :
                  textSecondaryClass
                }`}>
                  {isSyncing && '🔄 '}
                  {syncStatus.message}
                </div>
              )}
            </div>
          )}
          {/* Google Calendar Connect/Disconnect Button */}
          {user && (
            <button
              onClick={googleCalendarReady ? handleDisconnectCalendar : handleConnectCalendar}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                googleCalendarReady
                  ? darkMode
                    ? 'bg-green-900/30 hover:bg-green-900/40 text-green-400 border border-green-700'
                    : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                  : darkMode
                    ? 'bg-indigo-900/30 hover:bg-indigo-900/40 text-indigo-400 border border-indigo-700'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
              title={googleCalendarReady ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
            >
              <Calendar size={16} />
              {googleCalendarReady ? 'Disconnect Calendar' : 'Connect Calendar'}
            </button>
          )}
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
              {activeTab === 'leases' && 'Lease Options'}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-8">


        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <CommandCenter
            darkMode={darkMode}
            properties={properties}
            brokers={brokers}
            partners={partners}
            gatekeepers={gatekeepers}
            events={events}
            followUps={followUps}
            notes={notes}
            leases={leases}
            loading={isLoadingData}
            onAddProperty={() => {
              setFormData({});
              setEditingId(null);
              setShowPropertyForm(true);
            }}
            onAddContact={() => {
              setFormData({});
              setEditingId(null);
              setShowBrokerForm(true);
            }}
            onAddEvent={() => {
              setFormData({});
              setEditingId(null);
              setShowEventForm(true);
            }}
            onAddFollowUp={() => {
              setFormData({});
              setEditingId(null);
              setShowFollowUpForm(true);
            }}
            onSaveNote={async (noteData) => {
              try {
                const newNote = {
                  id: Date.now().toString(),
                  ...noteData,
                  createdAt: new Date().toISOString(),
                };
                setNotes([...notes, newNote]);
                // Save to database if configured
                if (isSupabaseConfigured()) {
                  await notesService.createNote(newNote);
                }
              } catch (error) {
                console.error('Error saving note:', error);
              }
            }}
            onToggleComplete={async (type, id) => {
              if (type === 'followup') {
                const followUp = followUps.find(f => f.id === id);
                if (followUp) {
                  const updatedFollowUp = {
                    ...followUp,
                    status: followUp.status === 'completed' ? 'pending' : 'completed',
                    completedAt: followUp.status === 'completed' ? null : new Date().toISOString()
                  };
                  setFollowUps(followUps.map(f => f.id === id ? updatedFollowUp : f));
                  // Update database if configured
                  if (isSupabaseConfigured()) {
                    await supabaseService.updateFollowUp(id, updatedFollowUp);
                  }
                }
              }
            }}
            onContactClick={(contact) => {
              // Handle contact click - could open a modal or navigate to contact detail
              console.log('Contact clicked:', contact);
            }}
            onActivityClick={(activity) => {
              // Handle activity click
              console.log('Activity clicked:', activity);
            }}
            onDayClick={(date) => {
              // Handle day click - could navigate to calendar view
              console.log('Day clicked:', date);
            }}
            onItemClick={(item) => {
              // Handle item click
              console.log('Item clicked:', item);
            }}
          />
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
                    setIsEditingCard(false);
                    setEditedCardData({});
                  }}
                  className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                >
                  <X size={20} />
                  Close Profile
                </button>
                <div className="flex items-center gap-3">
                  {!isEditingCard ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditingCard(true);
                          setEditedCardData({...profileContact});
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
                    </>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          // Save all changes based on contact type
                          const updates = {};
                          let editableFields = [];

                          if (profileContact.contactType === 'broker') {
                            editableFields = ['name', 'firmName', 'email', 'phone'];
                          } else if (profileContact.contactType === 'partner') {
                            editableFields = ['name', 'commitmentAmount', 'email', 'phone', 'website'];
                          } else if (profileContact.contactType === 'gatekeeper') {
                            editableFields = ['name', 'title', 'company', 'email', 'phone', 'firmWebsite'];
                          }

                          editableFields.forEach(field => {
                            const displayField = field === 'name' ? 'displayName' : field;
                            if (editedCardData[displayField] !== profileContact[displayField]) {
                              updates[field] = editedCardData[displayField];
                            }
                          });

                          if (Object.keys(updates).length > 0) {
                            for (const [field, value] of Object.entries(updates)) {
                              if (profileContact.contactType === 'broker') {
                                await updateBrokerField(profileContact.id, field, value);
                              } else if (profileContact.contactType === 'partner') {
                                await updatePartnerField(profileContact.id, field, value);
                              } else if (profileContact.contactType === 'gatekeeper') {
                                await updateGatekeeperField(profileContact.id, field, value);
                              }
                            }
                          }

                          setIsEditingCard(false);
                          setEditedCardData({});
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingCard(false);
                          setEditedCardData({});
                        }}
                        className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                      >
                        Cancel
                      </button>
                    </>
                  )}
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
                      {isEditingCard ? (
                        <input
                          type="text"
                          value={editedCardData.displayName || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, displayName: e.target.value})}
                          className={`text-2xl font-bold ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-3 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Contact Name"
                        />
                      ) : (
                        <h2 className={`text-2xl font-bold ${textClass}`}>
                          {profileContact.displayName || 'No name'}
                        </h2>
                      )}
                      <span className={`px-3 py-1 text-sm font-semibold rounded ${
                        profileContact.contactType === 'broker' ? 'bg-blue-100 text-blue-800' :
                        profileContact.contactType === 'gatekeeper' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {profileContact.contactType.toUpperCase()}
                      </span>
                    </div>
                    {(profileContact.contactType === 'gatekeeper' || profileContact.title || isEditingCard) && (
                      <div className="mb-2">
                        {isEditingCard ? (
                          <input
                            type="text"
                            value={editedCardData.title || ''}
                            onChange={(e) => setEditedCardData({...editedCardData, title: e.target.value})}
                            className={`${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full max-w-xs`}
                            placeholder="Title"
                          />
                        ) : (
                          <div className={`text-sm ${textSecondaryClass}`}>{profileContact.title}</div>
                        )}
                      </div>
                    )}
                    {(profileContact.company || isEditingCard) && (
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className={textSecondaryClass} />
                        {isEditingCard ? (
                          <input
                            type="text"
                            value={editedCardData.company || ''}
                            onChange={(e) => setEditedCardData({...editedCardData, company: e.target.value})}
                            className={`${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1`}
                            placeholder="Company"
                          />
                        ) : (
                          <span className={`text-sm ${textClass}`}>{profileContact.company}</span>
                        )}
                      </div>
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
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Mail size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Email</div>
                      {isEditingCard ? (
                        <input
                          type="email"
                          value={editedCardData.email || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, email: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                          placeholder="email@example.com"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileContact.email || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Phone size={20} className="text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Phone</div>
                      {isEditingCard ? (
                        <input
                          type="tel"
                          value={editedCardData.phone || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, phone: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                          placeholder="(555) 123-4567"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileContact.phone || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  {(profileContact.contactType === 'partner' || profileContact.contactType === 'gatekeeper') && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <Globe size={20} className="text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>{profileContact.contactType === 'partner' ? 'Website' : 'Firm Website'}</div>
                        {isEditingCard ? (
                          <input
                            type="url"
                            value={profileContact.contactType === 'partner' ? (editedCardData.website || '') : (editedCardData.firmWebsite || '')}
                            onChange={(e) => setEditedCardData({...editedCardData, [profileContact.contactType === 'partner' ? 'website' : 'firmWebsite']: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                            placeholder="https://example.com"
                          />
                        ) : (
                          <div className={`text-sm font-semibold ${textClass}`}>{(profileContact.contactType === 'partner' ? profileContact.website : profileContact.firmWebsite) || 'N/A'}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {profileContact.contactType === 'partner' && (
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <DollarSign size={20} className="text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Commitment Amount</div>
                        {isEditingCard ? (
                          <input
                            type="number"
                            value={editedCardData.commitmentAmount || ''}
                            onChange={(e) => setEditedCardData({...editedCardData, commitmentAmount: e.target.value})}
                            className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                            placeholder="0"
                          />
                        ) : (
                          <div className={`text-sm font-semibold ${textClass}`}>{profileContact.commitmentAmount ? `$${formatNumber(profileContact.commitmentAmount)}` : '$0'}</div>
                        )}
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
              <NotesSidebar
                entityType={profileContact.contactType}
                entityId={profileContact.id}
                darkMode={darkMode}
                onNotesChange={() => {
                  // Reload notes if needed
                  notesService.getAllNotes().then(data => setNotes(data || []));
                }}
              />
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
                      setIsEditingCard(false);
                      setEditedCardData({});
                    }}
                    className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                  >
                    <X size={20} />
                    Close Property
                  </button>
                  <div className="flex items-center gap-3">
                    {!isEditingCard ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditingCard(true);
                            setEditedCardData({...profileProperty});
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            // Save all changes
                            const updates = {};
                            const editableFields = ['address', 'squareFeet', 'monthlyBaseRentPerSqft', 'purchasePrice', 'closingCosts', 'ltvPercent', 'interestRate', 'loanTerm', 'exitCapRate', 'holdingPeriodMonths'];
                            editableFields.forEach(field => {
                              if (editedCardData[field] !== profileProperty[field]) {
                                updates[field] = editedCardData[field];
                              }
                            });

                            if (Object.keys(updates).length > 0) {
                              for (const [field, value] of Object.entries(updates)) {
                                await updatePropertyField(profileProperty.id, field, value);
                              }
                            }

                            setIsEditingCard(false);
                            setEditedCardData({});
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingCard(false);
                            setEditedCardData({});
                          }}
                          className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${textClass} rounded-lg font-semibold transition`}
                        >
                          Cancel
                        </button>
                      </>
                    )}
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
                        {isEditingCard ? (
                          <input
                            type="text"
                            value={editedCardData.address || ''}
                            onChange={(e) => setEditedCardData({...editedCardData, address: e.target.value})}
                            className={`text-2xl font-bold ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-3 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Property Address"
                          />
                        ) : (
                          <h2 className={`text-2xl font-bold ${textClass}`}>
                            {profileProperty.address || 'No address'}
                          </h2>
                        )}
                        <span className="px-3 py-1 text-sm font-semibold rounded bg-indigo-100 text-indigo-800">
                          PROPERTY
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`flex items-center gap-2`}>
                          <TrendingUp size={18} className={textSecondaryClass} />
                          {isEditingCard ? (
                            <input
                              type="number"
                              value={editedCardData.squareFeet || ''}
                              onChange={(e) => setEditedCardData({...editedCardData, squareFeet: e.target.value})}
                              className={`${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 w-32`}
                              placeholder="0"
                            />
                          ) : (
                            <span className={`font-semibold ${textClass}`}>
                              {profileProperty.squareFeet ? `${formatNumber(profileProperty.squareFeet)} SF` : 'N/A'}
                            </span>
                          )}
                        </div>
                        {profileProperty.crexi && (
                          <a href={profileProperty.crexi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                            View on Crexi
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
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

                {/* Lease Options - Property-Specific */}
                {!profileProperty || !profileProperty.id ? (
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                    <div className={`text-center ${textSecondaryClass} py-8`}>
                      Loading property data...
                    </div>
                  </div>
                ) : (
                  <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className={`text-xl font-bold ${textClass}`}>Lease Options</h2>
                        <p className={`text-sm ${textSecondaryClass}`}>Manage lease scenarios for this property</p>
                      </div>
                      <button
                        onClick={() => handleAddLease(profileProperty.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        <Plus size={18} />
                        Add Lease Option
                      </button>
                    </div>

                    {/* Lease Form Modal */}
                    {showLeaseModal && editingPropertyId === profileProperty.id && (
                    <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-xl p-6 border ${borderClass} mb-4`}>
                      <h3 className={`text-lg font-bold ${textClass} mb-4`}>
                        {editingLeaseId ? 'Edit Lease Option' : 'Create New Lease Option'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="col-span-3">
                          <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Lease Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Triple Net, 5-Year Base, 10-Year Premium"
                            value={leaseFormData.name}
                            onChange={(e) => setLeaseFormData({ ...leaseFormData, name: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Price per SF/Month *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1.00"
                            value={leaseFormData.pricePerSfMonth}
                            onChange={(e) => setLeaseFormData({ ...leaseFormData, pricePerSfMonth: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Term (Years) *
                          </label>
                          <input
                            type="number"
                            placeholder="5"
                            value={leaseFormData.termYears}
                            onChange={(e) => setLeaseFormData({ ...leaseFormData, termYears: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>

                      {/* CAM Charges Section */}
                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${borderClass} mb-4`}>
                        <h4 className={`text-md font-bold ${textClass} mb-3`}>CAM Charges (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                              CAM Input Method
                            </label>
                            <select
                              value={leaseFormData.camType}
                              onChange={(e) => setLeaseFormData({ ...leaseFormData, camType: e.target.value })}
                              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="per_month">Per SF/Month</option>
                              <option value="per_year">Per SF/Year</option>
                              <option value="total_annual">Total Annual Amount</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                              {leaseFormData.camType === 'per_month' && 'CAM per SF/Month ($)'}
                              {leaseFormData.camType === 'per_year' && 'CAM per SF/Year ($)'}
                              {leaseFormData.camType === 'total_annual' && 'Total Annual CAM ($)'}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={
                                leaseFormData.camType === 'per_month' ? '0.25' :
                                leaseFormData.camType === 'per_year' ? '3.00' :
                                '15000'
                              }
                              value={leaseFormData.camAmount}
                              onChange={(e) => setLeaseFormData({ ...leaseFormData, camAmount: e.target.value })}
                              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        </div>
                        {leaseFormData.camType === 'total_annual' && leaseFormData.camAmount && (
                          <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${borderClass}`}>
                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>
                              Auto-Calculated Rates (will be shown in property details)
                            </div>
                            <div className="text-sm">
                              <span className={textSecondaryClass}>Based on property square footage</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rent Increase Structure Section */}
                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${borderClass} mb-4`}>
                        <h4 className={`text-md font-bold ${textClass} mb-3`}>Rent Increase Structure</h4>
                        <div className="mb-4">
                          <label className={`block text-sm font-medium ${textClass} mb-2`}>
                            Increase Type
                          </label>
                          <select
                            value={leaseFormData.rentIncreaseType}
                            onChange={(e) => setLeaseFormData({ ...leaseFormData, rentIncreaseType: e.target.value })}
                            className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="none">No Rent Increases</option>
                            <option value="flat_annual">Flat Annual Increase</option>
                            <option value="stepped">Step Increases (by Year)</option>
                            <option value="stepped_monthly">Step Increases (by Month)</option>
                          </select>
                        </div>

                        {leaseFormData.rentIncreaseType === 'flat_annual' && (
                          <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                              Annual Rent Increase (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="3.00"
                              value={leaseFormData.flatAnnualIncreasePercent}
                              onChange={(e) => setLeaseFormData({ ...leaseFormData, flatAnnualIncreasePercent: e.target.value })}
                              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <p className={`text-xs ${textSecondaryClass} mt-1`}>
                              Example: 3% every year (Year 1: $1.00, Year 2: $1.03, Year 3: $1.06, etc)
                            </p>
                          </div>
                        )}

                        {leaseFormData.rentIncreaseType === 'stepped' && (
                          <div className="space-y-3">
                            {leaseFormData.rentSteps.map((step, index) => (
                              <div key={index} className={`flex gap-3 items-end p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${borderClass}`}>
                                <div className="flex-1">
                                  <label className={`block text-xs font-medium ${textClass} mb-1`}>
                                    Trigger Year
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="2"
                                    value={step.trigger_year || ''}
                                    onChange={(e) => {
                                      const newSteps = [...leaseFormData.rentSteps];
                                      newSteps[index] = { ...newSteps[index], trigger_year: parseInt(e.target.value) || 0 };
                                      setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className={`block text-xs font-medium ${textClass} mb-1`}>
                                    Increase (%)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="10"
                                    value={step.increase_percent || ''}
                                    onChange={(e) => {
                                      const newSteps = [...leaseFormData.rentSteps];
                                      newSteps[index] = { ...newSteps[index], increase_percent: parseFloat(e.target.value) || 0 };
                                      setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newSteps = leaseFormData.rentSteps.filter((_, i) => i !== index);
                                    setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                  }}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                  title="Delete this step"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setLeaseFormData({
                                  ...leaseFormData,
                                  rentSteps: [...leaseFormData.rentSteps, { trigger_year: 0, increase_percent: 0 }]
                                });
                              }}
                              className={`w-full px-4 py-2 rounded-lg border-2 border-dashed ${
                                darkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300' : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700'
                              } transition font-medium`}
                            >
                              + Add Year Step
                            </button>

                            <div className="mt-3">
                              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                Base Annual Escalation Between Steps (%) - Optional
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={leaseFormData.baseAnnualEscalationPercent}
                                onChange={(e) => setLeaseFormData({ ...leaseFormData, baseAnnualEscalationPercent: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                              <p className={`text-xs ${textSecondaryClass} mt-1`}>
                                Applied annually between step increases (e.g., 2% between Year 2 and Year 4)
                              </p>
                            </div>
                          </div>
                        )}

                        {leaseFormData.rentIncreaseType === 'stepped_monthly' && (
                          <div className="space-y-3">
                            {leaseFormData.rentSteps.map((step, index) => (
                              <div key={index} className={`flex gap-3 items-end p-3 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border ${borderClass}`}>
                                <div className="flex-1">
                                  <label className={`block text-xs font-medium ${textClass} mb-1`}>
                                    Starting Month
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="360"
                                    placeholder="1"
                                    value={step.month || ''}
                                    onChange={(e) => {
                                      const newSteps = [...leaseFormData.rentSteps];
                                      newSteps[index] = { ...newSteps[index], month: parseInt(e.target.value) || 1 };
                                      setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className={`block text-xs font-medium ${textClass} mb-1`}>
                                    Price per SF/Month ($)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    placeholder="1.50"
                                    value={step.price_per_sf || ''}
                                    onChange={(e) => {
                                      const newSteps = [...leaseFormData.rentSteps];
                                      newSteps[index] = { ...newSteps[index], price_per_sf: parseFloat(e.target.value) || 0 };
                                      setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newSteps = leaseFormData.rentSteps.filter((_, i) => i !== index);
                                    setLeaseFormData({ ...leaseFormData, rentSteps: newSteps });
                                  }}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                  title="Delete this step"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setLeaseFormData({
                                  ...leaseFormData,
                                  rentSteps: [...leaseFormData.rentSteps, { month: 1, price_per_sf: 0 }]
                                });
                              }}
                              className={`w-full px-4 py-2 rounded-lg border-2 border-dashed ${
                                darkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300' : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700'
                              } transition font-medium`}
                            >
                              + Add Month Step
                            </button>
                            <p className={`text-xs ${textSecondaryClass} mt-2`}>
                              Example: Month 1-6: $1.00/SF (promotional), Month 7-60: $1.50/SF (regular rate)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* TI and Tenant Allowance Section */}
                      <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-lg p-4 border ${borderClass} mb-4`}>
                        <h4 className={`text-md font-bold ${textClass} mb-3`}>Tenant Improvement & Allowance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                              Tenant Improvement (TI) Amount ($)
                            </label>
                            <input
                              type="text"
                              placeholder="50,000"
                              value={formatNumberInput(leaseFormData.tenantImprovementAmount)}
                              onChange={(e) => {
                                const value = stripCommas(e.target.value);
                                if (!isNaN(value) || value === '') {
                                  setLeaseFormData({ ...leaseFormData, tenantImprovementAmount: value });
                                }
                              }}
                              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <p className={`text-xs ${textSecondaryClass} mt-1`}>
                              One-time landlord cost upfront
                            </p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                              Tenant Allowance Amount ($)
                            </label>
                            <input
                              type="text"
                              placeholder="25,000"
                              value={formatNumberInput(leaseFormData.tenantAllowanceAmount)}
                              onChange={(e) => {
                                const value = stripCommas(e.target.value);
                                if (!isNaN(value) || value === '') {
                                  setLeaseFormData({ ...leaseFormData, tenantAllowanceAmount: value });
                                }
                              }}
                              className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveLease}
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          {editingLeaseId ? 'Update Lease' : 'Create Lease'}
                        </button>
                        <button
                          onClick={() => {
                            setShowLeaseModal(false);
                            setEditingLeaseId(null);
                            setEditingPropertyId(null);
                            setLeaseFormData({
                              name: '',
                              pricePerSfMonth: '',
                              termYears: '',
                              camAmount: '',
                              camType: 'per_month',
                              rentIncreaseType: 'none',
                              flatAnnualIncreasePercent: '',
                              rentSteps: [],
                              baseAnnualEscalationPercent: '',
                              tenantImprovementAmount: '',
                              tenantAllowanceAmount: ''
                            });
                          }}
                          className={`px-6 py-3 rounded-lg font-semibold transition ${
                            darkMode
                              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Property Leases List */}
                  {(() => {
                    const propertyLeases = leases.filter(l => l.property_id === profileProperty.id);

                    if (propertyLeases.length > 0) {
                      return (
                        <div className="space-y-4 mb-4">
                          {propertyLeases.map(lease => {
                            // Calculate CAM display values
                            let camDisplay = null;
                            if (lease.cam_amount && lease.cam_type) {
                              const sqft = parseFloat(stripCommas(profileProperty.squareFeet)) || 0;
                              if (lease.cam_type === 'per_month') {
                                camDisplay = `$${parseFloat(lease.cam_amount).toFixed(2)}/SF/Mo`;
                              } else if (lease.cam_type === 'per_year') {
                                camDisplay = `$${parseFloat(lease.cam_amount).toFixed(2)}/SF/Yr`;
                              } else if (lease.cam_type === 'total_annual') {
                                camDisplay = `$${formatNumber(parseFloat(lease.cam_amount))}/Yr`;
                                if (sqft > 0) {
                                  const perSfMonth = (parseFloat(lease.cam_amount) / sqft) / 12;
                                  camDisplay += ` ($${perSfMonth.toFixed(2)}/SF/Mo)`;
                                }
                              }
                            }

                            // Rent increase display
                            let rentIncreaseDisplay = null;
                            if (lease.rent_increase_type === 'flat_annual' && lease.flat_annual_increase_percent) {
                              rentIncreaseDisplay = `${parseFloat(lease.flat_annual_increase_percent).toFixed(1)}% annual`;
                            } else if (lease.rent_increase_type === 'stepped' && lease.rent_steps && lease.rent_steps.length > 0) {
                              rentIncreaseDisplay = `${lease.rent_steps.length} year-based steps`;
                            } else if (lease.rent_increase_type === 'stepped_monthly' && lease.rent_steps && lease.rent_steps.length > 0) {
                              rentIncreaseDisplay = `${lease.rent_steps.length} month-based steps`;
                            }

                            return (
                              <div
                                key={lease.id}
                                className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-4 border ${borderClass} hover:shadow-md transition`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h3 className={`text-lg font-bold ${textClass} mb-3`}>{lease.lease_name || lease.name}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Base Rent</div>
                                        <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                          ${parseFloat(lease.price_per_sf_month).toFixed(2)}/SF
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Term</div>
                                        <div className={`text-lg font-bold ${textClass}`}>
                                          {lease.term_years} {lease.term_years === 1 ? 'Year' : 'Years'}
                                        </div>
                                      </div>
                                      {camDisplay && (
                                        <div>
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>CAM</div>
                                          <div className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                            {camDisplay}
                                          </div>
                                        </div>
                                      )}
                                      {rentIncreaseDisplay && (
                                        <div>
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Increases</div>
                                          <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                            {rentIncreaseDisplay}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {(lease.tenant_improvement_amount || lease.tenant_allowance_amount) && (
                                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                                        {lease.tenant_improvement_amount && (
                                          <div>
                                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>TI Amount</div>
                                            <div className={`text-sm font-bold ${textClass}`}>
                                              {formatCurrency(parseFloat(lease.tenant_improvement_amount))}
                                            </div>
                                          </div>
                                        )}
                                        {lease.tenant_allowance_amount && (
                                          <div>
                                            <div className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Allowance</div>
                                            <div className={`text-sm font-bold ${textClass}`}>
                                              {formatCurrency(parseFloat(lease.tenant_allowance_amount))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleEditLease(lease, profileProperty.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition"
                                      aria-label="Edit lease"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLease(lease.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
                                      aria-label="Delete lease"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    return (
                      <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg p-8 text-center border-2 border-dashed ${borderClass} mb-4`}>
                        <Database size={40} className={`mx-auto mb-2 ${textSecondaryClass} opacity-50`} />
                        <p className={`text-sm ${textSecondaryClass}`}>
                          No lease options yet. Click "Add Lease Option" to create your first scenario.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Select Lease for Underwriting */}
                  <div className={`pt-4 border-t ${borderClass}`}>
                    <label className={`block text-sm font-semibold ${textClass} mb-2`}>
                      Select Lease for Underwriting
                    </label>
                    <select
                      value={profileProperty.selected_lease_id || ''}
                      onChange={(e) => handlePropertyLeaseChange(profileProperty.id, e.target.value || null)}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">No lease selected (use property base rent)</option>
                      {leases.filter(l => l.property_id === profileProperty.id).map(lease => (
                        <option key={lease.id} value={lease.id}>
                          {lease.lease_name || lease.name} - ${parseFloat(lease.price_per_sf_month).toFixed(2)} /SF /Month - {lease.term_years} Year Term
                        </option>
                      ))}
                    </select>

                    {profileProperty.selected_lease_id && (() => {
                      const selectedLease = leases.find(l => l.id === profileProperty.selected_lease_id);
                      if (selectedLease) {
                        const sqft = parseFloat(stripCommas(profileProperty.squareFeet)) || 0;

                        // Calculate CAM display
                        let camDisplay = null;
                        let camPerSfMonth = 0;
                        if (selectedLease.cam_amount && selectedLease.cam_type) {
                          const camAmount = parseFloat(selectedLease.cam_amount);
                          if (selectedLease.cam_type === 'per_month') {
                            camDisplay = `$${camAmount.toFixed(2)}/SF/Mo`;
                            camPerSfMonth = camAmount;
                          } else if (selectedLease.cam_type === 'per_year') {
                            camDisplay = `$${camAmount.toFixed(2)}/SF/Yr`;
                            camPerSfMonth = camAmount / 12;
                          } else if (selectedLease.cam_type === 'total_annual') {
                            camDisplay = `$${formatNumber(camAmount)}/Yr`;
                            if (sqft > 0) {
                              camPerSfMonth = (camAmount / sqft) / 12;
                              camDisplay += ` ($${camPerSfMonth.toFixed(2)}/SF/Mo)`;
                            }
                          }
                        }

                        // Rent increase display
                        let rentIncreaseDisplay = null;
                        if (selectedLease.rent_increase_type === 'flat_annual' && selectedLease.flat_annual_increase_percent) {
                          rentIncreaseDisplay = `${parseFloat(selectedLease.flat_annual_increase_percent).toFixed(1)}% annually`;
                        } else if (selectedLease.rent_increase_type === 'stepped' && selectedLease.rent_steps && selectedLease.rent_steps.length > 0) {
                          const sortedSteps = [...selectedLease.rent_steps].sort((a, b) => a.trigger_year - b.trigger_year);
                          rentIncreaseDisplay = sortedSteps.map(s => `Yr ${s.trigger_year}: +${s.increase_percent}%`).join(', ');
                        } else if (selectedLease.rent_increase_type === 'stepped_monthly' && selectedLease.rent_steps && selectedLease.rent_steps.length > 0) {
                          const sortedSteps = [...selectedLease.rent_steps].sort((a, b) => a.month - b.month);
                          rentIncreaseDisplay = sortedSteps.map(s => `Mo ${s.month}: $${s.price_per_sf}/SF`).join(', ');
                        }

                        // Calculate total rent including CAM
                        const baseRent = parseFloat(selectedLease.price_per_sf_month);
                        const totalRentPerSf = baseRent + camPerSfMonth;

                        return (
                          <div className={`mt-3 p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-20 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2`}>
                            <div className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-3`}>
                              ✓ Using: {selectedLease.lease_name || selectedLease.name}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <div className={`text-xs ${textSecondaryClass} uppercase`}>Base Rent</div>
                                <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  ${baseRent.toFixed(2)}/SF/Mo
                                </div>
                              </div>
                              {camDisplay && (
                                <div>
                                  <div className={`text-xs ${textSecondaryClass} uppercase`}>CAM Charges</div>
                                  <div className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    {camDisplay}
                                  </div>
                                </div>
                              )}
                              <div>
                                <div className={`text-xs ${textSecondaryClass} uppercase`}>Total Rent{camDisplay ? ' (w/ CAM)' : ''}</div>
                                <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                  ${totalRentPerSf.toFixed(2)}/SF/Mo
                                </div>
                              </div>
                              <div>
                                <div className={`text-xs ${textSecondaryClass} uppercase`}>Term</div>
                                <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {selectedLease.term_years} Years
                                </div>
                              </div>
                              {rentIncreaseDisplay && (
                                <div className="col-span-2">
                                  <div className={`text-xs ${textSecondaryClass} uppercase`}>Rent Increases</div>
                                  <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    {rentIncreaseDisplay}
                                  </div>
                                </div>
                              )}
                            </div>
                            {(selectedLease.tenant_improvement_amount || selectedLease.tenant_allowance_amount) && (
                              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                                {selectedLease.tenant_improvement_amount && (
                                  <div>
                                    <div className={`text-xs ${textSecondaryClass} uppercase`}>TI Amount</div>
                                    <div className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      ${formatNumber(parseFloat(selectedLease.tenant_improvement_amount))}
                                    </div>
                                  </div>
                                )}
                                {selectedLease.tenant_allowance_amount && (
                                  <div>
                                    <div className={`text-xs ${textSecondaryClass} uppercase`}>Tenant Allowance</div>
                                    <div className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      ${formatNumber(parseFloat(selectedLease.tenant_allowance_amount))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
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
                      {isEditingCard ? (
                        <input
                          type="number"
                          value={editedCardData.squareFeet || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, squareFeet: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.squareFeet ? formatNumber(profileProperty.squareFeet) : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Base Rent/SF</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedCardData.monthlyBaseRentPerSqft || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, monthlyBaseRentPerSqft: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0.00"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.monthlyBaseRentPerSqft ? `$${profileProperty.monthlyBaseRentPerSqft}` : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Purchase Price</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          value={editedCardData.purchasePrice || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, purchasePrice: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.purchasePrice ? formatCurrency(stripCommas(profileProperty.purchasePrice)) : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Improvements</div>
                      <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.improvements ? formatCurrency(stripCommas(profileProperty.improvements)) : 'N/A'}</div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Closing Costs</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          value={editedCardData.closingCosts || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, closingCosts: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.closingCosts ? formatCurrency(stripCommas(profileProperty.closingCosts)) : '$0'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>LTV %</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedCardData.ltvPercent || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, ltvPercent: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.ltvPercent ? `${profileProperty.ltvPercent}%` : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Interest Rate</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedCardData.interestRate || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, interestRate: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.interestRate ? `${profileProperty.interestRate}%` : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Loan Term</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          value={editedCardData.loanTerm || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, loanTerm: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="30"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.loanTerm ? `${profileProperty.loanTerm} yrs` : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Exit Cap Rate</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedCardData.exitCapRate || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, exitCapRate: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.exitCapRate ? `${profileProperty.exitCapRate}%` : 'N/A'}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Holding Period</div>
                      {isEditingCard ? (
                        <input
                          type="number"
                          value={editedCardData.holdingPeriodMonths || ''}
                          onChange={(e) => setEditedCardData({...editedCardData, holdingPeriodMonths: e.target.value})}
                          className={`w-full ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0"
                        />
                      ) : (
                        <div className={`text-sm font-semibold ${textClass}`}>{profileProperty.holdingPeriodMonths ? `${profileProperty.holdingPeriodMonths} months (${(profileProperty.holdingPeriodMonths / 12).toFixed(1)} yrs)` : 'N/A'}</div>
                      )}
                    </div>
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

                {/* Two-Column Layout: LEFT (Lease Terms, Partner Returns) + RIGHT (Notes Sidebar) */}
                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
                  {/* LEFT COLUMN (70%) */}
                  <div className="space-y-6">
                    {/* Lease Terms Section */}
                    <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                      <h2 className={`text-xl font-bold ${textClass} mb-4`}>Lease Terms</h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Initial Lease Term</div>
                          <div className={`text-lg font-semibold ${textClass}`}>
                            {profileProperty.initialLeaseTermYears ? `${profileProperty.initialLeaseTermYears} years` : 'N/A'}
                          </div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Renewal Options</div>
                          <div className={`text-lg font-semibold ${textClass}`}>
                            {profileProperty.renewalOptionCount || 'N/A'}
                          </div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Renewal Term</div>
                          <div className={`text-lg font-semibold ${textClass}`}>
                            {profileProperty.renewalTermYears ? `${profileProperty.renewalTermYears} years` : 'N/A'}
                          </div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Annual Escalator</div>
                          <div className={`text-lg font-semibold ${textClass}`}>
                            {profileProperty.annualRentEscalator ? `${profileProperty.annualRentEscalator}%` : 'N/A'}
                          </div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Option Escalator</div>
                          <div className={`text-lg font-semibold ${textClass}`}>
                            {profileProperty.optionRentEscalator ? `${profileProperty.optionRentEscalator}%` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Partner Returns Section */}
                    {(() => {
                      const propertyDeals = partnersInDeal.filter(d => d.property_id === profileProperty.id);
                      return (
                        <div className={`${cardBgClass} rounded-xl shadow-lg p-6 border ${borderClass}`}>
                          <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-bold ${textClass}`}>Partner Returns</h2>
                            <button
                              onClick={() => handleOpenPartnerDealModal(profileProperty.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                            >
                              <Plus size={18} />
                              Add Partner
                            </button>
                          </div>

                          {propertyDeals.length > 0 ? (
                            <div className="space-y-6">
                              {propertyDeals.map(deal => {
                                // Get partner name from either linked partner or custom name
                                const partner = deal.partner_id ? partners.find(p => p.id === deal.partner_id) : null;
                                const partnerName = partner ? partner.name : deal.partner_name;
                                const isLinkedPartner = !!partner;

                                // Use editing amount if being edited, otherwise use stored amount
                                const currentAmount = editingInvestment[deal.id] !== undefined
                                  ? editingInvestment[deal.id]
                                  : deal.investment_amount;
                                const isEditing = editingInvestment[deal.id] !== undefined;

                                const partnerReturns = calculatePartnerReturns(profileProperty, isEditing ? parseFloat(currentAmount) || deal.investment_amount : deal.investment_amount);

                                return (
                                  <div key={deal.id} className={`rounded-xl border ${borderClass} overflow-hidden ${darkMode ? 'bg-slate-800/60' : 'bg-white'} transition-all duration-200 shadow-sm hover:shadow-md`}>
                                    {/* Partner Header */}
                                    <div className={`px-6 py-5 border-b ${borderClass} ${darkMode ? 'bg-slate-800' : 'bg-slate-50/50'}`}>
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-3">
                                            <h3 className={`text-xl font-bold ${textClass}`}>{partnerName}</h3>
                                            {!isLinkedPartner && (
                                              <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'} font-medium`}>
                                                Custom
                                              </span>
                                            )}
                                          </div>

                                          {/* Investment Amount Display/Edit */}
                                          {!isEditing ? (
                                            <div className="flex items-center gap-3">
                                              <span className={`text-2xl font-bold ${textClass}`}>
                                                {formatCurrency(deal.investment_amount)}
                                              </span>
                                              <span className={`text-sm ${textSecondaryClass}`}>investment</span>
                                              <button
                                                onClick={() => handleStartEditInvestment(deal.id, deal.investment_amount)}
                                                className={`ml-2 p-2 rounded-lg transition-all duration-200 ${darkMode ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'}`}
                                                title="Edit investment amount"
                                              >
                                                <Edit2 size={16} />
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              <div className="flex items-center gap-2">
                                                <span className={`text-3xl font-light ${textSecondaryClass}`}>$</span>
                                                <input
                                                  type="text"
                                                  value={formatNumberInput(currentAmount)}
                                                  onChange={(e) => {
                                                    // Allow only numbers and strip commas for storage
                                                    const value = stripCommas(e.target.value);
                                                    if (!isNaN(value) || value === '') {
                                                      setEditingInvestment({ ...editingInvestment, [deal.id]: value });
                                                    }
                                                  }}
                                                  className={`text-3xl font-bold px-4 py-3 rounded-lg border-2 ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-64`}
                                                  placeholder="100,000"
                                                  autoFocus
                                                />
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => handleSaveInvestment(deal.id)}
                                                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 font-medium shadow-sm hover:shadow"
                                                >
                                                  Save Changes
                                                </button>
                                                <button
                                                  onClick={() => handleCancelEditInvestment(deal.id)}
                                                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {isLinkedPartner && partner?.assetClasses && !isEditing && (
                                            <div className={`text-xs ${textSecondaryClass} mt-2`}>
                                              Preferred: {Array.isArray(partner.assetClasses) ? partner.assetClasses.join(', ') : partner.assetClasses}
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={() => handleRemovePartnerDeal(deal.id)}
                                          className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                                          title="Remove partner"
                                        >
                                          <X size={20} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Metrics Grid - Always Visible */}
                                    <div className={`px-6 py-6 ${darkMode ? 'bg-slate-800/40' : 'bg-white'}`}>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Row 1 */}
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Ownership</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{partnerReturns.ownership_percent.toFixed(2)}%</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Annual Cash Flow</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{formatCurrency(partnerReturns.annual_cash_flow)}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Cash-on-Cash</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{partnerReturns.cash_on_cash.toFixed(2)}%</div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Exit Proceeds</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{formatCurrency(partnerReturns.exit_proceeds)}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Total Return</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{formatCurrency(partnerReturns.total_return)}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>IRR</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{partnerReturns.irr > 0 ? `${partnerReturns.irr.toFixed(2)}%` : 'N/A'}</div>
                                        </div>

                                        {/* Row 3 */}
                                        <div className="space-y-1">
                                          <div className={`text-xs font-semibold ${textSecondaryClass} uppercase tracking-wider`}>Equity Multiple</div>
                                          <div className={`text-3xl font-bold ${textClass}`}>{partnerReturns.equity_multiple > 0 ? `${partnerReturns.equity_multiple.toFixed(2)}x` : 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className={`${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'} rounded-xl p-12 text-center border-2 border-dashed ${borderClass}`}>
                              <DollarSign size={56} className={`mx-auto mb-4 ${textSecondaryClass} opacity-40`} />
                              <p className={`text-base ${textSecondaryClass} font-medium mb-1`}>
                                No partners added yet
                              </p>
                              <p className={`text-sm ${textSecondaryClass}`}>
                                Click "Add Partner" to calculate partner-specific returns
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* RIGHT COLUMN (30%) - Notes Sidebar (Sticky) */}
                  <div className="lg:sticky lg:top-6 lg:self-start">
                    <NotesSidebar
                      entityType="property"
                      entityId={profileProperty.id}
                      darkMode={darkMode}
                      onNotesChange={() => {
                        // Reload notes if needed
                        notesService.getAllNotes().then(data => setNotes(data || []));
                      }}
                    />
                  </div>
                </div>

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

      {/* Partner Deal Modal */}
      {showPartnerDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>Add Partner to Deal</h2>
              <button
                onClick={() => setShowPartnerDealModal(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition`}
              >
                <X size={24} className={textClass} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Partner Selection Mode Toggle */}
              <div>
                <label className={`block text-sm font-semibold ${textClass} mb-2`}>
                  Partner Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPartnerDealFormData({ ...partnerDealFormData, partnerSelectionMode: 'existing', partnerId: '', partnerName: '' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      partnerDealFormData.partnerSelectionMode === 'existing'
                        ? 'bg-purple-600 text-white'
                        : darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Existing Partner
                  </button>
                  <button
                    onClick={() => setPartnerDealFormData({ ...partnerDealFormData, partnerSelectionMode: 'custom', partnerId: '', partnerName: '' })}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      partnerDealFormData.partnerSelectionMode === 'custom'
                        ? 'bg-purple-600 text-white'
                        : darkMode
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Custom Partner
                  </button>
                </div>
              </div>

              {/* Partner Selection - Existing */}
              {partnerDealFormData.partnerSelectionMode === 'existing' && (
                <div>
                  <label className={`block text-sm font-semibold ${textClass} mb-2`}>
                    Select Partner
                  </label>
                  <select
                    value={partnerDealFormData.partnerId}
                    onChange={(e) => setPartnerDealFormData({ ...partnerDealFormData, partnerId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="">-- Select Partner --</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Partner Selection - Custom */}
              {partnerDealFormData.partnerSelectionMode === 'custom' && (
                <div>
                  <label className={`block text-sm font-semibold ${textClass} mb-2`}>
                    Partner Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter partner name"
                    value={partnerDealFormData.partnerName}
                    onChange={(e) => setPartnerDealFormData({ ...partnerDealFormData, partnerName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  <p className={`text-xs ${textSecondaryClass} mt-1`}>
                    For one-time use. Not linked to contact list.
                  </p>
                </div>
              )}

              {/* Investment Amount */}
              <div>
                <label className={`block text-sm font-semibold ${textClass} mb-2`}>
                  Investment Amount
                </label>
                <input
                  type="text"
                  placeholder="e.g., 100,000"
                  value={formatNumberInput(partnerDealFormData.investmentAmount)}
                  onChange={(e) => {
                    const value = stripCommas(e.target.value);
                    if (!isNaN(value) || value === '') {
                      setPartnerDealFormData({ ...partnerDealFormData, investmentAmount: value });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPartnerDealModal(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePartnerDeal}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
