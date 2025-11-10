# NNN CRM Roadmap

This document tracks planned iterations, feature backlog, and priorities.

## Current Status

**Version**: 1.0
**Current Iteration**: Iteration 2 - Local Development Setup (In Progress)
**Last Updated**: 2025-11-10

## Completed Iterations

### ✅ Iteration 1: V1 Release
**Status**: Shipped
**Outcome**: Production CRM with full property/broker management and underwriting

**Features Delivered**:
- Property CRUD operations
- Broker CRUD operations
- Financial calculations (DSCR, Cap Rate, Cash-on-Cash, Equity Multiple)
- Dark mode
- localStorage persistence
- Responsive design
- Netlify deployment

### ✅ Iteration 2: Local Development Setup
**Status**: In Progress → Merge to complete
**Theme**: Infrastructure
**Branch**: `claude/iteration-and-upgrades-011CUy1TVMDEg7xkYgyYQwF2`

**Goals**:
- ✅ Remove Netlify deployment configuration
- ✅ Configure VS Code for optimal React development
- ✅ Create workflow and iteration documentation

**Outcome**: Clean local development environment with clear processes for future work.

---

## Planned Iterations

### Iteration 3: Component Decomposition (Phase 1)
**Priority**: 🔴 High
**Effort**: 1-2 weeks
**Theme**: Refactoring
**Goal**: Break down monolithic 1,039-line App.jsx into modular components

**Why**: Current single-file component is difficult to maintain, test, and reason about.

**Tasks**:
- Create `src/components` folder structure
- Extract `PropertyCard` component
- Extract `BrokerCard` component
- Extract `FormInput` component (reusable)
- Extract `Modal` component (reusable)
- Extract `MetricsDisplay` component
- Reduce App.jsx to <600 lines

**Success Criteria**:
- All functionality works identically
- Dark mode still works
- App.jsx is under 600 lines
- Components are reusable

---

### Iteration 4: Extract Business Logic
**Priority**: 🔴 High
**Effort**: 3-5 days
**Theme**: Refactoring
**Goal**: Separate business logic from UI components

**Why**: Business logic mixed with UI makes testing and reuse difficult.

**Tasks**:
- Create `src/utils/financialCalculations.js`
- Move all calculation functions to utils
- Create `src/utils/formatters.js`
- Move all formatting functions to utils
- Create `src/utils/validators.js`
- Add JSDoc documentation to all utility functions
- Update components to use utilities

**Success Criteria**:
- All calculations extracted and documented
- Can import calculations in tests (future)
- No business logic in JSX

---

### Iteration 5: Custom Hooks
**Priority**: 🟡 Medium
**Effort**: 3-5 days
**Theme**: Refactoring
**Goal**: Create custom hooks for state management

**Why**: Reduce duplication and make state logic reusable.

**Tasks**:
- Create `src/hooks` folder
- Extract `useProperties` hook (CRUD operations)
- Extract `useBrokers` hook (CRUD operations)
- Extract `useTheme` hook (dark mode + classes)
- Extract `useForm` hook (form state management)
- Extract `useLocalStorage` hook (reusable storage)
- Update App.jsx to use hooks

**Success Criteria**:
- App.jsx state management is clean and minimal
- Hooks are reusable
- localStorage logic is centralized

---

### Iteration 6: Component Decomposition (Phase 2)
**Priority**: 🟡 Medium
**Effort**: 3-5 days
**Theme**: Refactoring
**Goal**: Complete component extraction

**Why**: Further reduce App.jsx complexity.

**Tasks**:
- Extract `PropertyForm` component
- Extract `BrokerForm` component
- Extract `PropertyList` component
- Extract `BrokerList` component
- Extract `SearchBar` component
- Extract `Header` component
- Reduce App.jsx to <300 lines

**Success Criteria**:
- App.jsx is primarily a container/orchestrator
- Each component has single responsibility
- All components under 200 lines each

---

### Iteration 7: Input Validation & Error Handling
**Priority**: 🟡 Medium
**Effort**: 2-3 days
**Theme**: Quality
**Goal**: Add comprehensive validation and error handling

**Why**: Currently minimal validation; invalid inputs can break calculations.

**Tasks**:
- Create validation schema (consider Zod)
- Add number range validation (no negatives)
- Add interest rate bounds (0-30%)
- Add LTV bounds (0-100%)
- Add required field validation
- Implement error boundaries
- Replace `alert()` with better UI
- Add form validation feedback

