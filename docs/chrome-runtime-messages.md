# Chrome Runtime Messages

This document describes the Chrome runtime messaging architecture used for communication between content scripts/popup and the background service worker.

## Architecture

The project uses a **unified messaging service** (`ChromeMessaging`) that provides type-safe methods for all Chrome runtime message passing. All message types are defined using TypeScript enums for consistency and type safety.

### Key Components

- **`types/messages.ts`** - Message type definitions with `MessageType` enum
- **`services/ChromeMessaging.ts`** - Unified messaging service with typed methods
- **`background.ts`** - Background service worker that handles all messages

## Usage

Instead of calling `chrome.runtime.sendMessage` directly, use the `ChromeMessaging` service:

```typescript
import { ChromeMessaging } from "../services/ChromeMessaging"

// Create an alarm
await ChromeMessaging.createAlarm(reminderId, timestamp)

// Close current tab
await ChromeMessaging.closeCurrentTab()
```

## Message Types

### 1. CREATE_ALARM

**Purpose:** Create a Chrome alarm for a reminder  
**Service Method:** `ChromeMessaging.createAlarm(reminderId: string, when: number)`  
**Used By:** `views/SleepOnIt.tsx`  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface CreateAlarmMessage {
  type: MessageType.CREATE_ALARM
  reminderId: string
  when: number // timestamp
}
```

### 2. CLOSE_CURRENT_TAB

**Purpose:** Close the current browser tab  
**Service Method:** `ChromeMessaging.closeCurrentTab()`  
**Used By:** `views/EarlyReturnFromSleep.tsx`, `views/BackToAnOldFlame.tsx`  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface CloseCurrentTabMessage {
  type: MessageType.CLOSE_CURRENT_TAB
}
```

### 3. CREATE_TAB

**Purpose:** Create a new browser tab with the specified URL  
**Service Method:** `ChromeMessaging.createTab(url: string)`  
**Used By:** `popup.tsx`  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface CreateTabMessage {
  type: MessageType.CREATE_TAB
  url: string
}
```

### 4. STORAGE_GET

**Purpose:** Read data from `chrome.storage.local`  
**Used By:** `storage/BrowserStorage.ts` (internal wrapper)  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface StorageGetMessage {
  type: MessageType.STORAGE_GET
  keys: string | string[]
}
```

### 5. STORAGE_SET

**Purpose:** Write data to `chrome.storage.local`  
**Used By:** `storage/BrowserStorage.ts` (internal wrapper)  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface StorageSetMessage {
  type: MessageType.STORAGE_SET
  data: Record<string, any>
}
```

### 6. STORAGE_REMOVE

**Purpose:** Remove data from `chrome.storage.local`  
**Used By:** None currently (handler exists for future use)  
**Handler:** `background.ts`  
**Message Interface:**

```typescript
interface StorageRemoveMessage {
  type: MessageType.STORAGE_REMOVE
  keys: string | string[]
}
```

## Response Format

All messages return a response using the `MessageResponse` interface:

```typescript
interface MessageResponse<T = any> {
  success: boolean
  data?: T // for operations that return data
  error?: string // on failure
}
```

## Implementation Notes

### Type Safety

- All message types use the `MessageType` enum instead of string literals
- Each message has a dedicated TypeScript interface
- The unified `Message` type is a union of all message interfaces

### Storage Abstraction

`BrowserStorage.ts` automatically routes storage operations through message passing when direct `chrome.storage` access is unavailable (e.g., in content scripts). This abstraction is transparent to consumers of the storage API.

### Message Handler

All messages are handled in `background.ts` by the `chrome.runtime.onMessage` listener. Handlers that need async operations return `true` to keep the message channel open.

### Adding New Message Types

To add a new message type:

1. Add the type to the `MessageType` enum in `types/messages.ts`
2. Create a message interface in `types/messages.ts`
3. Add the interface to the `Message` union type
4. Add a handler in `background.ts`
5. (Optional) Add a convenience method to `ChromeMessaging` service
