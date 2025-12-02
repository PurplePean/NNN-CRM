# Flexible Partner Selection Feature

## Overview

This feature adds support for two types of partner selection when adding partners to property deals:
1. **Existing Partners** - Select from the partners contact list (linked to partners table)
2. **Custom Partners** - Create on-the-fly partners for one-time use (not linked to contact list)

It also adds the ability to edit investment amounts after partners have been added to deals.

## Features Implemented

### 1. Partner Selection Options

#### Option A: Select from Existing Partners
- Dropdown populated from partners contact list
- Automatically pulls partner name, contact info, and preferred targets
- Creates link to partners table (partner_id in partners_in_deal)
- Shows partner's preferred asset classes in the card display

#### Option B: Create Custom Partner
- "Custom Partner" option in the modal
- Simple text input for partner name
- No contact list link (partner_id = null)
- Just for this specific deal
- Still supports full investment tracking and metrics

### 2. Investment Amount Editing

#### Editable Investment Display
- Click "Edit" button next to investment amount
- Inline editing with Save/Cancel buttons
- Auto-recalculates all 7 metrics in real-time
- Updates database on save
- Metrics update immediately without page refresh

### 3. Partner Returns Display

#### Partner Card Shows:
- **Partner Name** - From either linked partner or custom name
- **Partner Type Badge** - "Custom" badge for on-the-fly partners
- **Investment Amount** - Editable inline with Edit button
- **All 7 Metrics**:
  - Ownership percentage
  - Annual cash flow
  - Cash-on-cash return
  - Exit proceeds
  - Total return
  - IRR
  - Equity multiple
- **Preferred Targets** - Only shown for linked partners with assetClasses defined

## Database Changes

### partners_in_deal Table Updates

**New Schema:**
```sql
CREATE TABLE partners_in_deal (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id),
  partner_id UUID NULL REFERENCES partners(id),  -- Now nullable
  partner_name TEXT NULL,                         -- New field
  investment_amount NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id)
);
```

**Key Changes:**
1. `partner_id` is now **nullable** (was previously NOT NULL)
2. Added `partner_name` field to store custom partner names
3. Added check constraint: either `partner_id` OR `partner_name` must be provided
4. Updated unique constraint to only apply when `partner_id` IS NOT NULL

**Migration File:** `sql/10-flexible-partner-selection.sql`

## Code Changes

### State Updates (src/App.jsx)

**New State Variables:**
```javascript
const [partnerDealFormData, setPartnerDealFormData] = useState({
  partnerSelectionMode: 'existing', // 'existing' or 'custom'
  partnerId: '',
  partnerName: '',
  investmentAmount: ''
});

const [editingInvestment, setEditingInvestment] = useState({});
```

### New Handler Functions

1. **handleStartEditInvestment(dealId, currentAmount)**
   - Initiates edit mode for investment amount
   - Sets editing state with current value

2. **handleSaveInvestment(dealId)**
   - Validates and saves updated investment amount
   - Updates database via Supabase
   - Clears editing state
   - Shows success toast

3. **handleCancelEditInvestment(dealId)**
   - Cancels editing and reverts to stored value
   - Clears editing state

### Updated Handler Functions

**handleSavePartnerDeal()**
- Now validates based on `partnerSelectionMode`
- Saves either `partner_id` (existing) or `partner_name` (custom)
- Ensures only one field is populated (enforced by database constraint)

### UI Components

#### Add Partner Modal
- **Partner Type Toggle** - Switch between "Existing Partner" and "Custom Partner"
- **Conditional Fields**:
  - Existing: Dropdown select from partners list
  - Custom: Text input for partner name with helper text
- **Investment Amount** - Number input (same for both types)

#### Partner Returns Card
- **Dynamic Partner Name** - Shows name from either source
- **Type Badge** - "Custom" badge for non-linked partners
- **Editable Investment** - Inline edit with Save/Cancel
- **Conditional Preferred Targets** - Only for linked partners
- **Real-time Metrics** - Updates during editing (before save)

## Usage

### Adding an Existing Partner

1. Click "Add Partner" button
2. Keep "Existing Partner" selected (default)
3. Select partner from dropdown
4. Enter investment amount
5. Click "Add Partner"
6. Partner card displays with preferred targets

### Adding a Custom Partner

1. Click "Add Partner" button
2. Click "Custom Partner" toggle
3. Enter partner name in text field
4. Enter investment amount
5. Click "Add Partner"
6. Partner card displays with "Custom" badge

### Editing Investment Amount

1. Locate partner card
2. Click "Edit" button next to investment amount
3. Update the value in the input field
4. Watch metrics auto-recalculate
5. Click "Save" to persist changes or "Cancel" to revert

## Database Migration Instructions

### Prerequisites
- Access to Supabase Dashboard
- Admin permissions on the database

### Steps to Apply Migration

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Open **SQL Editor**

2. **Open New Query**
   - Click "+ New query" button

3. **Copy Migration SQL**
   - Open `sql/10-flexible-partner-selection.sql`
   - Copy the entire contents

4. **Paste and Run**
   - Paste the SQL into the editor
   - Click "Run" button (or press Ctrl/Cmd + Enter)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - The schema will now support flexible partner selection

### What the Migration Does

1. Makes `partner_id` column nullable
2. Adds `partner_name` column (TEXT)
3. Drops existing unique constraint on (property_id, partner_id)
4. Creates new partial unique index (only when partner_id IS NOT NULL)
5. Adds check constraint to ensure either partner_id OR partner_name exists

### Testing the Migration

After applying:
1. Try adding an existing partner (should work as before)
2. Try adding a custom partner (should save with partner_name only)
3. Try editing investment amounts (should update successfully)
4. Verify data persists after page reload

## Rollback (if needed)

If you need to revert the changes:

```sql
-- WARNING: This will delete custom partners (where partner_id IS NULL)
DELETE FROM partners_in_deal WHERE partner_id IS NULL;

-- Restore original constraints
ALTER TABLE partners_in_deal
ALTER COLUMN partner_id SET NOT NULL;

ALTER TABLE partners_in_deal
DROP COLUMN IF EXISTS partner_name;

-- Recreate original unique constraint
CREATE UNIQUE INDEX partners_in_deal_property_id_partner_id_key
ON partners_in_deal(property_id, partner_id);
```

## Future Enhancements

Potential improvements:
1. Convert custom partners to full partners (promote to contact list)
2. Bulk edit investment amounts
3. Import partners from CSV with custom names
4. Partner templates for common investment structures
5. Partner group assignments (e.g., "Fund A investors")

## Files Modified

- **src/App.jsx** - Main component with UI and logic
- **sql/10-flexible-partner-selection.sql** - Database migration

## Files Created

- **docs/FLEXIBLE-PARTNER-SELECTION.md** - This documentation

## Related Features

- **Partner Returns Calculator** - Base feature for calculating partner metrics
- **Contact Management** - Partners contact list
- **Property Detail Cards** - Where partner returns are displayed

## Support

For questions or issues:
1. Check the console for error messages
2. Verify database migration was applied successfully
3. Ensure Supabase connection is active
4. Review browser console for client-side errors