**Success Criteria**:
- Invalid inputs are prevented or clearly marked
- App doesn't crash on bad data
- User-friendly error messages

---

### Iteration 8: Performance Optimization
**Priority**: 🟢 Low
**Effort**: 2-3 days
**Theme**: Optimization
**Goal**: Improve render performance

**Why**: Calculations run on every render; will be slow with many properties.

**Tasks**:
- Add `React.memo` to card components
- Add `useMemo` for expensive calculations
- Add `useCallback` for event handlers
- Measure performance with React DevTools
- Consider virtualization for property lists (if >100 items)

**Success Criteria**:
- Smooth performance with 100+ properties
- Reduced unnecessary re-renders
- Faster calculation times

---

### Iteration 9: TypeScript Migration
**Priority**: 🟢 Low-Medium
**Effort**: 1-2 weeks
**Theme**: Quality
**Goal**: Add TypeScript for type safety

**Why**: Prevent runtime errors, improve IDE experience, self-documenting code.

**Tasks**:
- Install TypeScript dependencies
- Configure tsconfig.json
- Rename .jsx files to .tsx
- Create type definitions for data models
- Create interface for Property
- Create interface for Broker
- Create interface for Metrics
- Fix all type errors
- Update build process

**Success Criteria**:
- Full TypeScript compilation with no errors
- All data models typed
- Better autocomplete in VS Code

---

### Iteration 10: Testing Infrastructure
**Priority**: 🟡 Medium
**Effort**: 1 week
**Theme**: Quality
**Goal**: Add testing framework and core tests

**Why**: No tests currently; refactoring is risky without tests.

**Tasks**:
- Set up Jest + React Testing Library
- Write tests for financial calculations (100% coverage)
- Write tests for formatters
- Write tests for validators
- Write component tests for PropertyCard
- Write component tests for BrokerCard
- Set up test coverage reporting
- Document testing approach

**Success Criteria**:
- 100% coverage for utilities
- 80%+ coverage for components
- Tests run in CI (GitHub Actions - future)

---

## Feature Backlog

These are potential features, not yet scheduled for specific iterations.

### Data Management

#### CSV Export
**Effort**: 2-3 days
**Value**: High

Export properties and brokers to CSV for backup/analysis.

**Tasks**:
- Install papaparse or similar
- Create export utility
- Add export button to UI
- Include all calculated metrics
- Handle broker relationships

---

#### CSV Import
**Effort**: 3-5 days
**Value**: Medium

Import properties from CSV for bulk data entry.

**Tasks**:
- Create import utility
- Add validation for imported data
- Map CSV columns to fields
- Handle broker matching
- Preview before import
- Add import button to UI

---

#### Backup/Restore
**Effort**: 1-2 days
**Value**: Medium

Export/import all data (properties + brokers) for backup.

**Tasks**:
- Create backup JSON format
- Add version information
- Create restore function
- Add UI buttons
- Handle migration if schema changes

---

### Underwriting Features

#### Scenario Comparison
**Effort**: 5-7 days
**Value**: High

Compare multiple scenarios for same property side-by-side.

**Tasks**:
- Design comparison UI
- Create scenario data structure
- Allow multiple scenarios per property
- Show differences highlighted
- Export comparison report

---

#### Sensitivity Analysis
**Effort**: 3-5 days
**Value**: Medium

"What-if" analysis: see how metrics change with different inputs.

**Tasks**:
- Create slider UI for key inputs
- Show real-time metric updates
- Chart/graph for visualizations
- Save sensitivity scenarios

---

#### Investment Waterfall
**Effort**: 5-7 days
**Value**: Medium

Show investor return waterfall (preferred return, profit splits).

**Tasks**:
- Design waterfall model
- Add waterfall inputs to property
- Calculate distribution tiers
- Display waterfall breakdown
- Support multiple investor structures

---

#### Historical Tracking
**Effort**: 3-5 days
**Value**: Low

Track property value changes over time.

**Tasks**:
- Add history data structure
- Store snapshots on property update
- Display history timeline
- Chart value changes
- Compare metrics over time

---

### Broker Features

#### Broker Performance Metrics
**Effort**: 2-3 days
**Value**: Medium

Show analytics for broker activity.

**Tasks**:
- Calculate deals per broker
- Calculate total volume per broker
- Show broker leaderboard
- Average deal size
- Filter properties by broker

---

#### Commission Calculator
**Effort**: 1-2 days
**Value**: Low

Calculate broker commission based on deal.

**Tasks**:
- Add commission rate to broker
- Calculate commission on property
- Show commission in property view
- Total commissions report

