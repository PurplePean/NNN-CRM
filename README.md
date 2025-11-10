# NNN CRM - Industrial Property Underwriting

Professional CRM and underwriting tool for NNN (Triple Net) industrial properties.

## Features

### Property Management
- Complete property tracking with address and Crexi integration
- Square footage and rent calculations
- Search by address or Crexi link
- Dark mode with persistent storage

### Advanced Underwriting
- **LTV-based financing** - automatic loan amount calculation
- **All-in cost analysis** - Purchase Price + Improvements + Closing Costs
- **Debt service options** - Standard Amortization vs Interest-Only
- **Operating metrics** - Cap Rate, DSCR, Cash-on-Cash returns
- **Exit analysis** - Equity multiples, remaining loan balance, net proceeds

### Broker Management
- Track broker information (Name, Email, Phone)
- Firm details (Firm Name, Website, Crexi Profile, License #)
- Multi-select brokers per property
- Inline quick-add broker form
- Broker badges on property cards

### User Experience
- Number formatting with commas (1,000,000)
- Real-time calculations
- Responsive design
- Dark mode toggle
- localStorage persistence

## Tech Stack
- React 18
- Tailwind CSS
- localStorage for data persistence

## Local Development

### Prerequisites
- Node.js 18 or higher
- VS Code (recommended)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd NNN-CRM
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

### VS Code Setup

This project includes VS Code configuration for optimal development experience:

**Recommended Extensions** (auto-prompted on first open):
- ESLint - Code linting
- Prettier - Code formatting
- ES7+ React Snippets - React code snippets
- Tailwind CSS IntelliSense - Tailwind class autocomplete
- Auto Rename Tag - Auto-rename paired HTML/JSX tags
- Path Intellisense - Autocomplete file paths
- Import Cost - Display import sizes inline

**Editor Features**:
- Auto-format on save
- ESLint auto-fix on save
- Tailwind CSS autocomplete
- Emmet for JSX

### Available Scripts

```bash
npm start      # Start development server (http://localhost:3000)
npm run build  # Build production bundle
npm test       # Run tests
```

### Development Workflow

1. Make your changes in VS Code
2. Save files (auto-formatting will apply)
3. Preview changes in browser (auto-refreshes)
4. Commit your changes with descriptive messages

## Project Documentation

This project uses a simple, automated workflow:

- **[SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md)** - ⭐ **START HERE** - Simple commands, Claude handles git
- **[ROADMAP.md](./ROADMAP.md)** - What to work on next, feature backlog, priorities
- **[ITERATIONS.md](./ITERATIONS.md)** - How iterations work (reference only)
- **[WORKFLOW.md](./WORKFLOW.md)** - Detailed git workflow (reference only)

### Quick Start

**Want to work on something?** Just tell Claude:
- "I want to start working on [feature name]"
- "Save my work"
- "I'm done with this feature, merge it"

That's it! Claude handles all the git complexity. See [SIMPLE-WORKFLOW.md](./SIMPLE-WORKFLOW.md) for all commands.

**Need ideas?** Check [ROADMAP.md](./ROADMAP.md) to see what's next.

## Contributing

1. Tell Claude what you want to work on
2. Code in VS Code (files auto-format on save)
3. Test in browser (auto-refreshes)
4. Tell Claude "Save my work" regularly
5. Tell Claude "I'm done, merge it" when complete

No git knowledge required!

## Version
V1.0 - Initial Release
