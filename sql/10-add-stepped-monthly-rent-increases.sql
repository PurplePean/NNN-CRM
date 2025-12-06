-- Migration: Add Stepped Monthly Rent Increases
-- Description: Update rent_increase_type to support stepped_monthly option
-- Date: 2025-12-06

-- Drop the old constraint
ALTER TABLE leases
DROP CONSTRAINT IF EXISTS leases_rent_increase_type_check;

-- Add the new constraint with stepped_monthly option
ALTER TABLE leases
ADD CONSTRAINT leases_rent_increase_type_check
CHECK (rent_increase_type IN ('flat_annual', 'stepped', 'stepped_monthly', 'none'));

-- Update the comment to reflect the new option
COMMENT ON COLUMN leases.rent_increase_type IS 'Type of rent increase: flat_annual, stepped (year-based), stepped_monthly (month-based), or none';

-- Update the comment on rent_steps to clarify the two formats
COMMENT ON COLUMN leases.rent_steps IS 'Array of rent step increases. Format depends on rent_increase_type:
- stepped: [{"trigger_year": 2, "increase_percent": 10}, ...]
- stepped_monthly: [{"month": 1, "price_per_sf": 1.00}, {"month": 7, "price_per_sf": 1.50}, ...]';