---

### UX Improvements

#### Property Templates
**Effort**: 2-3 days
**Value**: Medium

Save property as template for faster data entry.

**Tasks**:
- Add "Save as template" button
- Store templates in localStorage
- Add template selector in property form
- Pre-fill form with template data
- Manage (edit/delete) templates

---

#### Bulk Operations
**Effort**: 3-5 days
**Value**: Low

Perform actions on multiple properties at once.

**Tasks**:
- Add checkbox to property cards
- Multi-select UI
- Bulk delete
- Bulk broker assignment
- Bulk export

---

#### Advanced Search & Filters
**Effort**: 2-3 days
**Value**: Medium

Filter properties by multiple criteria.

**Tasks**:
- Filter by price range
- Filter by cap rate range
- Filter by broker
- Filter by DSCR
- Save filter presets
- Sort by any metric

---

#### Pagination
**Effort**: 1-2 days
**Value**: Low (not needed until 100+ properties)

Paginate property list for performance.

**Tasks**:
- Add pagination UI
- Limit properties per page
- Add page navigation
- Preserve filters across pages

---

### Quality & Polish

#### Accessibility Audit
**Effort**: 3-5 days
**Value**: Medium

Ensure app is accessible (WCAG 2.1 AA).

**Tasks**:
- Add ARIA labels
- Improve keyboard navigation
- Test with screen reader
- Fix color contrast issues
- Add focus indicators
- Semantic HTML review

---

#### Enhanced Documentation
**Effort**: 2-3 days
**Value**: Medium

Comprehensive code documentation.

**Tasks**:
- Add JSDoc to all functions
- Create architecture documentation
- Document calculation formulas
- Add inline code comments
- Create developer guide

---

#### Code Linting & Formatting
**Effort**: 1 day
**Value**: High

Consistent code style enforcement.

**Tasks**:
- Configure ESLint rules
- Add Prettier config
- Set up pre-commit hooks
- Fix all linting errors
- Document code style

---

## Prioritization Framework

### Priority Levels

🔴 **High** - Critical for maintainability or high user value
🟡 **Medium** - Important but not urgent
🟢 **Low** - Nice to have

### Decision Criteria

When choosing next iteration, consider:

1. **Value** - How much does this improve the product?
2. **Effort** - How long will it take?
3. **Risk** - What's the complexity/unknowns?
4. **Dependencies** - What must be done first?

**Formula**: Priority = Value / (Effort × Risk)

### Current Recommendation

**Next 3 iterations** (in order):

1. **Iteration 3**: Component Decomposition Phase 1
   - Highest value for maintainability
   - Makes all future work easier

2. **Iteration 4**: Extract Business Logic
   - Critical for testing
   - Dependency for TypeScript

3. **Iteration 5**: Custom Hooks
   - Completes refactoring foundation
   - Enables cleaner feature additions

After completing the refactoring foundation (Iterations 3-5), you can:
- Add features faster
- Test more easily
- Onboard developers more quickly
- Scale the codebase

---

## Version Planning

### V1.0 ✅ (Current)
- Core CRM functionality
- Basic underwriting

### V1.1 (After Iteration 6)
- Component-based architecture
- Custom hooks
- Separated business logic
- Much easier to maintain

### V1.2 (After Iteration 10)
- TypeScript
- Testing infrastructure
- Production-ready quality

### V2.0 (Future)
- Advanced features (CSV, scenarios, etc.)
- Backend integration (if needed)
- Multi-user support (if needed)

---

## How to Use This Roadmap

### Weekly Review

Every week:
1. Review current iteration progress
2. Update completion status
3. Adjust estimates if needed
4. Plan next iteration

### Monthly Planning

Every month:
1. Look ahead 2-3 iterations
2. Adjust priorities based on needs
3. Add/remove backlog items
4. Update version targets

### Living Document

This roadmap should evolve:
- Priorities change
- New needs emerge
- Learnings from iterations
- Technology changes

**Rule**: Update this doc at the end of every iteration.

---

## Notes

### Technical Debt
Current technical debt score: **Medium-High**

**Main issues**:
- Monolithic component (1,039 lines)
- No tests
- Mixed business/UI logic
- No TypeScript

**Plan**: Address in Iterations 3-10

### Dependencies
Current dependencies are minimal and healthy. No urgent updates needed.

### Performance
Performance is good for current scale (<50 properties). Will need optimization around 100+ properties.

---

**Last Updated**: 2025-11-10
**Next Review**: After Iteration 2 completion
