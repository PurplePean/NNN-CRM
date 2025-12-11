-- Rename columns in brokers table
ALTER TABLE brokers RENAME COLUMN "firmName" TO firm_name;
ALTER TABLE brokers RENAME COLUMN "firmWebsite" TO firm_website;
ALTER TABLE brokers RENAME COLUMN "crexiLink" TO crexi_link;
ALTER TABLE brokers RENAME COLUMN "licenseNumber" TO license_number;
ALTER TABLE brokers RENAME COLUMN "noteHistory" TO note_history;

-- Rename columns in partners table
ALTER TABLE partners RENAME COLUMN "entityName" TO entity_name;
ALTER TABLE partners RENAME COLUMN "checkSize" TO check_size;
ALTER TABLE partners RENAME COLUMN "assetClasses" TO asset_classes;
ALTER TABLE partners RENAME COLUMN "creExperience" TO cre_experience;
ALTER TABLE partners RENAME COLUMN "riskTolerance" TO risk_tolerance;
ALTER TABLE partners RENAME COLUMN "customTags" TO custom_tags;
ALTER TABLE partners RENAME COLUMN "commitmentAmount" TO commitment_amount;
ALTER TABLE partners RENAME COLUMN "assetClass" TO asset_class;
ALTER TABLE partners RENAME COLUMN "noteHistory" TO note_history;

-- Rename columns in gatekeepers table
ALTER TABLE gatekeepers RENAME COLUMN "relatedTo" TO related_to;

-- Rename columns in properties table
ALTER TABLE properties RENAME COLUMN "squareFeet" TO square_feet;
ALTER TABLE properties RENAME COLUMN "monthlyBaseRentPerSqft" TO monthly_base_rent_per_sqft;
ALTER TABLE properties RENAME COLUMN "purchasePrice" TO purchase_price;
ALTER TABLE properties RENAME COLUMN "closingCosts" TO closing_costs;
ALTER TABLE properties RENAME COLUMN "ltvPercent" TO ltv_percent;
ALTER TABLE properties RENAME COLUMN "interestRate" TO interest_rate;
ALTER TABLE properties RENAME COLUMN "loanTerm" TO loan_term;
ALTER TABLE properties RENAME COLUMN "debtServiceType" TO debt_service_type;
ALTER TABLE properties RENAME COLUMN "exitCapRate" TO exit_cap_rate;
ALTER TABLE properties RENAME COLUMN "holdingPeriodMonths" TO holding_period_months;
ALTER TABLE properties RENAME COLUMN "brokerIds" TO broker_ids;
ALTER TABLE properties RENAME COLUMN "noteHistory" TO note_history;

-- Rename columns in events table
ALTER TABLE events RENAME COLUMN "createdAt" TO legacy_created_at;

-- Rename columns in follow_ups table
ALTER TABLE follow_ups RENAME COLUMN "contactName" TO contact_name;
ALTER TABLE follow_ups RENAME COLUMN "dueDate" TO due_date;
ALTER TABLE follow_ups RENAME COLUMN "createdAt" TO legacy_created_at;

-- Rename columns in notes table
ALTER TABLE notes RENAME COLUMN "entityType" TO entity_type;
ALTER TABLE notes RENAME COLUMN "entityId" TO entity_id;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
