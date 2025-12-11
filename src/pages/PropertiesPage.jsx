import React, { useState } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, Building2, MapPin, DollarSign,
    BarChart2, FileText, Home, Image as ImageIcon, CheckCircle, ExternalLink,
    Phone, Mail, Target, Globe, Calendar, Bell
} from 'lucide-react';
import {
    formatCurrency,
    formatPercent,
    formatNumber,
    formatNumberInput,
    stripCommas
} from '../utils/formatters';
import {
    calculateMetrics,
    generateSensitivityTable
} from '../utils/propertyCalculations';
// Assumes components are available - verify paths in Next Step if needed
import CustomSelect from '../components/CustomSelect';
import InlineEditField from '../components/InlineEditField';

const PropertiesPage = ({
    properties = [],
    brokers = [],
    leases = [],
    onSaveProperty,
    onDeleteProperty,
    onCreateBroker,
    openLightbox,
    openPropertyProfile,
    openContactProfile,
    showToast,
    darkMode
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [showInlineBrokerForm, setShowInlineBrokerForm] = useState(false);
    const [inlineBrokerData, setInlineBrokerData] = useState({});

    // Sensitivity Analysis State
    const [sensitivityPropertyId, setSensitivityPropertyId] = useState(null);
    const [sensitivityTable, setSensitivityTable] = useState(null);
    const [sensitivityRowVar, setSensitivityRowVar] = useState('monthlyBaseRentPerSqft');
    const [sensitivityColVar, setSensitivityColVar] = useState('exitCapRate');
    const [sensitivityRowMin, setSensitivityRowMin] = useState('');
    const [sensitivityRowMax, setSensitivityRowMax] = useState('');
    const [sensitivityColMin, setSensitivityColMin] = useState('');
    const [sensitivityColMax, setSensitivityColMax] = useState('');
    const [sensitivityOutputMetric, setSensitivityOutputMetric] = useState('irr');

    // Computed Values
    const filteredProperties = properties.filter(p =>
        p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.crexi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // UI Constants
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

    // Handlers
    const handleAddProperty = () => {
        setEditingId(null);
        setFormData({});
        setShowPropertyForm(true);
    };

    const handleEditProperty = (property) => {
        setEditingId(property.id);
        setFormData({ ...property });
        setShowPropertyForm(true);
    };

    const handleSave = async () => {
        if (!formData.address) {
            showToast('Please enter an address', 'error');
            return;
        }

        const propertyData = {
            ...formData,
            squareFeet: stripCommas(formData.squareFeet),
            purchasePrice: stripCommas(formData.purchasePrice),
            improvements: stripCommas(formData.improvements),
            closingCosts: stripCommas(formData.closingCosts)
        };

        try {
            await onSaveProperty(propertyData, editingId);
            setShowPropertyForm(false);
            setShowInlineBrokerForm(false);
            setFormData({});
        } catch (error) {
            console.error(error); // Error handled in parent usually, or we catch here
        }
    };

    const handleToggleBroker = (brokerId) => {
        const currentBrokers = formData.brokerIds || [];
        if (currentBrokers.includes(brokerId)) {
            setFormData({ ...formData, brokerIds: currentBrokers.filter(id => id !== brokerId) });
        } else {
            setFormData({ ...formData, brokerIds: [...currentBrokers, brokerId] });
        }
    };

    const handleShowInlineBrokerForm = () => {
        setShowInlineBrokerForm(true);
        setInlineBrokerData({});
    };

    const handleSaveInlineBrokerLocal = async () => {
        if (!inlineBrokerData.name) {
            showToast('Broker name is required', 'error');
            return;
        }

        // Call parent handler
        const newBroker = await onCreateBroker(inlineBrokerData);

        if (newBroker) {
            // Auto-select the new broker
            const currentBrokers = formData.brokerIds || [];
            setFormData({
                ...formData,
                brokerIds: [...currentBrokers, newBroker.id]
            });
            setShowInlineBrokerForm(false);
            setInlineBrokerData({});
        }
    };

    // Photo Handlers (Moved from App.jsx)
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check limits
        const currentPhotos = formData.photos || [];
        if (currentPhotos.length + files.length > 10) {
            showToast('Maximum 10 photos allowed per property', 'error');
            return;
        }

        const newPhotos = [];
        let processed = 0;

        files.forEach(file => {
            // Validate size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast(`File ${file.name} is too large (max 2MB)`, 'error');
                processed++;
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                newPhotos.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    data: reader.result,
                    type: file.type
                });
                processed++;

                if (processed === files.length) {
                    setFormData(prev => ({
                        ...prev,
                        photos: [...(prev.photos || []), ...newPhotos]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePhotoUrlAdd = (url) => {
        if (!url) return;
        setFormData(prev => ({
            ...prev,
            photos: [
                ...(prev.photos || []),
                {
                    id: Date.now(),
                    name: 'Image from URL',
                    data: url,
                    type: 'url'
                }
            ]
        }));
    };

    const handlePasteImage = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setFormData(prev => ({
                        ...prev,
                        photos: [
                            ...(prev.photos || []),
                            {
                                id: Date.now(),
                                name: 'Pasted Image',
                                data: event.target.result,
                                type: file.type
                            }
                        ]
                    }));
                };
                reader.readAsDataURL(file);
                e.preventDefault(); // Prevent default paste behavior
                break;
            }
        }
    };

    const handleDeletePhoto = (photoId) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter(p => p.id !== photoId)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondaryClass}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search properties by address or Crexi..."
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
                        <CustomSelect
                            label="Debt Service Type"
                            value={formData.debtServiceType || 'standard'}
                            onChange={(value) => setFormData({ ...formData, debtServiceType: value })}
                            options={[
                                { value: 'standard', label: 'Standard Amortization' },
                                { value: 'interestOnly', label: 'Interest-Only' }
                            ]}
                        />

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

                        {/* Lease Terms Section */}
                        <div className="col-span-2 mt-4">
                            <h3 className={`text-lg font-semibold ${textClass} mb-3`}>Lease Terms</h3>
                        </div>

                        <input
                            type="number"
                            placeholder="Initial Lease Term (years, e.g., 7)"
                            value={formData.initialLeaseTermYears || ''}
                            onChange={(e) => setFormData({ ...formData, initialLeaseTermYears: e.target.value })}
                            className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <input
                            type="number"
                            placeholder="Number of Renewal Options (e.g., 3)"
                            value={formData.renewalOptionCount || ''}
                            onChange={(e) => setFormData({ ...formData, renewalOptionCount: e.target.value })}
                            className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <input
                            type="number"
                            placeholder="Renewal Term Length (years, e.g., 5)"
                            value={formData.renewalTermYears || ''}
                            onChange={(e) => setFormData({ ...formData, renewalTermYears: e.target.value })}
                            className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Annual Rent Escalator % (e.g., 2.0)"
                            value={formData.annualRentEscalator || ''}
                            onChange={(e) => setFormData({ ...formData, annualRentEscalator: e.target.value })}
                            className={`px-4 py-3 rounded-lg border ${inputBorderClass} ${inputBgClass} ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Option Rent Escalator % (e.g., 5.0)"
                            value={formData.optionRentEscalator || ''}
                            onChange={(e) => setFormData({ ...formData, optionRentEscalator: e.target.value })}
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
                                            onClick={handleSaveInlineBrokerLocal}
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
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${inputBorderClass} ${formData.brokerIds?.includes(broker.id) ? 'bg-blue-100 border-blue-500' : inputBgClass
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
                            onClick={handleSave}
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
                    const metrics = calculateMetrics(property, leases);
                    const propertyBrokers = (property.brokerIds || []).map(id => brokers.find(b => b.id === id)).filter(Boolean);

                    return (
                        <div key={property.id} className={`${cardBgClass} rounded-xl shadow-lg p-8 border ${borderClass} hover:shadow-xl transition`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <h2
                                        onClick={() => openPropertyProfile(property.id)}
                                        className={`text-2xl font-bold ${textClass} cursor-pointer hover:text-blue-500 transition`}
                                        title="Click to view property details"
                                    >
                                        {property.address || 'No address'}
                                    </h2>
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
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
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
                                        onClick={() => onDeleteProperty(property.id)}
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
                                        className={`w-full px-4 py-2 rounded-lg font-semibold transition ${darkMode
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
                                                        sensitivityColMax,
                                                        leases // Pass leases for nested calculation
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
                                                                                <td key={colIdx} className={`border ${borderClass} p-2 text-center ${bgColor} ${textClass}`}>
                                                                                    {selectedMetric.format(value)}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PropertiesPage;
