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

This project uses a structured workflow for easy iteration and maintenance:

- **[WORKFLOW.md](./WORKFLOW.md)** - Branch strategy, git workflow, and daily development process
- **[ITERATIONS.md](./ITERATIONS.md)** - How to plan and execute iterations
- **[ROADMAP.md](./ROADMAP.md)** - Feature backlog, priorities, and iteration status

**New to the project?** Start with [WORKFLOW.md](./WORKFLOW.md)

**Planning work?** Check [ROADMAP.md](./ROADMAP.md) for priorities

**Starting an iteration?** Follow the guide in [ITERATIONS.md](./ITERATIONS.md)

## Contributing

1. Read [WORKFLOW.md](./WORKFLOW.md) for git and development practices
2. Check [ROADMAP.md](./ROADMAP.md) for current priorities
3. Create a feature branch from `main`
4. Make your changes with frequent commits
5. Open a pull request (template auto-populates)
6. Merge to `main` when approved

## Version
V1.0 - Initial Release
