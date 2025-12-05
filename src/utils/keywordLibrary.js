import {
  MapPin,
  ClipboardCheck,
  Users,
  FileText,
  Scale,
  StickyNote,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Heart
} from 'lucide-react';

/**
 * Comprehensive keyword library for auto-categorizing notes across all entity types
 * Each category includes: label, icon, colors, and keywords for auto-detection
 */
export const NOTE_CATEGORIES = {
  property: [
    {
      label: 'Site Visit',
      value: 'site_visit',
      icon: MapPin,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      keywords: [
        'visited', 'on-site', 'walked', 'toured', 'property walk',
        'site visit', 'went to', 'viewed property', 'stopped by',
        'drove by', 'saw the property', 'visited today', 'property tour',
        'walk through', 'walkthrough', 'on site', 'at the property',
        'at property', 'went out', 'drive by'
      ]
    },
    {
      label: 'Inspection Report',
      value: 'inspection',
      icon: ClipboardCheck,
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      keywords: [
        'inspection', 'inspector', 'inspected', 'defects', 'issues found',
        'report', 'findings', 'structural', 'foundation', 'roof',
        'electrical', 'plumbing', 'hvac', 'code violation',
        'repairs needed', 'assessment', 'survey', 'walkthrough',
        'building inspection', 'property inspection', 'home inspection',
        'inspection report', 'defect', 'issue', 'problem found',
        'needs repair', 'damage', 'faulty', 'broken'
      ]
    },
    {
      label: 'Meeting',
      value: 'meeting',
      icon: Users,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      keywords: [
        'met with', 'discussed', 'meeting with', 'spoke to', 'met',
        'meeting', 'gathered', 'assembled', 'conference',
        'presentation', 'call with', 'spoke with', 'talked to',
        'had a meeting', 'meeting today', 'discussed with',
        'conversation with', 'talking to', 'talk with'
      ]
    },
    {
      label: 'Underwriting Notes',
      value: 'underwriting',
      icon: FileText,
      color: '#8b5cf6',
      bgColor: '#f3e8ff',
      borderColor: '#c4b5fd',
      keywords: [
        'underwriting', 'debt', 'ltv', 'cash flow', 'underwriter',
        'loan', 'financing', 'dscr', 'debt service', 'interest rate',
        'amortization', 'appraisal', 'valuation', 'cap rate', 'noi',
        'revenue', 'expenses', 'pro forma', 'yield', 'irr',
        'equity multiple', 'financial', 'finance', 'numbers',
        'cash on cash', 'returns', 'roi', 'return on investment',
        'net income', 'operating income', 'proforma', 'underwrite'
      ]
    },
    {
      label: 'Legal Review',
      value: 'legal',
      icon: Scale,
      color: '#ef4444',
      bgColor: '#fee2e2',
      borderColor: '#fca5a5',
      keywords: [
        'legal', 'attorney', 'contract', 'agreement', 'counsel',
        'lawyer', 'review', 'lease', 'tenant', 'title', 'escrow',
        'closing', 'warranty', 'liability', 'insurance',
        'litigation', 'lien', 'covenant', 'contingency',
        'due diligence', 'legal review', 'law', 'compliance',
        'regulatory', 'regulation', 'clause', 'terms', 'legal issue'
      ]
    },
    {
      label: 'Property Condition',
      value: 'property_condition',
      icon: FileText,
      color: '#ec4899',
      bgColor: '#fce7f3',
      borderColor: '#f9a8d4',
      keywords: [
        'roof', 'flooring', 'electrical', 'hvac', 'structural',
        'foundation', 'plumbing', 'walls', 'windows', 'doors',
        'siding', 'paint', 'carpet', 'tile', 'concrete', 'asphalt',
        'gutters', 'drainage', 'insulation', 'leak', 'damage',
        'crack', 'wear', 'deterioration', 'repair', 'replace',
        'upgrade', 'condition', 'maintenance', 'fix', 'broken',
        'needs work', 'aging', 'old', 'worn', 'damaged'
      ]
    },
    {
      label: 'Other',
      value: 'other',
      icon: StickyNote,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
      keywords: []
    }
  ],

  broker: [
    {
      label: 'Phone Call',
      value: 'phone_call',
      icon: Phone,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      keywords: [
        'called', 'phone', 'spoke with', 'call with', 'phone call',
        'spoke', 'phoned', 'telephone', 'dialed', 'talked on phone',
        'phone conversation', 'call', 'calling', 'reached out by phone',
        'left voicemail', 'voicemail', 'returned call', 'call back'
      ]
    },
    {
      label: 'Email',
      value: 'email',
      icon: Mail,
      color: '#06b6d4',
      bgColor: '#cffafe',
      borderColor: '#67e8f9',
      keywords: [
        'emailed', 'sent email', 'responded to', 'email',
        'received email', 'message', 'correspondence',
        'forwarded', 'replied', 'email exchange', 'sent message',
        'received message', 'inbox', 'sent', 'reply', 'forward'
      ]
    },
    {
      label: 'Meeting',
      value: 'meeting',
      icon: Users,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      keywords: [
        'met', 'meeting', 'in person', 'met with', 'lunch',
        'coffee', 'office', 'conference', 'discussed', 'conversation',
        'had a meeting', 'meeting with', 'sat down with', 'spoke with'
      ]
    },
    {
      label: 'Commission Discussion',
      value: 'commission',
      icon: DollarSign,
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      keywords: [
        'commission', 'deal', 'closing', 'fee', 'commission rate',
        'commission split', 'rate', 'percentage', 'payment',
        'compensation', 'split', 'broker fee', 'brokerage fee',
        'earn', 'earning', 'payout', 'broker commission'
      ]
    },
    {
      label: 'Other',
      value: 'other',
      icon: StickyNote,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
      keywords: []
    }
  ],

  partner: [
    {
      label: 'Partner Discussion',
      value: 'partner_discussion',
      icon: Heart,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      keywords: [
        'discussed with partner', 'partner said', 'partner agreed',
        'partner wants', 'partner concern', 'partner feedback',
        'partner opinion', 'partner thinks', 'partner mentioned',
        'partner suggested', 'partner asked', 'partner interested',
        'partner discussed', 'partner conversation'
      ]
    },
    {
      label: 'Meeting',
      value: 'meeting',
      icon: Users,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      keywords: [
        'met', 'meeting', 'in person', 'met with', 'gathering',
        'conference', 'discussed', 'conversation', 'had a meeting',
        'meeting with', 'sat down with', 'spoke with'
      ]
    },
    {
      label: 'Phone Call',
      value: 'phone_call',
      icon: Phone,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      keywords: [
        'called', 'phone', 'spoke with', 'call with', 'phone call',
        'spoke', 'phoned', 'telephone', 'dialed', 'talked on phone',
        'phone conversation', 'call', 'calling'
      ]
    },
    {
      label: 'Email',
      value: 'email',
      icon: Mail,
      color: '#06b6d4',
      bgColor: '#cffafe',
      borderColor: '#67e8f9',
      keywords: [
        'emailed', 'sent email', 'responded to', 'email',
        'received email', 'message', 'correspondence',
        'forwarded', 'replied', 'email exchange', 'sent message'
      ]
    },
    {
      label: 'Investment Update',
      value: 'investment_update',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      keywords: [
        'investment', 'committed', 'funding', 'invested',
        'capital', 'committed capital', 'investment amount',
        'capital call', 'distribution', 'return', 'equity',
        'invest', 'investing', 'investor', 'commit', 'commitment',
        'fund', 'funds', 'investment update', 'portfolio'
      ]
    },
    {
      label: 'Other',
      value: 'other',
      icon: StickyNote,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
      keywords: []
    }
  ],

  gatekeeper: [
    {
      label: 'Phone Call',
      value: 'phone_call',
      icon: Phone,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      keywords: ['called', 'phone', 'spoke with', 'call with', 'phone call']
    },
    {
      label: 'Email',
      value: 'email',
      icon: Mail,
      color: '#06b6d4',
      bgColor: '#cffafe',
      borderColor: '#67e8f9',
      keywords: ['emailed', 'sent email', 'responded to', 'email']
    },
    {
      label: 'Other',
      value: 'other',
      icon: StickyNote,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
      keywords: []
    }
  ],

  event: [
    {
      label: 'Meeting Notes',
      value: 'meeting_notes',
      icon: Users,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      keywords: ['meeting', 'discussion', 'agenda', 'notes']
    },
    {
      label: 'Other',
      value: 'other',
      icon: StickyNote,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
      keywords: []
    }
  ],

  follow_up: []
};

