# ThinkTwice 🤔

A Chrome browser extension that helps users make more thoughtful purchasing decisions on Amazon by providing behavioral nudges, delayed gratification tools, and purchase alternatives.

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

See [docs/user-flows.md](./docs/user-flows.md) for detailed feature roadmap.

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
├── assets/              # Static assets (icons, images)
│   └── icons/           # Extension icons and UI icons
├── components/          # Reusable React components
│   ├── Nudge.tsx        # Behavioral nudge display
│   └── ui/              # UI component library
├── contents/            # Content scripts (injected into web pages)
│   └── amazon.tsx       # Main Amazon product page content script
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # System architecture overview
│   ├── sleep-on-it-implementation.md  # Feature implementation details
│   └── user-flows.md    # User flows and feature roadmap
├── hooks/               # Custom React hooks
│   ├── useStorage.ts    # Chrome storage hook
│   └── usePendingReminder.ts  # Reminder state management
├── storage/             # Storage abstraction layer
│   ├── IStorage.ts      # Storage interface
│   ├── BrowserStorage.ts  # Chrome storage implementation
│   ├── types.ts         # Data models
│   └── index.ts         # Storage singleton export
├── utils/               # Utility functions
│   └── productExtractor.ts  # Extract product data from Amazon DOM
├── views/               # View components (screen-level)
│   ├── ProductView.tsx  # Main decision screen
│   ├── IDontNeedIt.tsx  # Investment options screen
│   ├── SleepOnIt.tsx    # Reminder duration selection
│   ├── INeedIt.tsx      # Confirmation screen
│   └── Celebration.tsx  # Success/celebration screen
├── background.ts        # Background service worker
├── popup.tsx            # Extension popup (click icon)
├── style.css            # Global styles
├── design-system.ts     # Design tokens and theme
└── package.json         # Dependencies and scripts
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

## 🗄️ Data Models

### Product
```typescript
{
  id: string           // Amazon product ID (e.g., "B0XXXXXXX")
  name: string         // Product title
  price: string | null // Price string (e.g., "$99.99")
  image: string | null // Product image URL
  url: string          // Full Amazon product URL
  timestamp: number    // When saved (Date.now())
}
```

### Reminder
```typescript
{
  id: string           // UUID for reminder
  productId: string    // References Product.id
  reminderTime: number // When to remind (Date.now() + duration)
  duration: number     // Duration in milliseconds
  status: "pending" | "completed" | "dismissed"
}
```

---

## 🔒 Privacy & Security

- **Local storage only** - No data sent to external servers
- **No tracking** - No analytics or telemetry
- **User control** - Users can dismiss reminders and clear data
- **Minimal data collection** - Only stores what's necessary for functionality
- **No affiliate links** - No commercial relationships with retailers

---

## 🤝 Contributing

### Code Quality Standards

- **TypeScript**: All code must be properly typed
- **ESLint**: Code must pass linting (`npm run lint`)
- **Prettier**: Code must be formatted (`npm run format`)
- **React best practices**: Use functional components and hooks

### Making Changes

1. Create a new branch from `master`
2. Make your changes
3. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   ```
4. Test the extension thoroughly
5. Commit with clear commit messages
6. Push and create a pull request

---

## 📖 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and data flow
- **[sleep-on-it-implementation.md](./docs/sleep-on-it-implementation.md)** - Implementation details
- **[user-flows.md](./docs/user-flows.md)** - User flows and feature roadmap

---

## 🐛 Known Issues

- Investment option handlers are not yet fully implemented (basic console logging only)
- Alternative purchase options (DIY, Refurbished, Rent/Borrow) UI components exist but are not integrated
- Close button behavior could be more sophisticated

---

## 🚦 Roadmap

### Phase 1: Core Functionality Enhancement
- [ ] Implement investment options integration
- [ ] Add alternative purchase options flow (DIY, Refurbished, Rent/Borrow)
- [ ] Enhance close/dismiss behavior

### Phase 2: User Retention
- [ ] Settings page for customization
- [ ] Statistics dashboard (money saved, purchases avoided)
- [ ] Enhanced context-aware nudges

### Phase 3: Expansion
- [ ] Multi-marketplace support (eBay, Walmart, Target)
- [ ] Product price history integration
- [ ] Social features and savings challenges

See [docs/user-flows.md](./docs/user-flows.md) for complete feature roadmap.

---

## 📝 License

[Add license information]

---

## 👥 Authors

[Add author information]

---

## 🙏 Acknowledgments

Built with [Plasmo](https://www.plasmo.com/) - The browser extension framework

---

**Last Updated**: November 2, 2025
