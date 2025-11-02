# Sleep On It - Architecture Overview

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Amazon Product Page                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  ProductView.tsx                      │  │
│  │  [I don't need it] [Sleep on it] [I need it]        │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │ User clicks "Sleep on it"            │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  SleepOnIt.tsx                        │  │
│  │  • Select duration (1min, 1h, 6h, 24h, 3d, 1w)      │  │
│  │  • Click "Set Reminder"                              │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                       │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          productExtractor.ts                          │  │
│  │  • Extract product name from DOM                     │  │
│  │  • Extract price from DOM                            │  │
│  │  • Extract image URL from DOM                        │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                       │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              storage (BrowserStorage)                 │  │
│  │  • saveProduct(product)                              │  │
│  │  • saveReminder(reminder)                            │  │
│  │  • Send CREATE_ALARM message to background          │  │
│  └─────────────┬─────────────────────────────────────────┘  │
│                │                                             │
│                │ Message passing                             │
│                ▼                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          background.ts (Service Worker)               │  │
│  │  • Create Chrome alarm for reminder                  │  │
│  │  • Store data in chrome.storage.local                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                              │
                              │ Data & Alarm stored
                              ▼

                ┌────────────────────────────┐
                │   Chrome Storage (Local)   │
                │                            │
                │  thinktwice_products: {}   │
                │  thinktwice_reminders: []  │
                │  thinktwice_settings: {}   │
                │                            │
                │   Chrome Alarms API        │
                │  reminder_{id}: alarm      │
                └────────────────────────────┘

                              │
                              │ When reminder time arrives
                              ▼

                ┌────────────────────────────┐
                │  Background Service Worker │
                │                            │
                │  • Alarm fires             │
                │  • Fetch reminder/product  │
                │  • Create notification     │
                │  • Update badge count      │
                └────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────┐
│                  Browser Notification                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Time to Reconsider?                                 │  │
│  │  [Product Image]                                     │  │
│  │  Product Name                                        │  │
│  │  Price: $XX.XX                                       │  │
│  │  [View Product] [Not Interested]                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  🔴 Extension icon shows badge count (e.g., "1")            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                              │
                              │ User opens popup
                              ▼

┌─────────────────────────────────────────────────────────────┐
│                      Extension Popup                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    popup.tsx                          │  │
│  │  • Uses useStorage() hook                            │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                       │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  useStorage.ts                        │  │
│  │  • getReminders()                                    │  │
│  │  • getProduct(productId)                             │  │
│  │  • updateReminder()                                  │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                       │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              storage (BrowserStorage)                 │  │
│  │  • chrome.storage.local.get()                        │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                       │
│                       ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             Display Reminders                         │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ [Image] Product Name                            │ │  │
│  │  │         Price: $XX.XX                           │ │  │
│  │  │         Reminder: in 23 hours                   │ │  │
│  │  │         [Still interested] [Not interested]     │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
amazon.tsx (Content Script)
  └── <App>
      ├── <ProductView>
      ├── <IDontNeedIt>
      ├── <SleepOnIt>            ← Modified
      │   ├── Uses: storage
      │   └── Uses: productExtractor
      └── <INeedIt>

popup.tsx (Extension Popup)
  └── <IndexPopup>              ← Modified
      └── Uses: useStorage()
          └── Uses: storage
```

## Storage Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│   (React Components: SleepOnIt, Popup, etc.)           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Imports storage singleton
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   storage/index.ts                       │
│   export const storage = new BrowserStorage()          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Implements
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   storage/IStorage.ts                    │
│   interface IStorage {                                  │
│     getReminders(): Promise<Reminder[]>                 │
│     saveReminder(reminder): Promise<void>               │
│     updateReminder(id, updates): Promise<void>          │
│     deleteReminder(id): Promise<void>                   │
│     getProduct(id): Promise<Product | null>             │
│     saveProduct(product): Promise<void>                 │
│     getSettings(): Promise<Settings>                    │
│     updateSettings(settings): Promise<void>             │
│   }                                                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Implemented by
                        ▼
┌─────────────────────────────────────────────────────────┐
│              storage/BrowserStorage.ts                   │
│                                                          │
│   Detects execution context:                            │
│   - Popup/Options: Direct chrome.storage.local         │
│   - Content Script: Message passing to background      │
└────────────┬─────────────────────────┬──────────────────┘
             │                         │
    Direct   │                         │ Message passing
    access   │                         │ (content scripts)
             ▼                         ▼
┌──────────────────────┐    ┌─────────────────────────────┐
│ chrome.storage.local │    │   background.ts (Service    │
│                      │    │   Worker)                   │
│ (Popup context)      │    │                             │
└──────────────────────┘    │   Listens for messages:     │
                             │   - STORAGE_GET             │
                             │   - STORAGE_SET             │
                             │                             │
                             │   Performs operations on    │
                             │   chrome.storage.local      │
                             └─────────────────────────────┘
```

## Data Models (storage/types.ts)

### Product
```typescript
{
  id: string              // Amazon product ID (e.g., "B0XXXXXXX")
  name: string            // Product title
  price: string | null    // Price string (e.g., "$99.99")
  image: string | null    // Product image URL
  url: string             // Full Amazon product URL
  timestamp: number       // When saved (Date.now())
}
```

### Reminder
```typescript
{
  id: string              // UUID for reminder
  productId: string       // References Product.id
  reminderTime: number    // When to remind (Date.now() + duration)
  duration: number        // Duration in milliseconds
  status: 'pending' | 'completed' | 'dismissed'
}
```

### Settings
```typescript
{
  reminderDurations: number[]  // Available duration options in ms
  defaultDuration: number      // Default selected duration in ms
}
```

## Chrome Storage Keys

- `thinktwice_reminders`: Array of all reminders
- `thinktwice_products`: Object mapping product IDs to Product objects
- `thinktwice_settings`: User settings object

## Why This Architecture?

### Abstraction Benefits
1. **Testability**: Can swap storage implementation for testing
2. **Flexibility**: Easy to migrate to different storage (sync, IndexedDB, etc.)
3. **Type Safety**: TypeScript interfaces ensure consistency
4. **Separation of Concerns**: Storage logic isolated from UI

### Storage Strategy
- **Local Storage**: Persistent across sessions, fast access
- **Normalized Data**: Products stored separately from reminders (avoid duplication)
- **Defensive Coding**: All storage operations wrapped in try-catch
- **Context-Aware**: Automatically uses message passing in content scripts, direct access in popup

### Message Passing Solution
Chrome Extension architecture requires special handling:
- **Content Scripts** don't have direct access to `chrome.storage` APIs
- **Solution**: Background service worker acts as storage proxy
- **BrowserStorage** detects execution context and chooses appropriate method
- **Transparent**: Application code doesn't need to know the difference

### React Integration
- **Custom Hook**: `useStorage()` provides reactive data access
- **Automatic Refresh**: Hook reloads data after mutations
- **Loading States**: Built-in loading and error handling
- **No Prop Drilling**: Components import storage directly or use hook

## Performance Considerations

1. **Lazy Loading**: Products only loaded when displaying reminders
2. **Batch Operations**: Multiple storage reads done with Promise.all
3. **Minimal Re-renders**: Hook only updates state when data changes
4. **No Polling**: Uses event-driven updates (manual refresh after mutations)

## Security & Privacy

1. **Local Storage Only**: No data sent to external servers
2. **No Tracking**: No analytics or telemetry
3. **User Control**: Users can dismiss reminders (effectively deleting)
4. **Minimal Data**: Only stores what's necessary for functionality

## Notifications & Alarms System

### Chrome Alarms API
- **Purpose**: Schedule reminder notifications at specific times
- **Alarm naming**: `reminder_{reminderId}` for individual reminders, `badge_update` for periodic checks
- **Persistence**: Alarms survive browser restarts and service worker termination
- **Creation**: When user sets a reminder, `CREATE_ALARM` message sent to background worker

### Background Service Worker
**Responsibilities:**
1. **Message Handling**: Processes `STORAGE_GET`, `STORAGE_SET`, `CREATE_ALARM` messages
2. **Alarm Management**: Creates, listens for, and processes alarm events
3. **Notification Creation**: Generates browser notifications when reminders are due
4. **Badge Management**: Updates extension icon badge count for due reminders
5. **Lifecycle Management**: Restores alarms on startup, handles overdue reminders

**Initialization Flow:**
1. Service worker starts
2. Checks for existing reminders in storage
3. Recreates alarms for future reminders
4. Shows notifications for overdue reminders
5. Sets up periodic badge update (every 1 minute)

### Browser Notifications
**When triggered:**
- Alarm fires at reminder time
- Background fetches product & reminder data
- Creates notification with:
  - Title: "Time to Reconsider?"
  - Message: Product name
  - Context: Product price
  - Icon: Product image (or extension icon)
  - Buttons: "View Product", "Not Interested"

**User interactions:**
- **Click notification**: Opens extension popup
- **"View Product"**: Opens product page in new tab, marks reminder as completed
- **"Not Interested"**: Marks reminder as dismissed
- All actions update badge count and clear notification

### Badge Count System
**Shows:** Number of pending reminders that are due (not all pending)

**Updates triggered by:**
- Alarm fires (new reminder becomes due)
- Notification button clicked (reminder status changes)
- Periodic check (every 1 minute via `badge_update` alarm)
- Service worker startup/restart

**Badge appearance:**
- Count > 0: Shows number in purple badge (#8B5CF6)
- Count = 0: No badge displayed

### Permissions Required
- `storage`: Store reminders and product data
- `alarms`: Schedule timed notifications
- `notifications`: Display browser notifications

### Error Handling
- All alarm/notification operations wrapped in availability checks
- Gracefully degrades if APIs unavailable
- Comprehensive logging for debugging
- Service worker validates API availability on startup