/**
 * Suggest a category based on note content and entity type
 * Uses keyword matching to detect appropriate category
 *
 * @param {string} content - The note content to analyze
 * @param {string} entityType - The entity type (property, broker, partner, etc.)
 * @returns {Object|null} Suggested category object or null if no match
 */
export function suggestCategory(content, entityType) {
  if (!content || !entityType) return null;

  const categories = NOTE_CATEGORIES[entityType] || [];
  const contentLower = content.toLowerCase();

  // Find first category whose keywords match the content
  for (const category of categories) {
    // Skip categories with no keywords (like "Other")
    if (!category.keywords || category.keywords.length === 0) continue;

    // Check if any keyword is found in the content
    const hasMatch = category.keywords.some(keyword =>
      contentLower.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      return category;
    }
  }

  return null;
}

/**
 * Get category data by entity type and category label or value
 *
 * @param {string} entityType - The entity type
 * @param {string} categoryIdentifier - The category label or value
 * @returns {Object|null} Category object or null if not found
 */
export function getCategoryData(entityType, categoryIdentifier) {
  const categories = NOTE_CATEGORIES[entityType] || [];
  return categories.find(c =>
    c.label === categoryIdentifier || c.value === categoryIdentifier
  ) || null;
}

/**
 * Get all categories for an entity type
 *
 * @param {string} entityType - The entity type
 * @returns {Array} Array of category objects
 */
export function getCategoriesList(entityType) {
  return NOTE_CATEGORIES[entityType] || [];
}

/**
 * Get category by value (slug)
 *
 * @param {string} entityType - The entity type
 * @param {string} value - The category value/slug
 * @returns {Object|null} Category object or null
 */
export function getCategoryByValue(entityType, value) {
  const categories = NOTE_CATEGORIES[entityType] || [];
  return categories.find(c => c.value === value) || null;
}
