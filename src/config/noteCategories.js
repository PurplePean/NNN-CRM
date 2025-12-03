import {
  MapPin,
  ClipboardCheck,
  Users,
  Phone,
  Mail,
  Scale,
  FileText,
  Users2,
  TrendingUp,
  CheckCircle,
  CheckSquare,
  Activity,
  MessageCircle
} from 'lucide-react';

/**
 * Category configurations for different entity types
 * Each category includes: value (slug), label, icon component, and color class
 */
export const NOTE_CATEGORIES = {
  property: [
    {
      value: 'site_visit',
      label: 'Site Visit',
      icon: MapPin,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      value: 'inspection',
      label: 'Inspection Report',
      icon: ClipboardCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      value: 'meeting',
      label: 'Meeting',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      value: 'underwriting',
      label: 'Underwriting Notes',
      icon: FileText,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20'
    },
    {
      value: 'legal',
      label: 'Legal Review',
      icon: Scale,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ],

  broker: [
    {
      value: 'phone_call',
      label: 'Phone Call',
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      value: 'email',
      label: 'Email',
      icon: Mail,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      value: 'meeting',
      label: 'Meeting',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ],

  partner: [
    {
      value: 'partner_discussion',
      label: 'Partner Discussion',
      icon: Users2,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      value: 'meeting',
      label: 'Meeting',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      value: 'phone_call',
      label: 'Phone Call',
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      value: 'email',
      label: 'Email',
      icon: Mail,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      value: 'investment_update',
      label: 'Investment Update',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ],

  gatekeeper: [
    {
      value: 'phone_call',
      label: 'Phone Call',
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      value: 'email',
      label: 'Email',
      icon: Mail,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      value: 'meeting',
      label: 'Meeting',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      value: 'approval_status',
      label: 'Approval Status',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ],

  event: [
    {
      value: 'meeting_notes',
      label: 'Meeting Notes',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      value: 'call_summary',
      label: 'Call Summary',
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      value: 'action_items',
      label: 'Action Items',
      icon: CheckSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ],

  follow_up: [
    {
      value: 'status_update',
      label: 'Status Update',
      icon: Activity,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20'
    },
    {
      value: 'completion_notes',
      label: 'Completion Notes',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      value: 'other',
      label: 'Other',
      icon: MessageCircle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20'
    }
  ]
};

/**
 * Get categories for a specific entity type
 * @param {string} entityType - The entity type (property, broker, partner, etc.)
 * @returns {Array} Array of category configurations
 */
export const getCategoriesByEntityType = (entityType) => {
  return NOTE_CATEGORIES[entityType] || NOTE_CATEGORIES.property;
};

/**
 * Get category configuration by entity type and category value
 * @param {string} entityType - The entity type
 * @param {string} categoryValue - The category value/slug
 * @returns {Object|null} Category configuration object or null
 */
export const getCategoryConfig = (entityType, categoryValue) => {
  const categories = getCategoriesByEntityType(entityType);
  return categories.find(cat => cat.value === categoryValue) || null;
};

/**
 * Get default category for an entity type
 * @param {string} entityType - The entity type
 * @returns {string} Default category value
 */
export const getDefaultCategory = (entityType) => {
  const categories = getCategoriesByEntityType(entityType);
  return categories[0]?.value || 'other';
};
