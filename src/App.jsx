import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Edit2, Search, Moon, Sun, X } from 'lucide-react';

export default function IndustrialCRM() {
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [activeTab, setActiveTab] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showInlineBrokerForm, setShowInlineBrokerForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [inlineBrokerData, setInlineBrokerData] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Photo lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Note-taking state
  const [noteContent, setNoteContent] = useState({});
  const [noteCategory, setNoteCategory] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // Sensitivity Analysis state
  const [sensitivityPropertyId, setSensitivityPropertyId] = useState(null);
  const [sensitivityRowVar, setSensitivityRowVar] = useState('monthlyBaseRentPerSqft');
  const [sensitivityColVar, setSensitivityColVar] = useState('exitCapRate');
  const [sensitivityOutputMetric, setSensitivityOutputMetric] = useState('equityMultiple');
  const [sensitivityRowMin, setSensitivityRowMin] = useState('');
  const [sensitivityRowMax, setSensitivityRowMax] = useState('');
  const [sensitivityColMin, setSensitivityColMin] = useState('');
  const [sensitivityColMax, setSensitivityColMax] = useState('');
  const [sensitivityTable, setSensitivityTable] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const savedProperties = localStorage.getItem('properties');
    const savedBrokers = localStorage.getItem('brokers');
    const savedPartners = localStorage.getItem('partners');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedProperties) setProperties(JSON.parse(savedProperties));
    if (savedBrokers) setBrokers(JSON.parse(savedBrokers));
    if (savedPartners) setPartners(JSON.parse(savedPartners));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Number formatting utilities
  const formatCurrency = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercent = (num, decimals = 2) => {
    if (!num && num !== 0) return 'N/A';
    return `${parseFloat(num).toFixed(decimals)}%`;
  };

  // Format number input with commas as user types
  const formatNumberInput = (value) => {
    if (!value) return '';
    const stripped = value.toString().replace(/,/g, '');
    if (isNaN(stripped) || stripped === '') return value;
    const numValue = parseFloat(stripped);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numValue);
  };

  // Strip commas for storage
  const stripCommas = (value) => {
    return value ? value.replace(/,/g, '') : '';
  };

  // Calculate amortization payment
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

  // Property form handlers
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

  const handleSaveProperty = () => {
    if (!formData.address) {
      alert('Please enter an address');
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

    if (editingId) {
      setProperties(properties.map(p => p.id === editingId ? { ...propertyData, id: editingId } : p));
    } else {
      setProperties([...properties, { ...propertyData, id: Date.now() }]);
    }

    setShowPropertyForm(false);
    setShowInlineBrokerForm(false);
    setFormData({});
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  // Note handlers
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
    if (!window.confirm('Delete this note?')) return;

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

  // Photo handlers
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed a reasonable limit (e.g., 10 photos per property)
    const currentPhotos = formData.photos || [];
    if (currentPhotos.length + files.length > 10) {
      alert('Maximum 10 photos per property');
      return;
    }

    files.forEach(file => {
      // Check file size (limit to 2MB per image to avoid localStorage issues)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 2MB.`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
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
      alert('Maximum 10 photos per property');
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
          alert('Image from URL is too large. Try a smaller image.');
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
        alert('Could not load image from URL. Make sure the image URL is publicly accessible.');
      }
    };

    img.onerror = () => {
      alert('Could not load image from URL. Make sure it\'s a valid image URL and publicly accessible.');
    };

    img.src = url;
  };

  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const currentPhotos = formData.photos || [];
    if (currentPhotos.length >= 10) {
      alert('Maximum 10 photos per property');
      e.preventDefault();
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();

        if (blob.size > 2 * 1024 * 1024) {
          alert('Pasted image is too large. Maximum size is 2MB.');
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

  // Broker form handlers
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

  const handleSaveBroker = () => {
    if (!formData.name) {
      alert('Please enter broker name');
      return;
    }

    if (editingId) {
      setBrokers(brokers.map(b => b.id === editingId ? { ...formData, id: editingId } : b));
    } else {
      setBrokers([...brokers, { ...formData, id: Date.now() }]);
    }

    setShowBrokerForm(false);
    setFormData({});
  };

  const handleDeleteBroker = (id) => {
    if (window.confirm('Are you sure you want to delete this broker?')) {
      setBrokers(brokers.filter(b => b.id !== id));
    }
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
      alert('Please enter broker name');
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

  // Partner form handlers
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

  const handleSavePartner = () => {
    if (!formData.name) {
      alert('Please enter partner name');
      return;
    }

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
      setPartners(partners.map(p => {
        if (p.id === editingId) {
          // When editing, append new note to existing notes if provided
          const updatedNoteHistory = initialNoteHistory.length > 0
            ? [...(p.noteHistory || []), ...initialNoteHistory]
            : p.noteHistory;
          return { ...partnerData, id: editingId, noteHistory: updatedNoteHistory };
        }
        return p;
      }));
    } else {
      // When creating new partner, add initial note
      setPartners([...partners, {
        ...partnerData,
        id: Date.now(),
        noteHistory: initialNoteHistory
      }]);
    }

    setShowPartnerForm(false);
    setFormData({});
  };

  const handleDeletePartner = (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      setPartners(partners.filter(p => p.id !== id));
    }
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
      equityMultiple
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
          noi: metrics.noi
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

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <div className={`${cardBgClass} border-b ${borderClass} sticky top-0 z-10 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>Industrial Asset CRM</h1>
            <p className={`${textSecondaryClass} text-sm mt-1`}>NNN Property Management & Underwriting</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${hoverBgClass} transition`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-slate-600" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className={`flex gap-4 mb-8 border-b ${borderClass}`}>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'assets'
                ? 'border-blue-600 text-blue-600'
                : `border-transparent ${textSecondaryClass} hover:${textClass}`
            }`}
          >
            Assets ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('brokers')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'brokers'
                ? 'border-blue-600 text-blue-600'
                : `border-transparent ${textSecondaryClass} hover:${textClass}`
            }`}
          >
            Brokers ({brokers.length})
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'partners'
                ? 'border-blue-600 text-blue-600'
                : `border-transparent ${textSecondaryClass} hover:${textClass}`
            }`}
          >
            Partners ({partners.length})
          </button>
        </div>

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
                        <h3 className={`text-2xl font-bold ${textClass}`}>{property.address}</h3>
                        {property.crexi && (
                          <a href={property.crexi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 block">
                            View on Crexi →
                          </a>
                        )}
                        {propertyBrokers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {propertyBrokers.map(broker => (
                              <span
                                key={broker.id}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {broker.name}{broker.firmName ? ` - ${broker.firmName}` : ''}
                              </span>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Square Feet</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{formatNumber(property.squareFeet)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Monthly Base Rent/SF</div>
                        <div className={`text-sm font-semibold ${textClass}`}>${property.monthlyBaseRentPerSqft || 'N/A'}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Interest Rate</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{property.interestRate ? `${property.interestRate}%` : 'N/A'}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${textSecondaryClass} uppercase mb-1`}>Loan Term</div>
                        <div className={`text-sm font-semibold ${textClass}`}>{property.loanTerm ? `${property.loanTerm} yrs` : 'N/A'}</div>
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
                            <option value="general">📝 General</option>
                            <option value="call">📞 Call</option>
                            <option value="meeting">🤝 Meeting</option>
                            <option value="email">📧 Email</option>
                            <option value="site-visit">🏢 Site Visit</option>
                            <option value="due-diligence">🔍 Due Diligence</option>
                            <option value="follow-up">⏰ Follow-up</option>
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
                          <p className={`text-sm ${textSecondaryClass} italic text-center py-4`}>
                            No notes yet. Add your first note above.
                          </p>
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
                              general: '📝 General',
                              call: '📞 Call',
                              meeting: '🤝 Meeting',
                              email: '📧 Email',
                              'site-visit': '🏢 Site Visit',
                              'due-diligence': '🔍 Due Diligence',
                              'follow-up': '⏰ Follow-up'
                            };

                            return (
                              <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-3 rounded-lg border ${borderClass}`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${categoryColors[note.category] || categoryColors.general}`}>
                                      {categoryLabels[note.category] || categoryLabels.general}
                                    </span>
                                    <span className={`text-xs ${textSecondaryClass}`}>
                                      {formatRelativeTime(note.timestamp)}
                                      {note.edited && ' (edited)'}
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
                                    className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    rows="3"
                                  />
                                ) : (
                                  <p className={`text-sm ${textClass} whitespace-pre-wrap`}>{note.content}</p>
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
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No properties yet. Click "New Property" to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Brokers Tab */}
        {activeTab === 'brokers' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1"></div>
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
              {brokers.map(broker => (
                <div key={broker.id} className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass} hover:shadow-xl transition`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-2xl font-bold ${textClass}`}>{broker.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBroker(broker)}
                        className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteBroker(broker.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {broker.firmName && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Firm:</span>
                        <span className={`${textClass} ml-2`}>{broker.firmName}</span>
                      </div>
                    )}
                    {broker.email && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Email:</span>
                        <a href={`mailto:${broker.email}`} className="text-blue-600 hover:underline ml-2">
                          {broker.email}
                        </a>
                      </div>
                    )}
                    {broker.phone && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Phone:</span>
                        <a href={`tel:${broker.phone}`} className="text-blue-600 hover:underline ml-2">
                          {broker.phone}
                        </a>
                      </div>
                    )}
                    {broker.firmWebsite && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Website:</span>
                        <a href={broker.firmWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                          {broker.firmWebsite}
                        </a>
                      </div>
                    )}
                    {broker.crexiLink && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Crexi:</span>
                        <a href={broker.crexiLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                          View Profile →
                        </a>
                      </div>
                    )}
                    {broker.licenseNumber && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>License #:</span>
                        <span className={`${textClass} ml-2`}>{broker.licenseNumber}</span>
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
                          <option value="general">📝 General</option>
                          <option value="call">📞 Call</option>
                          <option value="meeting">🤝 Meeting</option>
                          <option value="email">📧 Email</option>
                          <option value="site-visit">🏢 Site Visit</option>
                          <option value="due-diligence">🔍 Due Diligence</option>
                          <option value="follow-up">⏰ Follow-up</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <textarea
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
                    <div className="space-y-3">
                      {(broker.noteHistory || []).length === 0 && (
                        <p className={`text-sm ${textSecondaryClass} italic text-center py-4`}>
                          No notes yet. Add your first note above.
                        </p>
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
                            general: '📝 General',
                            call: '📞 Call',
                            meeting: '🤝 Meeting',
                            email: '📧 Email',
                            'site-visit': '🏢 Site Visit',
                            'due-diligence': '🔍 Due Diligence',
                            'follow-up': '⏰ Follow-up'
                          };

                          return (
                            <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-3 rounded-lg border ${borderClass}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${categoryColors[note.category] || categoryColors.general}`}>
                                    {categoryLabels[note.category] || categoryLabels.general}
                                  </span>
                                  <span className={`text-xs ${textSecondaryClass}`}>
                                    {formatRelativeTime(note.timestamp)}
                                    {note.edited && ' (edited)'}
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
                              {editingNoteId === note.id ? (
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  rows="3"
                                />
                              ) : (
                                <p className={`text-sm ${textClass} whitespace-pre-wrap`}>{note.content}</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
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
                      <option value="general">📝 General</option>
                      <option value="call">📞 Call</option>
                      <option value="meeting">🤝 Meeting</option>
                      <option value="email">📧 Email</option>
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
              ).map(partner => (
                <div key={partner.id} className={`${cardBgClass} rounded-xl shadow-lg p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${textClass}`}>{partner.name}</h3>
                      {partner.entityName && (
                        <p className={`${textSecondaryClass} text-sm`}>{partner.entityName}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPartner(partner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-4 border-b ${borderClass}`}>
                    {partner.email && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Email:</span>
                        <span className={`${textClass} ml-2`}>{partner.email}</span>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="text-sm">
                        <span className={`font-medium ${textSecondaryClass}`}>Phone:</span>
                        <span className={`${textClass} ml-2`}>{partner.phone}</span>
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
                          <option value="general">📝 General</option>
                          <option value="call">📞 Call</option>
                          <option value="meeting">🤝 Meeting</option>
                          <option value="email">📧 Email</option>
                          <option value="site-visit">🏢 Site Visit</option>
                          <option value="due-diligence">🔍 Due Diligence</option>
                          <option value="follow-up">⏰ Follow-up</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <textarea
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
                    <div className="space-y-3">
                      {(partner.noteHistory || []).length === 0 && (
                        <p className={`text-sm ${textSecondaryClass} italic text-center py-4`}>
                          No notes yet. Add your first note above.
                        </p>
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
                            general: '📝 General',
                            call: '📞 Call',
                            meeting: '🤝 Meeting',
                            email: '📧 Email',
                            'site-visit': '🏢 Site Visit',
                            'due-diligence': '🔍 Due Diligence',
                            'follow-up': '⏰ Follow-up'
                          };

                          return (
                            <div key={note.id} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-3 rounded-lg border ${borderClass}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${categoryColors[note.category] || categoryColors.general}`}>
                                    {categoryLabels[note.category] || categoryLabels.general}
                                  </span>
                                  <span className={`text-xs ${textSecondaryClass}`}>
                                    {formatRelativeTime(note.timestamp)}
                                    {note.edited && ' (edited)'}
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
                                  className={`w-full px-2 py-1 rounded border ${inputBorderClass} ${inputBgClass} ${textClass} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  rows="3"
                                />
                              ) : (
                                <p className={`text-sm ${textClass} whitespace-pre-wrap`}>{note.content}</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {partners.length === 0 && !showPartnerForm && (
              <div className={`${cardBgClass} rounded-xl shadow-lg p-12 text-center`}>
                <p className={`${textSecondaryClass} text-lg`}>No partners yet. Click "Add Partner" to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}
