import React, { useState } from 'react';
import {
    Plus, Search, Building2, Trash2, Edit2, Mail, Phone, Globe, ExternalLink, User
} from 'lucide-react';

const BrokersPage = ({
    brokers = [],
    onSaveBroker,
    onDeleteBroker,
    onUpdateBrokerField,
    openContactProfile,
    showToast,
    darkMode
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showBrokerForm, setShowBrokerForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    // Inline card editing state
    const [editingBrokerCardId, setEditingBrokerCardId] = useState(null);
    const [editedBrokerCardData, setEditedBrokerCardData] = useState({});

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

    const handleAddBroker = () => {
        setEditingId(null);
        setFormData({});
        setShowBrokerForm(true);
    };

    const handleEditBroker = (broker) => {
        setEditingId(broker.id);
        setFormData({ ...broker });
        setShowBrokerForm(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            showToast('Broker name is required', 'error');
            return;
        }

        try {
            await onSaveBroker(formData, editingId);
            setShowBrokerForm(false);
            setFormData({});
        } catch (error) {
            console.error(error);
        }
    };

    return (
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
                            onClick={handleSave}
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
                    const getInitials = (name) => {
                        if (!name) return '?';
                        const parts = name.split(' ');
                        if (parts.length === 1) return parts[0][0].toUpperCase();
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    };

                    const handleSaveCardEdit = async () => {
                        const updates = {};
                        const editableFields = ['name', 'firmName', 'email', 'phone'];

                        editableFields.forEach(field => {
                            if (editedBrokerCardData[field] !== broker[field]) {
                                updates[field] = editedBrokerCardData[field];
                            }
                        });

                        if (Object.keys(updates).length > 0) {
                            for (const [field, value] of Object.entries(updates)) {
                                await onUpdateBrokerField(broker.id, field, value);
                            }
                        }

                        setEditingBrokerCardId(null);
                        setEditedBrokerCardData({});
                    };

                    return (
                        <div key={broker.id} className={`${cardBgClass} rounded-xl shadow-lg border ${borderClass} hover:shadow-xl transition overflow-hidden`}>
                            {/* Header with Avatar and Quick Actions */}
                            <div className={`p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                            {getInitials(broker.name)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                {editingBrokerCardId === broker.id ? (
                                                    <input
                                                        type="text"
                                                        value={editedBrokerCardData.name || ''}
                                                        onChange={(e) => setEditedBrokerCardData({ ...editedBrokerCardData, name: e.target.value })}
                                                        className={`text-xl font-bold ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                                                        placeholder="Broker name"
                                                    />
                                                ) : (
                                                    <h3
                                                        onClick={() => openContactProfile('broker', broker.id)}
                                                        className={`text-xl font-bold ${textClass} cursor-pointer hover:text-blue-500 transition`}
                                                        title="Click to view broker details"
                                                    >
                                                        {broker.name || 'No name'}
                                                    </h3>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Building2 size={14} className={textSecondaryClass} />
                                            {editingBrokerCardId === broker.id ? (
                                                <input
                                                    type="text"
                                                    value={editedBrokerCardData.firmName || ''}
                                                    onChange={(e) => setEditedBrokerCardData({ ...editedBrokerCardData, firmName: e.target.value })}
                                                    className={`text-sm ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1`}
                                                    placeholder="Firm name"
                                                />
                                            ) : (
                                                <span className={`text-sm ${textSecondaryClass}`}>
                                                    {broker.firmName || 'No firm'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {editingBrokerCardId === broker.id ? (
                                            <>
                                                <button
                                                    onClick={handleSaveCardEdit}
                                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingBrokerCardId(null);
                                                        setEditedBrokerCardData({});
                                                    }}
                                                    className={`px-3 py-2 border ${borderClass} ${textSecondaryClass} hover:bg-slate-100 rounded-lg font-semibold transition text-sm`}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingBrokerCardId(broker.id);
                                                        setEditedBrokerCardData({ ...broker });
                                                    }}
                                                    className={`p-2 ${textSecondaryClass} ${hoverBgClass} rounded-lg transition`}
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteBroker(broker.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Grid */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                                        <Mail className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Email</p>
                                        {editingBrokerCardId === broker.id ? (
                                            <input
                                                type="email"
                                                value={editedBrokerCardData.email || ''}
                                                onChange={(e) => setEditedBrokerCardData({ ...editedBrokerCardData, email: e.target.value })}
                                                className={`text-sm ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                                            />
                                        ) : (
                                            <a href={`mailto:${broker.email}`} className={`text-sm ${textClass} hover:text-blue-500 truncate block`}>
                                                {broker.email || 'N/A'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
                                        <Phone className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Phone</p>
                                        {editingBrokerCardId === broker.id ? (
                                            <input
                                                type="tel"
                                                value={editedBrokerCardData.phone || ''}
                                                onChange={(e) => setEditedBrokerCardData({ ...editedBrokerCardData, phone: e.target.value })}
                                                className={`text-sm ${darkMode ? 'bg-slate-700 text-gray-100' : 'bg-white text-gray-900'} px-2 py-1 rounded border ${borderClass} focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                                            />
                                        ) : (
                                            <a href={`tel:${broker.phone}`} className={`text-sm ${textClass} hover:text-blue-500 truncate block`}>
                                                {broker.phone || 'N/A'}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-purple-50'}`}>
                                        <Globe className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-semibold ${textSecondaryClass} uppercase`}>Properties</p>
                                        <p className={`text-sm font-medium ${textClass}`}>
                                            N/A
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrokersPage;
