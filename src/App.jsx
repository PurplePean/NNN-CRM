import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Search, Moon, Sun, X } from 'lucide-react';

export default function IndustrialCRM() {
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [activeTab, setActiveTab] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [showInlineBrokerForm, setShowInlineBrokerForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [inlineBrokerData, setInlineBrokerData] = useState({});
  const [darkMode, setDarkMode] = useState(false);

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
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedProperties) setProperties(JSON.parse(savedProperties));
    if (savedBrokers) setBrokers(JSON.parse(savedBrokers));
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

  const handleDeletePhoto = (photoId) => {
    setFormData({
      ...formData,
      photos: (formData.photos || []).filter(photo => photo.id !== photoId)
    });
  };

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
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
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
                  <textarea
                    placeholder="Deal Notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`col-span-2 px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 h-24`}
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
                          {property.photos.map(photo => (
                            <div key={photo.id} className={`relative group rounded-lg overflow-hidden border-2 ${borderClass} ${hoverBgClass} cursor-pointer transition`}>
                              <img
                                src={photo.data}
                                alt={photo.name}
                                className="w-full h-32 object-cover"
                                onClick={() => window.open(photo.data, '_blank')}
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

                    {property.notes && (
                      <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                        <div className={`text-xs font-bold ${textSecondaryClass} uppercase mb-2`}>Deal Notes</div>
                        <p className={`${textClass} text-sm whitespace-pre-wrap`}>{property.notes}</p>
                      </div>
                    )}
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
                  <textarea
                    placeholder="Conversations & Notes"
                    value={formData.conversations || ''}
                    onChange={(e) => setFormData({ ...formData, conversations: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500 h-32`}
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

                  {broker.conversations && (
                    <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                      <div className={`text-xs font-bold ${textSecondaryClass} uppercase mb-2`}>Conversations & Notes</div>
                      <p className={`text-sm ${textClass} whitespace-pre-wrap`}>{broker.conversations}</p>
                    </div>
                  )}
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
      </div>
    </div>
  );
}
