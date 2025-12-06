-- Migration: Expand Lease Parameters
-- Description: Add CAM charges, rent increases, TI, and allowance fields to leases table
-- Date: 2025-12-03

-- Add CAM (Common Area Maintenance) fields
ALTER TABLE leases
ADD COLUMN IF NOT EXISTS cam_amount NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS cam_type TEXT CHECK (cam_type IN ('per_month', 'per_year', 'total_annual')),
ADD CONSTRAINT cam_amount_check CHECK (
  (cam_amount IS NULL AND cam_type IS NULL) OR
  (cam_amount IS NOT NULL AND cam_type IS NOT NULL)
);

-- Add Rent Increase Structure fields
ALTER TABLE leases
ADD COLUMN IF NOT EXISTS rent_increase_type TEXT CHECK (rent_increase_type IN ('flat_annual', 'stepped', 'stepped_monthly', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS flat_annual_increase_percent NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rent_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS base_annual_escalation_percent NUMERIC(5,2) DEFAULT 0;

-- Add Tenant Improvement and Allowance fields
ALTER TABLE leases
ADD COLUMN IF NOT EXISTS tenant_improvement_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS tenant_allowance_amount NUMERIC(12,2);

-- Create indexes for JSON queries on rent_steps
CREATE INDEX IF NOT EXISTS idx_leases_rent_steps ON leases USING GIN (rent_steps);

-- Add comments for documentation
COMMENT ON COLUMN leases.cam_amount IS 'CAM charge amount (per SF/Month, per SF/Year, or Total Annual based on cam_type)';
COMMENT ON COLUMN leases.cam_type IS 'CAM calculation type: per_month, per_year, or total_annual';
COMMENT ON COLUMN leases.rent_increase_type IS 'Type of rent increase: flat_annual, stepped, stepped_monthly, or none';
COMMENT ON COLUMN leases.flat_annual_increase_percent IS 'Annual rent increase percentage (if flat_annual type)';
COMMENT ON COLUMN leases.rent_steps IS 'Array of rent step increases (year or month based depending on rent_increase_type)';
COMMENT ON COLUMN leases.base_annual_escalation_percent IS 'Base annual escalation percentage applied between stepped increases';
COMMENT ON COLUMN leases.tenant_improvement_amount IS 'Tenant improvement (TI) amount - one-time landlord cost upfront';
COMMENT ON COLUMN leases.tenant_allowance_amount IS 'Tenant allowance amount';

-- Example rent_steps structure for year-based steps (rent_increase_type = 'stepped'):
-- [
--   {"trigger_year": 2, "increase_percent": 10},
--   {"trigger_year": 4, "increase_percent": 20},
--   {"trigger_year": 6, "increase_percent": 5}
-- ]

-- Example rent_steps structure for month-based steps (rent_increase_type = 'stepped_monthly'):
-- [
--   {"month": 1, "price_per_sf": 1.00},
--   {"month": 7, "price_per_sf": 1.50},
--   {"month": 13, "price_per_sf": 1.75}
-- ]
