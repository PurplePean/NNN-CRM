# DATABASE SCHEMA DOCUMENTATION
**NNN CRM - Complete Database Reference**
**Last Updated:** December 4, 2025

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Relationship Tables](#relationship-tables)
4. [Configuration Tables](#configuration-tables)
5. [Deprecated Tables](#deprecated-tables)
6. [Common Patterns](#common-patterns)
7. [RLS Policies](#rls-policies)
8. [Indexes](#indexes)

---

## OVERVIEW

The NNN CRM uses PostgreSQL with Supabase, featuring Row Level Security (RLS) on all tables. The schema supports:
- Real estate property management
- Broker and partner relationship tracking
- Financial modeling and partner returns
- Calendar events and follow-up tasks
- Categorized notes across all entity types
- Google Calendar integration
- Property-specific lease scenarios

**Total Tables:** 11 active, 1 deprecated

---

## CORE TABLES

### `properties`
**Purpose:** Industrial real estate properties with financial modeling

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `address` | TEXT | NOT NULL | Property address |
| `"squareFeet"` | TEXT | NULL | Square footage |
| `"monthlyBaseRentPerSqft"` | TEXT | NULL | Monthly base rent per SF |
| `"purchasePrice"` | TEXT | NULL | Purchase price |
| `improvements` | TEXT | NULL | CapEx/renovation costs |
| `"closingCosts"` | TEXT | NULL | Closing costs |
| `"ltvPercent"` | TEXT | NULL | Loan-to-value percentage |
| `"interestRate"` | TEXT | NULL | Loan interest rate |
| `"loanTerm"` | TEXT | NULL | Loan term in years (default '30') |
| `"debtServiceType"` | TEXT | NULL | Debt service type (standard/interestOnly) |
| `"exitCapRate"` | TEXT | NULL | Exit cap rate for projections |
| `"holdingPeriodMonths"` | TEXT | NULL | Holding period in months |
| `crexi` | TEXT | NULL | CREXi listing URL |
| `"brokerIds"` | UUID[] | NULL | Array of broker UUIDs |
| `photos` | JSONB | NULL | Array of photo objects |
| `"noteHistory"` | JSONB | NULL | **DEPRECATED** - Legacy notes array |
| `notes` | TEXT | NULL | Simple notes field |
| `selected_lease_id` | UUID | NULL | FK to leases(id), ON DELETE SET NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_properties_user_id` ON (user_id)
- `idx_properties_address` ON (address)
- `idx_properties_broker_ids` ON ("brokerIds") USING GIN
- `idx_properties_selected_lease_id` ON (selected_lease_id)

**RLS:** Permissive - all authenticated users can access

**Notes:**
- Financial fields stored as TEXT to preserve user input formatting
- `"brokerIds"` is an array of UUIDs (no FK constraint)
- `"noteHistory"` is deprecated - use `notes` table instead

---

### `brokers`
**Purpose:** Real estate broker contacts

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `name` | TEXT | NOT NULL | Broker name |
| `email` | TEXT | NULL | Email address |
| `phone` | TEXT | NULL | Phone number |
| `"firmName"` | TEXT | NULL | Brokerage firm name |
| `"firmWebsite"` | TEXT | NULL | Firm website URL |
| `"crexiLink"` | TEXT | NULL | CREXi profile link |
| `"licenseNumber"` | TEXT | NULL | Broker license number |
| `conversations` | TEXT | NULL | **LEGACY** - May be deprecated |
| `company` | TEXT | NULL | **LEGACY** - Replaced by firmName |
| `"noteHistory"` | JSONB | NULL | **DEPRECATED** - Use notes table |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_brokers_user_id` ON (user_id)
- `idx_brokers_email` ON (email) WHERE email IS NOT NULL
- `idx_brokers_firm` ON ("firmName")

**RLS:** Permissive - all authenticated users can access

---

### `partners`
**Purpose:** Investment partners and capital sources

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `name` | TEXT | NOT NULL | Partner name |
| `"entityName"` | TEXT | NULL | Entity/company name |
| `email` | TEXT | NULL | Email address |
| `phone` | TEXT | NULL | Phone number |
| `"checkSize"` | TEXT | NULL | Typical investment amount |
| `"assetClasses"` | JSONB | NULL | Array of asset class preferences |
| `"creExperience"` | TEXT | NULL | Commercial real estate experience |
| `background` | TEXT | NULL | Background information |
| `"riskTolerance"` | TEXT | NULL | Risk tolerance level |
| `"customTags"` | JSONB | NULL | Array of custom tags |
| `type` | TEXT | NULL | **LEGACY** - Partner type |
| `"commitmentAmount"` | TEXT | NULL | **LEGACY** - Use checkSize |
| `"assetClass"` | TEXT | NULL | **LEGACY** - Use assetClasses array |
| `"noteHistory"` | JSONB | NULL | **DEPRECATED** - Use notes table |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_partners_user_id` ON (user_id)
- `idx_partners_email` ON (email) WHERE email IS NOT NULL
- `idx_partners_type` ON (type)

**RLS:** Permissive - all authenticated users can access

---

### `gatekeepers`
**Purpose:** Key decision makers and intermediaries

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `name` | TEXT | NOT NULL | Gatekeeper name |
| `title` | TEXT | NULL | Job title |
| `email` | TEXT | NULL | Email address |
| `phone` | TEXT | NULL | Phone number |
| `company` | TEXT | NULL | Company name |
| `"relatedTo"` | TEXT | NULL | Related partner/entity |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_gatekeepers_user_id` ON (user_id)
- `idx_gatekeepers_email` ON (email) WHERE email IS NOT NULL
- `idx_gatekeepers_company` ON (company)

**RLS:** Permissive - all authenticated users can access

---

### `events`
**Purpose:** Calendar events and meetings

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `title` | TEXT | NOT NULL | Event title |
| `type` | TEXT | NULL | Event type (Property Tour, Meeting, etc.) |
| `date` | TEXT | NULL | Event date/time (ISO string) |
| `location` | TEXT | NULL | Event location |
| `description` | TEXT | NULL | Event description |
| `"createdAt"` | TEXT | NULL | **LEGACY** - Creation timestamp (string) |
| `google_event_id` | TEXT | NULL | Google Calendar event ID |
| `synced_to_google` | BOOLEAN | NULL | Whether synced to Google Calendar |
| `last_synced_at` | TIMESTAMPTZ | NULL | Last Google Calendar sync time |
| `sync_error` | TEXT | NULL | Last sync error message |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_events_user_id` ON (user_id)
- `idx_events_date` ON (date)
- `idx_events_type` ON (type)
- `idx_events_google_event_id` ON (google_event_id)
- `idx_events_synced_to_google` ON (synced_to_google)
- `idx_events_last_synced_at` ON (last_synced_at)

**RLS:** Permissive - all authenticated users can access

**Notes:**
- Google Calendar sync fields added in migration 04
- `date` stored as TEXT (ISO string) for compatibility

---

### `follow_ups`
**Purpose:** Follow-up tasks and reminders

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `"contactName"` | TEXT | NULL | Contact name (e.g., "Sarah Mitchell (CBRE)") |
| `type` | TEXT | NULL | Follow-up type (Call, Meeting, Email, etc.) |
| `"dueDate"` | TEXT | NULL | Due date (ISO date string) |
| `priority` | TEXT | NULL | Priority (High, Medium, Low) |
| `notes` | TEXT | NULL | Follow-up notes |
| `status` | TEXT | NULL | Status (pending, completed) |
| `title` | TEXT | NULL | **LEGACY** - Old schema field |
| `"createdAt"` | TEXT | NULL | **LEGACY** - Creation timestamp (string) |
| `"contactType"` | TEXT | NULL | Contact type (broker, partner, gatekeeper, manual) |
| `"contactId"` | UUID | NULL | UUID reference to contact |
| `"relatedContact"` | TEXT | NULL | Legacy contact identifier |
| `google_event_id` | TEXT | NULL | Google Calendar event ID |
| `synced_to_google` | BOOLEAN | NULL | Whether synced to Google Calendar |
| `last_synced_at` | TIMESTAMPTZ | NULL | Last Google Calendar sync time |
| `sync_error` | TEXT | NULL | Last sync error message |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_follow_ups_user_id` ON (user_id)
- `idx_follow_ups_due_date` ON ("dueDate")
- `idx_follow_ups_status` ON (status)
- `idx_follow_ups_priority` ON (priority)
- `idx_follow_ups_contact_type` ON ("contactType")
- `idx_follow_ups_contact_id` ON ("contactId")
- `idx_follow_ups_google_event_id` ON (google_event_id)
- `idx_follow_ups_synced_to_google` ON (synced_to_google)
- `idx_follow_ups_last_synced_at` ON (last_synced_at)

**RLS:** Permissive - all authenticated users can access

**Notes:**
- Enhanced contact selector added in migration 03
- Google Calendar sync added in migration 04
- Can link to brokers, partners, gatekeepers, or use manual entry

---

### `notes`
**Purpose:** Categorized notes for all entity types (global polymorphic system)

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `entity_type` | TEXT | NOT NULL | Entity type (property, broker, partner, etc.) |
| `entity_id` | UUID | NOT NULL | UUID of associated entity |
| `content` | TEXT | NOT NULL | Note content |
| `category` | TEXT | NULL | Note category slug |
| `edited` | BOOLEAN | NULL | Whether note has been edited |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Constraints:**
- CHECK: `entity_type IN ('property', 'broker', 'partner', 'gatekeeper', 'event', 'follow_up')`

**Indexes:**
- `idx_notes_user_id` ON (user_id)
- `idx_notes_entity` ON (entity_type, entity_id)
- `idx_notes_created_at` ON (created_at DESC)

**RLS:** Users can view all notes, but only modify their own

**Notes:**
- Polymorphic relationship via entity_type + entity_id
- Categories defined in `src/config/noteCategories.js`
- Replaced old `noteHistory` JSONB columns

**Supported Entity Types:**
- `property` - Site visits, inspections, meetings, underwriting, legal, other
- `broker` - Phone calls, emails, meetings, other
- `partner` - Partner discussions, meetings, phone calls, emails, investment updates, other
- `gatekeeper` - Phone calls, emails, meetings, approval status, other
- `event` - Meeting notes, call summaries, action items, other
- `follow_up` - Status updates, completion notes, other

---

## RELATIONSHIP TABLES

### `leases`
**Purpose:** Property-specific lease scenarios with detailed terms

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `lease_name` | TEXT | NOT NULL | Lease name/identifier |
| `price_per_sf_month` | NUMERIC(10,4) | NOT NULL | Monthly price per square foot |
| `term_years` | INTEGER | NOT NULL | Lease term in years |
| `property_id` | UUID | NULL | FK to properties(id), ON DELETE CASCADE |
| `cam_amount` | NUMERIC(10,4) | NULL | CAM charge amount |
| `cam_type` | TEXT | NULL | CAM type (per_month, per_year, total_annual) |
| `rent_increase_type` | TEXT | NULL | Rent increase type (flat_annual, stepped, none) |
| `flat_annual_increase_percent` | NUMERIC(5,2) | NULL | Annual rent increase % (if flat_annual) |
| `rent_steps` | JSONB | NULL | Array of stepped rent increases |
| `base_annual_escalation_percent` | NUMERIC(5,2) | NULL | Base annual escalation % |
| `tenant_improvement_amount` | NUMERIC(12,2) | NULL | Tenant improvement (TI) amount |
| `tenant_allowance_amount` | NUMERIC(12,2) | NULL | Tenant allowance amount |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Constraints:**
- CHECK: `cam_type IN ('per_month', 'per_year', 'total_annual')`
- CHECK: `rent_increase_type IN ('flat_annual', 'stepped', 'none')`
- CHECK: CAM amount and type must both be set or both be NULL

**Indexes:**
- `idx_leases_created_at` ON (created_at DESC)
- `idx_leases_property_id` ON (property_id)
- `idx_leases_rent_steps` ON (rent_steps) USING GIN

**RLS:** Property ownership-based (via EXISTS query on properties)

**Notes:**
- Originally global (user-level), changed to property-specific in migration 07
- RLS policies fixed in migration 08 (IN → EXISTS)
- Extended parameters added in migration 09

**rent_steps JSONB Structure:**
```json
[
  {"trigger_year": 2, "increase_percent": 10},
  {"trigger_year": 4, "increase_percent": 20}
]
```

---

### `partners_in_deal`
**Purpose:** Link partners to properties with investment amounts

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `property_id` | UUID | NOT NULL | FK to properties(id), ON DELETE CASCADE |
| `partner_id` | UUID | NULL | FK to partners(id), ON DELETE CASCADE |
| `partner_name` | TEXT | NULL | Custom partner name (for on-the-fly partners) |
| `investment_amount` | NUMERIC(15,2) | NOT NULL | Partner's investment amount |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Constraints:**
- CHECK: Either `partner_id` OR `partner_name` must be provided (not both)
- UNIQUE: `(property_id, partner_id)` WHERE partner_id IS NOT NULL

**Indexes:**
- `idx_partners_in_deal_property_id` ON (property_id)
- `idx_partners_in_deal_partner_id` ON (partner_id)
- `idx_partners_in_deal_unique_linked_partner` ON (property_id, partner_id) WHERE partner_id IS NOT NULL (UNIQUE)

**RLS:** Permissive - all authenticated users can access

**Notes:**
- Supports both linked partners (partner_id) and custom partners (partner_name)
- Flexible partner selection added in migration 10
- RLS policies fixed in migration 09 (restrictive → permissive)

---

## CONFIGURATION TABLES

### `sync_settings`
**Purpose:** Google Calendar sync configuration

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `setting_key` | TEXT | NOT NULL | Setting key (UNIQUE) |
| `setting_value` | TEXT | NULL | Setting value |
| `description` | TEXT | NULL | Setting description |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Indexes:**
- `idx_sync_settings_key` ON (setting_key)
- `idx_sync_settings_user_id` ON (user_id)

**RLS:** Permissive - all authenticated users can access

**Default Settings:**
- `google_calendar_id` - Company shared Google Calendar ID
- `sync_enabled` - Enable/disable sync
- `sync_interval_minutes` - Sync interval
- `last_successful_sync` - Last sync timestamp

---

## DEPRECATED TABLES

### `property_notes` (DEPRECATED)
**Purpose:** Property-specific notes (replaced by global `notes` table)

**Status:** Should be dropped after data migration

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NOT NULL | Primary key |
| `property_id` | UUID | NOT NULL | FK to properties(id), ON DELETE CASCADE |
| `content` | TEXT | NOT NULL | Note content |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `user_id` | UUID | NULL | FK to auth.users(id), ON DELETE CASCADE |

**Migration Path:**
```sql
-- Migrate to notes table
INSERT INTO notes (entity_type, entity_id, content, category, created_at, updated_at, user_id)
SELECT 'property', property_id, content, 'other', created_at, updated_at, user_id
FROM property_notes;

-- Then drop table
DROP TABLE property_notes CASCADE;
```

---

## COMMON PATTERNS

### Timestamp Fields
All tables include:
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Auto-updated via trigger:
```sql
CREATE TRIGGER update_{table}_updated_at BEFORE UPDATE ON {table}
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### User Association
All tables include:
- `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`

Most tables use permissive RLS (all authenticated users can access).

### UUID Primary Keys
All tables use:
- `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`

### Text vs Numeric Storage
**Properties and Leases:**
- User-facing inputs stored as TEXT (e.g., `"purchasePrice"`) to preserve formatting
- Calculation fields use NUMERIC (e.g., `investment_amount`)
- Code parses TEXT → numbers with `stripCommas()` helper

---

## RLS POLICIES

### Policy Types

**1. Permissive (most tables):**
```sql
CREATE POLICY "{table}_select" ON {table}
FOR SELECT TO authenticated USING (true);
```
Used by: brokers, partners, gatekeepers, properties, events, follow_ups, partners_in_deal, property_notes, sync_settings

**2. User-Scoped (notes table):**
```sql
-- View all
CREATE POLICY "Users can view notes" ON notes
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Modify own
CREATE POLICY "Users can update their own notes" ON notes
FOR UPDATE USING (auth.uid() = user_id);
```

**3. Property Ownership-Based (leases table):**
```sql
CREATE POLICY "Users can view leases for their properties" ON leases
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = leases.property_id
    AND properties.user_id = auth.uid()
  )
);
```

### RLS Evolution
- Migration 05: Originally used restrictive policies (user_id = auth.uid())
- Migration 09: Changed to permissive policies (app doesn't set user_id)
- Migration 08: Fixed leases policies (IN → EXISTS for reliability)

---

## INDEXES

### Performance Indexes
All tables have standard indexes on:
- `user_id` - Fast user filtering
- `created_at` - Chronological ordering
- Foreign keys - Join performance

### Specialized Indexes
- **GIN indexes** for JSONB/array columns:
  - `properties."brokerIds"` - Array search
  - `leases.rent_steps` - JSONB queries
- **Partial indexes**:
  - Email fields: `WHERE email IS NOT NULL`
  - Unique constraints: `WHERE partner_id IS NOT NULL`

### Unused Indexes (can be dropped)
- `idx_leases_user_id` - Column removed in migration 07
- `idx_partners_in_deal_user_id` - Not used in queries

---

## MIGRATION HISTORY

1. **01-production-schema.sql** - Base schema (brokers, partners, gatekeepers, properties, events, follow_ups, notes)
2. **03-improve-follow-ups-schema.sql** - Add contact selector fields
3. **04-google-calendar-sync-schema.sql** - Add Google Calendar sync support
4. **05-partner-returns-schema.sql** - Add partner investments and lease terms
5. **06-leases-table.sql** - Create leases table (global)
6. **06-categorized-notes-migration.sql** - Migrate to new notes system (should be renumbered to 11)
7. **07-property-specific-leases.sql** - Make leases property-specific
8. **08-fix-leases-rls-policies.sql** - Fix RLS policies (IN → EXISTS)
9. **09-expand-lease-parameters.sql** - Add CAM, rent escalation, TI/allowances
10. **09-fix-partners-in-deal-rls.sql** - Fix RLS policies (restrictive → permissive) (should be renumbered to 12)
11. **10-flexible-partner-selection.sql** - Allow custom on-the-fly partners

---

## DATA TYPES REFERENCE

### UUID
- All primary keys
- All foreign keys
- Array elements in `properties."brokerIds"`

### TEXT
- User input fields (preserves formatting, commas, etc.)
- Names, addresses, descriptions
- Date fields in legacy schema (ISO strings)

### TIMESTAMPTZ
- All `created_at` and `updated_at` fields
- Google Calendar sync timestamps

### NUMERIC
- Financial calculations: `NUMERIC(15,2)` for dollars
- Percentages: `NUMERIC(5,2)` for rates
- Price per SF: `NUMERIC(10,4)` for precision

### JSONB
- Arrays: `assetClasses`, `customTags`, `photos`
- Structured data: `rent_steps`
- Legacy: `noteHistory`

### BOOLEAN
- Flags: `synced_to_google`, `edited`

### INTEGER
- Counts: `term_years`, `renewal_option_count`

---

## QUERY EXAMPLES

### Get all properties with selected lease details
```sql
SELECT p.*, l.lease_name, l.price_per_sf_month, l.term_years
FROM properties p
LEFT JOIN leases l ON p.selected_lease_id = l.id
WHERE p.user_id = auth.uid()
ORDER BY p.created_at DESC;
```

### Get property with all partner investments
```sql
SELECT p.address,
       pd.investment_amount,
       COALESCE(part.name, pd.partner_name) AS partner_name
FROM properties p
LEFT JOIN partners_in_deal pd ON pd.property_id = p.id
LEFT JOIN partners part ON pd.partner_id = part.id
WHERE p.id = '{property_id}';
```

### Get all notes for a property
```sql
SELECT *
FROM notes
WHERE entity_type = 'property'
  AND entity_id = '{property_id}'
ORDER BY created_at DESC;
```

### Find properties with invalid broker references
```sql
SELECT p.id, p.address, unnest(p."brokerIds") AS broker_id
FROM properties p
WHERE EXISTS (
  SELECT 1
  FROM unnest(p."brokerIds") AS bid
  WHERE NOT EXISTS (SELECT 1 FROM brokers WHERE id = bid)
);
```

---

## NAMING CONVENTIONS

### Current State (INCONSISTENT)
- **camelCase**: Most business logic columns (e.g., `"firmName"`, `"purchasePrice"`)
- **snake_case**: System columns (e.g., `created_at`, `user_id`) and newer tables (e.g., leases, partners_in_deal)

### Recommendation
Standardize to **snake_case** for all columns (PostgreSQL best practice):
- Better SQL interoperability
- No quoting required
- Consistent with system columns

---

**End of Schema Documentation**
