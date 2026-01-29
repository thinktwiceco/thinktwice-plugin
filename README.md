[![Lint and Format](https://github.com/thinktwiceco/thinktwice-plugin/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/thinktwiceco/thinktwice-plugin/actions/workflows/lint-and-format.yml)

# ThinkTwice 🤔

A Chrome browser extension that helps users make more thoughtful purchasing decisions on Amazon by providing behavioral nudges, delayed gratification tools, and purchase alternatives.

## 📑 Table of Contents

- [🎯 Project Idea & Goal](#-project-idea--goal)
- [📊 Project Status](#-project-status)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Local Development Setup](#-local-development-setup)
- [📁 Project Structure](#-project-structure)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🔒 Privacy & Security](#-privacy--security)
- [🔄 CI/CD & Workflows](#-cicd--workflows)
- [📦 Versioning & Release Management](#-versioning--release-management)
- [🤝 Contributing](#-contributing)
- [🗄️ Data Models](#️-data-models)
- [📖 Documentation](#-documentation)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🎯 Project Idea & Goal

**ThinkTwice** intervenes at the moment of purchase to help users pause and reconsider whether they truly need an item. The extension appears on Amazon product pages and presents users with:

- **Behavioral nudges** - Thoughtful prompts to reconsider the purchase
- **"Sleep on it" reminders** - Set timed reminders to reconsider purchases after 24 hours (or custom durations)
- **Alternative considerations** - Explore DIY, refurbished, or rental options
- **Investment opportunities** - Learn about investing the money you save

### Core Philosophy

The extension is designed around behavioral economics principles:

- **Delayed gratification**: Research shows 3 out of 4 people change their mind within 24 hours
- **Conscious consumption**: Make intentional decisions rather than impulse purchases
- **Financial wellness**: Redirect saved money toward long-term goals

---

## 📊 Project Status

### ✅ Implemented Features

#### Core Functionality

- **Product page intervention** - Overlay appears on Amazon product pages with decision options
- **Behavioral nudges** - Random nudges displayed to encourage thoughtful consideration
- **Three decision paths**:
  - "I don't really need it" → Investment options view
  - "Sleep on it" → Reminder system with browser notifications
  - "I need it" → Confirmation and proceed to purchase

#### Sleep On It System (Fully Implemented)

- **Reminder scheduling** with customizable durations:
  - 1 minute (debug/testing)
  - 1 hour, 6 hours, 24 hours
  - 3 days, 1 week
- **Product data extraction** - Automatically captures product name, price, image, and URL
- **Chrome Alarms API integration** - Reliable scheduled notifications
- **Browser notifications** - Alerts when it's time to reconsider
- **Extension badge count** - Shows number of pending due reminders
- **Popup interface** - View all pending reminders with actions:
  - "Still interested" → Opens product page
  - "Not interested" → Dismisses reminder

#### Data Persistence

- **Chrome Storage API integration** - All data stored locally
- **Storage abstraction layer** with TypeScript interfaces
- **Message passing architecture** for content scripts
- **Normalized data structure** - Products stored separately from reminders

### ⚠️ Partially Implemented

- **Investment options flow** - UI exists but handlers are basic (console logs only)
- **Close/dismiss behavior** - Handler exists but needs refinement

### 📋 Planned Features (Not Yet Implemented)

- **Alternative purchase options** - DIY, Refurbished, Rent/Borrow flows
- **Settings page** - Customize notification preferences and reminder durations
- **Statistics dashboard** - Track money saved, purchases avoided
- **Enhanced nudges system** - Context-aware, personalized nudges
- **Multi-marketplace support** - Expand beyond Amazon (eBay, Walmart, etc.)
- **Social features** - Share decisions, group savings challenges

See test flow documentation in `tests/flows/` for detailed user flow testing scenarios.

---

## 🛠️ Technology Stack

- **Framework**: [Plasmo](https://www.plasmo.com/) - Modern Chrome Extension framework
- **UI Library**: React 19 with TypeScript
- **Storage**: Chrome Storage API (local persistence)
- **Notifications**: Chrome Alarms & Notifications APIs
- **Build Tool**: Parcel (via Plasmo)
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier with import sorting

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js**: Version 22.18.0 (exact version specified in `package.json`)
  ```bash
  node --version  # Should output v22.18.0
  ```
- **npm**: Comes with Node.js
- **Google Chrome**: Latest version

### Installation

1. **Clone the repository**

   ```bash
   cd /home/verte/Desktop/Thinktwice/plugin-3
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   This will:
   - Start Plasmo development server
   - Watch for file changes
   - Build extension to `build/chrome-mv3-dev/`
   - Hot reload changes automatically

### Loading Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `build/chrome-mv3-dev/` directory
5. The ThinkTwice extension should now appear in your extensions list

### Development Workflow

1. Make changes to source files (`.tsx`, `.ts`, `.css`)
2. Plasmo will automatically rebuild
3. Reload the extension in Chrome:
   - Click the refresh icon on the extension card in `chrome://extensions/`
   - Or use the keyboard shortcut: `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac) while focused on the extension

### Testing the Extension

1. **Visit an Amazon product page**

   ```
   https://www.amazon.com/dp/B0XXXXXXX
   ```

2. **Test the intervention flow**
   - ThinkTwice overlay should appear
   - Click "Sleep on it" button
   - Select a reminder duration (try "1 minute" for quick testing)
   - Click "Set Reminder"

3. **Test reminder notifications**
   - Wait for the reminder duration to elapse
   - Browser notification should appear
   - Extension badge should show "1"
   - Click extension icon to see reminder in popup

4. **Test reminder actions**
   - "Still interested" → Opens product page
   - "Not interested" → Removes reminder

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build production-ready extension
npm run package          # Package extension for distribution

# Testing
npm run test:e2e         # Run end-to-end tests with Playwright

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

---

## 📁 Project Structure

```
plugin-3/
├── .github/             # GitHub configuration
│   ├── workflows/       # CI/CD workflows
│   │   ├── lint-and-format.yml    # Code quality checks
│   │   ├── update-version.yml     # Release validation
│   │   └── submit.yml             # Chrome Web Store submission
│   └── CODEOWNERS       # Code ownership configuration
├── assets/              # Static assets (icons, images)
│   └── icons/           # Extension icons and UI icons (7 files)
├── components/          # Reusable React components
│   ├── Nudge.tsx        # Behavioral nudge display
│   └── ui/              # UI component library (10 components)
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Header.tsx
│       ├── Loading.tsx
│       ├── Skeleton.tsx
│       └── ... (5 more)
├── contents/            # Content scripts (injected into web pages)
│   └── amazon.tsx       # Main Amazon product page content script
├── docs/                # Documentation (6 files)
│   ├── ARCHITECTURE.md        # System architecture overview
│   ├── VERSIONING-CHEATSHEET.md  # Version management quick reference
│   ├── VERSIONING-WORKFLOW.md    # Release workflow guide
│   ├── chrome-runtime-messages.md  # Message passing documentation
│   ├── sleep-on-it-implementation.md  # Feature implementation details
│   └── desktop-app-integration-plan.md  # Desktop app integration plan
├── hooks/               # Custom React hooks (4 files)
│   ├── useStorage.ts           # Chrome storage reactive hook
│   ├── usePendingReminder.ts   # Reminder state management
│   ├── useProductPageState.ts  # Product page state management
│   └── useGoogleFonts.ts       # Google Fonts loading hook
├── managers/            # Business logic managers (2 files)
│   ├── index.ts                # Manager exports
│   └── ProductActionManager.ts # Product action orchestration
├── scripts/             # Build and utility scripts
│   └── validate-tag.sh  # Git tag validation script
├── services/            # Core services (6 files)
│   ├── AlarmService.ts          # Chrome alarms management
│   ├── BadgeService.ts          # Extension badge updates
│   ├── ChromeMessaging.ts       # Message passing utilities
│   ├── NotificationService.ts   # Browser notifications
│   ├── StorageProxyService.ts   # Storage proxy for content scripts
│   └── TabService.ts            # Tab management operations
├── storage/             # Storage abstraction layer (4 files)
│   ├── IStorage.ts      # Storage interface definition
│   ├── BrowserStorage.ts  # Chrome storage implementation
│   ├── types.ts         # Data models (Product, Reminder, Settings)
│   └── index.ts         # Storage singleton export
├── types/               # TypeScript type definitions
│   └── messages.ts      # Message type definitions
├── utils/               # Utility functions
│   ├── productExtractor.ts  # Extract product data from Amazon DOM
│   └── time.ts              # Time formatting utilities
├── views/               # View components (screen-level, 8 files)
│   ├── ProductView.tsx              # Main decision screen
│   ├── IDontNeedIt.tsx              # Investment options screen
│   ├── SleepOnIt.tsx                # Reminder duration selection
│   ├── INeedIt.tsx                  # Confirmation screen
│   ├── Celebration.tsx              # Success/celebration screen
│   ├── CelebrateThoughtfulPurchase.tsx
│   ├── EarlyReturnFromSleep.tsx     # Early return flow
│   └── BackToAnOldFlame.tsx         # Revisit product flow
├── tests/               # Test files
│   ├── e2e/             # End-to-end tests with Playwright (16 files)
│   │   ├── *.spec.ts    # Test specifications
│   │   ├── fixtures.ts  # Test fixtures
│   │   ├── setup.ts     # Test setup
│   │   ├── page-objects/ # Page object models
│   │   └── utils/       # Test utilities
│   └── flows/           # User flow documentation (4 files)
├── background.ts        # Background service worker (295 lines)
├── popup.tsx            # Extension popup (332 lines)
├── style.css            # Global styles
├── design-system.ts     # Design tokens and theme
├── playwright.config.ts # Playwright test configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .versionrc.json      # Changelog generation config
├── .prettierrc.mjs      # Prettier formatting config
└── eslint.config.mts    # ESLint configuration
```

---

## 🏗️ Architecture Overview

### Data Flow

```
Amazon Product Page
       ↓
  ProductView (Content Script)
       ↓
  User clicks "Sleep on it"
       ↓
  SleepOnIt View (Duration Selection)
       ↓
  productExtractor.ts (Extract product data)
       ↓
  BrowserStorage (Save product + reminder)
       ↓
  Message to Background Service Worker
       ↓
  Chrome Alarms API (Schedule notification)
       ↓
  [Time elapses...]
       ↓
  Alarm fires → Browser Notification
       ↓
  User opens popup → View reminders
       ↓
  User takes action → Update reminder status
```

### Storage Layer

- **Context-aware**: Automatically detects execution context (content script vs popup)
- **Message passing**: Content scripts communicate with background worker for storage operations
- **Normalized data**: Products stored separately from reminders to avoid duplication
- **Type-safe**: Full TypeScript interfaces for all data structures

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## 🔒 Privacy & Security

- **Local storage only** - No data sent to external servers
- **No tracking** - No analytics or telemetry
- **User control** - Users can dismiss reminders and clear data
- **Minimal data collection** - Only stores what's necessary for functionality

---

## 🔄 CI/CD & Workflows

### GitHub Actions Workflows

The project has three automated workflows:

#### 1. **Lint and Format** (`lint-and-format.yml`)

Runs on every push and pull request to `master`:

- ✓ Checks code with ESLint
- ✓ Validates formatting with Prettier
- ✓ Uses Node.js 22.18.0

```bash
# Run locally before committing
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format:check  # Check formatting
npm run format      # Auto-format code
```

#### 2. **Validate Release** (`update-version.yml`)

Runs when a new version tag is pushed (e.g., `v0.0.5`):

- ✓ Verifies tag is on `master` branch
- ✓ Validates tag format (semantic versioning: `vX.Y.Z`)
- ✓ Confirms `package.json` version matches tag version

#### 3. **Submit to Web Store** (`submit.yml`)

Manual workflow for publishing to Chrome Web Store:

- Builds production extension
- Packages as `.zip` file
- Submits to Chrome Web Store using secrets

---

## 📦 Versioning & Release Management

### Version Scheme

This project follows **[Semantic Versioning](https://semver.org/)** (SemVer):

- **MAJOR** version (X.0.0): Breaking changes
- **MINOR** version (0.X.0): New features (backwards compatible)
- **PATCH** version (0.0.X): Bug fixes

Current version: **0.1.0**

### Creating a New Release

The project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated versioning and changelog generation.

#### Quick Release Commands

```bash
# Patch release (0.0.4 → 0.0.5) - Bug fixes only
npm run release:patch

# Minor release (0.0.4 → 0.1.0) - New features
npm run release:minor

# Major release (0.0.4 → 1.0.0) - Breaking changes
npm run release:major

# Auto-detect version bump based on commits
npm run release
```

#### Release Workflow

1. **Make your changes** and commit using [Conventional Commits](#commit-message-convention)
2. **Run release script**:

   ```bash
   npm run release:patch  # or minor/major
   ```

   This will:
   - Bump version in `package.json`
   - Update `CHANGELOG.md` based on commits
   - Create a git commit with message `chore(release): vX.Y.Z`
   - Create a git tag `vX.Y.Z`

3. **Push to GitHub**:

   ```bash
   git push --follow-tags origin master
   ```

4. **GitHub Actions** will validate the release automatically

See [docs/VERSIONING-WORKFLOW.md](./docs/VERSIONING-WORKFLOW.md) for detailed release procedures.

### Commit Message Convention

This project follows **[Conventional Commits](https://www.conventionalcommits.org/)** specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New features → appears in changelog
- `fix`: Bug fixes → appears in changelog
- `docs`: Documentation changes → appears in changelog
- `refactor`: Code refactoring → appears in changelog
- `perf`: Performance improvements → appears in changelog
- `chore`: Maintenance tasks → appears in changelog
- `style`: Formatting, no code change → hidden
- `test`: Test changes → hidden
- `ci`: CI/CD changes → appears in changelog
- `build`: Build system changes → appears in changelog

**Examples:**

```bash
# Feature commit
git commit -m "feat(sleep-on-it): add custom reminder duration input"

# Bug fix commit
git commit -m "fix(notifications): correct badge count calculation"

# Breaking change commit
git commit -m "feat(storage)!: change reminder data model

BREAKING CHANGE: Reminder schema now requires productId field"
```

Changelog configuration is in [.versionrc.json](./.versionrc.json).

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** following the code style

3. **Test your changes**:

   ```bash
   npm run dev  # Start dev server
   # Load extension in Chrome and test manually
   ```

4. **Lint and format**:

   ```bash
   npm run lint:fix
   npm run format
   ```

5. **Commit using Conventional Commits**:

   ```bash
   git commit -m "feat(scope): description"
   ```

6. **Push and create Pull Request**

### Code Quality Standards

- **TypeScript**: All code must be typed (no `any` unless absolutely necessary)
- **ESLint**: Must pass `npm run lint` with no errors
- **Prettier**: Code must be formatted (run `npm run format`)
- **React Best Practices**: Use hooks, functional components, proper prop types

### Testing Checklist

Before submitting a PR, test:

- ✓ Extension loads without errors
- ✓ Product page overlay appears on Amazon
- ✓ All three decision flows work (I don't need it, Sleep on it, I need it)
- ✓ Reminders save and alarms fire correctly
- ✓ Notifications appear at scheduled times
- ✓ Extension popup displays reminders properly
- ✓ No console errors in any context (content script, background, popup)

### Automated Testing

This project uses **Playwright** for end-to-end testing:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/sleeponit.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

**Test Coverage:**

- Close flow (closing overlay)
- "I don't need it" flow
- "I need it" flow
- "Sleep on it" flow with reminders
- Extension initialization
- Storage operations
- Product extraction

See automated E2E tests in `tests/e2e/` and flow documentation in `tests/flows/` for comprehensive testing procedures.

---

## 🗄️ Data Models

### Product

```typescript
enum ProductState {
  SLEEPING_ON_IT = "sleepingOnIt"
  I_NEED_THIS = "iNeedThis"
  DONT_NEED_IT = "dontNeedIt"
}

{
  id: string // Amazon product ID (e.g., "B0XXXXXXX")
  name: string // Product title
  price: string | null // Price string (e.g., "$99.99")
  image: string | null // Product image URL
  url: string // Full Amazon product URL
  timestamp: number // When saved (Date.now())
  marketplace: string // Marketplace identifier (e.g., "amazon.com")
  state?: ProductState | null // Product decision state
}
```

### Reminder

```typescript
{
  id: string // UUID for reminder
  productId: string // References Product.id
  reminderTime: number // When to remind (Date.now() + duration)
  duration: number // Duration in milliseconds
  status: "pending" | "completed" | "dismissed"
}
```

### Settings

```typescript
{
  reminderDurations: number[]  // Available duration options in ms
  defaultDuration: number      // Default selected duration in ms
}
```

### StorageData

```typescript
{
  reminders: Reminder[]  // Array of all reminders
  products: { [productId: string]: Product }  // Product map by ID
  settings: Settings  // User settings
}
```

### TabSessionState

```typescript
{
  tabId: number | null  // Current tab ID
  justCreatedReminderId?: string | null  // Recently created reminder ID
}
```

---

## 📖 Documentation

### Core Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture, data flow, and storage layer design
- **[VERSIONING-WORKFLOW.md](./docs/VERSIONING-WORKFLOW.md)** - Release workflow and version management guide
- **[VERSIONING-CHEATSHEET.md](./docs/VERSIONING-CHEATSHEET.md)** - Quick reference for versioning commands
- **[chrome-runtime-messages.md](./docs/chrome-runtime-messages.md)** - Message passing architecture documentation
- **[sleep-on-it-implementation.md](./docs/sleep-on-it-implementation.md)** - Detailed "Sleep on it" feature implementation
- **[desktop-app-integration-plan.md](./docs/desktop-app-integration-plan.md)** - Desktop app integration with Agent Forge backend

### Quick Links

- **Installation**: See [Local Development Setup](#-local-development-setup)
- **Testing**: See [Testing the Extension](#testing-the-extension) and `tests/e2e/` for automated tests
- **Architecture**: See [Architecture Overview](#️-architecture-overview) and [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Release**: See [Versioning & Release Management](#-versioning--release-management)
- **Contributing**: See [Contributing](#-contributing)

---

## 🛠️ Troubleshooting

### Common Issues

**Extension doesn't load:**

- Ensure Node.js version is exactly 22.18.0
- Delete `node_modules` and `build` directories, reinstall: `npm install`
- Check for errors in `chrome://extensions/` console

**Overlay doesn't appear on Amazon:**

- Verify you're on a product page (URL contains `/dp/` or `/gp/product/`)
- Check content script console in DevTools (F12)
- Ensure extension permissions are granted

**Reminders don't trigger:**

- Check background service worker console for alarm events
- Verify browser notifications are enabled
- Ensure Chrome is running (service worker may sleep but will wake for alarms)

**Build fails:**

- Ensure you're using exact Node.js version: `nvm use 22.18.0`
- Clear Plasmo cache: `rm -rf .plasmo`
- Reinstall dependencies: `npm ci`

---

## 🙏 Acknowledgments

Built with [Plasmo](https://www.plasmo.com/) - The browser extension framework

---

## 📄 License

Copyright © 2025 Thinktwiceco

---

**Last Updated**: January 28, 2026
