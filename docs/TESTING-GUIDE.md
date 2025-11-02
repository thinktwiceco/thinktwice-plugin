# ThinkTwice Plugin - Testing Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Manual Testing Procedures](#manual-testing-procedures)
4. [Feature-Specific Test Cases](#feature-specific-test-cases)
5. [Browser Testing](#browser-testing)
6. [Edge Cases and Error Scenarios](#edge-cases-and-error-scenarios)
7. [Performance Testing](#performance-testing)
8. [Security and Privacy Testing](#security-and-privacy-testing)
9. [Troubleshooting](#troubleshooting)
10. [Testing Checklist](#testing-checklist)

---

## Introduction

This document provides comprehensive testing procedures for the ThinkTwice Chrome extension. ThinkTwice is a browser extension that helps users make thoughtful purchasing decisions on Amazon by providing behavioral nudges, reminder systems, and alternative purchase considerations.

### What This Plugin Does

- **Intervenes on Amazon product pages** with a decision overlay
- **Provides behavioral nudges** to encourage thoughtful purchasing
- **Offers three decision paths**: "I don't need it", "Sleep on it", or "I need it"
- **Schedules reminders** for delayed purchase decisions
- **Tracks savings** and purchase decisions
- **Shows notifications** when reminders are due

### Testing Goals

- Verify all user flows work correctly
- Ensure data persistence across browser sessions
- Validate notification and alarm systems
- Test edge cases and error handling
- Confirm performance and security

---

## Testing Environment Setup

### Prerequisites

1. **Node.js**: Version 22.18.0 or higher
   ```bash
   node --version  # Should output v22.18.0+
   ```

2. **Google Chrome**: Latest version (recommended)
   ```bash
   google-chrome --version
   ```

3. **Git**: For version control
   ```bash
   git --version
   ```

### Initial Setup

#### 1. Clone and Install

```bash
# Navigate to project directory
cd /home/verte/Desktop/Thinktwice/plugin-3

# Install dependencies
npm install

# Verify installation
npm list
```

#### 2. Build the Extension

**For Development Testing:**
```bash
npm run dev
```
This starts the Plasmo development server with hot reload enabled. The extension builds to `build/chrome-mv3-dev/`.

**For Production Testing:**
```bash
npm run build
```
This creates an optimized production build in `build/chrome-mv3-prod/`.

#### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the appropriate build directory:
   - Development: `build/chrome-mv3-dev/`
   - Production: `build/chrome-mv3-prod/`
5. Verify the extension appears with the ThinkTwice icon

#### 4. Verify Extension Installation

After loading:
- Extension icon should appear in Chrome toolbar
- Extension should be listed in `chrome://extensions/` with status "Enabled"
- No errors should appear in the extension card

#### 5. Open Developer Tools

For debugging during testing:
1. On `chrome://extensions/`, find ThinkTwice
2. Click **"Service worker"** link (opens background script console)
3. Keep this console open during testing to monitor background events

### Testing Environment Configuration

#### Enable Verbose Logging

The extension has extensive console logging. Keep these consoles open:

1. **Background Service Worker Console**
   - Click "Service worker" link on extension card
   - Shows: alarm events, storage operations, notifications

2. **Content Script Console**
   - Open any Amazon product page
   - Open DevTools (F12)
   - Check Console tab
   - Shows: product extraction, user interactions, storage operations

3. **Extension Popup Console**
   - Right-click extension icon → "Inspect popup"
   - Shows: reminder list, user actions in popup

#### Test Amazon URLs

Use these sample Amazon product URLs for testing:

```
# Standard /dp/ URLs
https://www.amazon.com/dp/B08N5WRWNW
https://www.amazon.com/dp/B0BDJ6K61V

# /gp/product/ URLs
https://www.amazon.com/gp/product/B08N5WRWNW

# Product with various price formats
https://www.amazon.com/dp/B09G9FPHY6  # Standard price
https://www.amazon.com/dp/B07ZPKBL9V  # Sale price
```

---

## Manual Testing Procedures

### Basic Testing Workflow

For each test case, follow this workflow:

1. **Clear Previous State** (optional, for clean tests)
   - Open extension popup
   - Clear all reminders
   - OR clear extension storage via DevTools

2. **Execute Test Steps**
   - Follow the specific test case procedures
   - Document observations

3. **Verify Expected Results**
   - Check UI behavior
   - Verify console logs
   - Confirm storage changes

4. **Document Results**
   - Record pass/fail status
   - Note any anomalies
   - Screenshot issues if present

### Clearing Extension Data

To start with a clean state:

**Method 1: Via Extension Storage API**
1. Go to `chrome://extensions/`
2. Find ThinkTwice extension
3. Click "Service worker" link
4. In console, run:
   ```javascript
   chrome.storage.local.clear()
   ```

**Method 2: Via DevTools**
1. Open any Amazon page
2. Open DevTools (F12)
3. Go to "Application" tab
4. Expand "Storage" → "Local Storage"
5. Find extension's storage
6. Right-click → Clear

**Method 3: Reinstall Extension**
1. Remove extension from `chrome://extensions/`
2. Reload the unpacked extension

---

## Feature-Specific Test Cases

### Test Suite 1: Product Page Intervention

#### Test 1.1: Overlay Appears on Amazon Product Page

**Objective**: Verify the ThinkTwice overlay displays on Amazon product pages.

**Preconditions**:
- Extension is installed and enabled
- User is not on an Amazon page

**Steps**:
1. Navigate to an Amazon product page (e.g., `https://www.amazon.com/dp/B08N5WRWNW`)
2. Wait for page to fully load

**Expected Results**:
- ✓ ThinkTwice overlay appears over the product page
- ✓ Overlay contains:
  - ThinkTwice branding
  - "Quick thought before you buy" subtitle with lightbulb icon
  - A random behavioral nudge
  - Three action buttons:
    - "I don't really need it" (primary button with thoughtful icon)
    - "Sleep on it" (secondary button with clock icon)
    - "I need it" (tertiary button with trophy icon)
  - Close button (X) in top-right corner
- ✓ Overlay is styled correctly with gradient background
- ✓ Product page content is still visible behind the overlay

**Console Verification**:
```
[Amazon] Product saved with sleepingOnIt state (may appear)
ProductView extracted product data
```

**Pass Criteria**: Overlay displays correctly with all elements visible and properly styled.

---

#### Test 1.2: Product Data Extraction

**Objective**: Verify the extension correctly extracts product information from Amazon pages.

**Steps**:
1. Navigate to an Amazon product page
2. Open DevTools Console
3. Look for product extraction logs

**Expected Results**:
- ✓ Console shows product extraction attempt
- ✓ Extracted data includes:
  - Product ID (e.g., "B08N5WRWNW")
  - Product name
  - Product price (if available)
  - Product image URL (if available)
  - Product URL

**Console Verification**:
```javascript
// Look for logs like:
[ProductView] Extracted product: {
  id: "B08N5WRWNW",
  name: "Product Name Here",
  price: "$99.99",
  image: "https://...",
  url: "https://www.amazon.com/...",
  timestamp: 1234567890
}
```

**Pass Criteria**: Product data is successfully extracted and logged with all fields present.

---

#### Test 1.3: Close Overlay Behavior

**Objective**: Verify closing the overlay works correctly.

**Steps**:
1. Navigate to Amazon product page
2. Wait for overlay to appear
3. Click the close button (X) in top-right corner

**Expected Results**:
- ✓ Overlay closes immediately
- ✓ Product page is fully accessible
- ✓ No errors in console

**Note**: Currently the close handler is minimal (`() => {}`), so overlay may reappear on page reload or navigation.

**Pass Criteria**: Overlay closes without errors.

---

### Test Suite 2: "I Don't Need It" Flow

#### Test 2.1: Navigate to Investment Options View

**Objective**: Verify clicking "I don't really need it" shows the investment options screen.

**Steps**:
1. Navigate to Amazon product page
2. Wait for overlay to appear
3. Click "I don't really need it" button

**Expected Results**:
- ✓ View transitions to IDontNeedIt screen
- ✓ Screen displays:
  - Back button (left arrow)
  - Close button (X)
  - Star icon at top
  - Title: "Awesome! You probably don't need this"
  - Subtitle: "But do you want to grow the money you saved?"
  - Three buttons:
    - "Start Investing"
    - "Learn How"
    - "Maybe Later"
  - Information box with lightbulb icon and retirement savings tip
- ✓ Product is saved with `state: "dontNeedIt"` in storage

**Console Verification**:
```
[Amazon] Product saved with dontNeedIt state
```

**Pass Criteria**: IDontNeedIt view displays correctly with all UI elements.

---

#### Test 2.2: Investment Options Buttons

**Objective**: Verify investment option buttons work (currently log to console).

**Steps**:
1. Navigate to IDontNeedIt view (follow Test 2.1)
2. Open DevTools Console
3. Click "Start Investing" button
4. Click "Learn How" button  
5. Click "Maybe Later" button

**Expected Results**:
- ✓ Each button logs to console (current implementation)
- ✓ No JavaScript errors occur

**Console Verification**:
```
[IDontNeedIt] Start Investing clicked
[IDontNeedIt] Learn How clicked
[IDontNeedIt] Maybe Later clicked
```

**Note**: Full implementation would redirect to investment platforms or educational content.

**Pass Criteria**: Buttons are clickable and log correct messages without errors.

---

#### Test 2.3: Back Navigation from IDontNeedIt

**Objective**: Verify returning to the main product view.

**Steps**:
1. Navigate to IDontNeedIt view
2. Click back button (left arrow)

**Expected Results**:
- ✓ View transitions back to ProductView
- ✓ Overlay shows main decision screen again
- ✓ Same nudge is displayed (or new random nudge)

**Pass Criteria**: Navigation back to ProductView works smoothly.

---

### Test Suite 3: "Sleep On It" Flow

#### Test 3.1: Navigate to Sleep On It View

**Objective**: Verify clicking "Sleep on it" shows the reminder duration selection screen.

**Steps**:
1. Navigate to Amazon product page
2. Wait for overlay to appear
3. Click "Sleep on it" button

**Expected Results**:
- ✓ View transitions to SleepOnIt screen
- ✓ Screen displays:
  - Back button (left arrow)
  - Close button (X)
  - Moon icon at top
  - Title: "Brilliant choice!"
  - Subtitle: "3 out of 4 people change their mind within 24 hours."
  - Question: "For how long you would like to think about this purchase?"
  - Six duration options in grid layout:
    - "1 minute"
    - "1 hour"
    - "6 hours"
    - "24 hours" (selected by default)
    - "3 days"
    - "1 week"
  - "Set Reminder" button (primary, enabled)

**Pass Criteria**: SleepOnIt view displays correctly with all duration options.

---

#### Test 3.2: Select Different Duration Options

**Objective**: Verify duration selection interaction.

**Steps**:
1. Navigate to SleepOnIt view
2. Click on each duration button
3. Observe visual feedback

**Expected Results**:
- ✓ Selected duration button has visual highlight:
  - Border changes to primary color
  - Background has slight color tint
- ✓ Only one duration can be selected at a time
- ✓ Clicking a different duration deselects the previous one
- ✓ "24 hours" is selected by default on first load

**Pass Criteria**: Duration selection works correctly with proper visual feedback.

---

#### Test 3.3: Set Reminder and Save

**Objective**: Verify setting a reminder saves data and creates an alarm.

**Preconditions**:
- Background service worker console is open

**Steps**:
1. Navigate to SleepOnIt view
2. Select "1 minute" duration (for quick testing)
3. Open DevTools Console (F12)
4. Click "Set Reminder" button
5. Wait for confirmation message

**Expected Results**:
- ✓ Button text changes to "Saving..." briefly
- ✓ Success message appears: "✓ Reminder saved! Hold tight and remember about the goal!"
- ✓ Tab automatically closes after 4 seconds
- ✓ Console shows successful save operations:

**Console Verification (Content Script)**:
```
[SleepOnIt] Starting to save reminder for product: B08N5WRWNW
[SleepOnIt] Product: {id: "B08N5WRWNW", ...}
[SleepOnIt] Saving product with sleepingOnIt state...
[SleepOnIt] Product saved successfully
[SleepOnIt] Saving reminder...
[SleepOnIt] Reminder saved successfully
[SleepOnIt] Creating alarm for reminder...
[SleepOnIt] Alarm created successfully
[SleepOnIt] Reminder saved, scheduling tab close in 4 seconds...
```

**Console Verification (Background Worker)**:
```
[Background] Received message: CREATE_ALARM
[Background] CREATE_ALARM for reminder: <uuid> at <timestamp>
[Background] Alarm created successfully
```

**Storage Verification**:
- Check storage via DevTools → Application → Storage → Extension Storage
- Should contain:
  - `thinktwice_products`: Contains product with `state: "sleepingOnIt"`
  - `thinktwice_reminders`: Contains new reminder with `status: "pending"`

**Pass Criteria**: Reminder is saved successfully, alarm is created, and tab closes automatically.

---

#### Test 3.4: Reminder Alarm Fires and Notification Appears

**Objective**: Verify the alarm system triggers notifications when reminders are due.

**Preconditions**:
- A reminder was set with "1 minute" duration (Test 3.3)
- Background service worker console is open

**Steps**:
1. Wait for 1 minute after setting reminder
2. Monitor background service worker console
3. Check for browser notification

**Expected Results**:
- ✓ After 1 minute, alarm fires
- ✓ Browser notification appears with:
  - Title: "ThinkTwice Reminder 🤔"
  - Body: "Time to reconsider: [Product Name]"
  - Icon: ThinkTwice logo
  - Notification persists until dismissed or clicked
- ✓ Extension badge shows "1" (indicating 1 due reminder)

**Console Verification (Background Worker)**:
```
[Background] Alarm fired: reminder_<uuid>
[NotificationService] Creating notification for reminder: <uuid>
[NotificationService] Found product: {name: "...", ...}
[NotificationService] Notification created with ID: <notification-id>
[BadgeService] Badge count updated: 1
```

**Visual Verification**:
- Notification appears in system notification area
- Extension badge shows count "1"

**Pass Criteria**: Alarm fires on time, notification appears with correct content, and badge updates.

---

#### Test 3.5: Back Navigation from SleepOnIt

**Objective**: Verify returning to main view before setting reminder.

**Steps**:
1. Navigate to SleepOnIt view
2. Do NOT click "Set Reminder"
3. Click back button (left arrow)

**Expected Results**:
- ✓ View transitions back to ProductView
- ✓ No reminder is saved
- ✓ No alarm is created

**Pass Criteria**: Navigation works without side effects.

---

### Test Suite 4: Extension Popup (Reminder Dashboard)

#### Test 4.1: Open Extension Popup

**Objective**: Verify the popup interface displays correctly.

**Steps**:
1. Set at least one reminder (follow Test 3.3)
2. Click the ThinkTwice extension icon in Chrome toolbar
3. Observe popup contents

**Expected Results**:
- ✓ Popup opens in a 400px wide window
- ✓ Header displays:
  - Title: "ThinkTwice"
  - Subtitle: "Your impulse control journey"
- ✓ Body shows reminder sections (if reminders exist)
- ✓ Loading state shows briefly if data is loading

**Pass Criteria**: Popup opens and displays correctly.

---

#### Test 4.2: View Pending Reminders (Sleeping On It)

**Objective**: Verify pending reminders are displayed correctly in the popup.

**Preconditions**:
- At least one reminder is saved with future reminder time

**Steps**:
1. Set a reminder with "24 hours" duration
2. Open extension popup

**Expected Results**:
- ✓ "Sleeping on it" section appears
- ✓ Section header shows:
  - Title: "Sleeping on it"
  - Total savings amount: "Saving: $XX.XX"
- ✓ Encouraging message: "You can do this! 💪"
- ✓ Reminder card(s) display:
  - Product image (60x60px)
  - Product name (truncated if long)
  - Price: "Price: $XX.XX"
  - Time remaining: "Reminder: in 24 hours"
  - "I changed my mind" button

**Pass Criteria**: Pending reminders display correctly with all information.

---

#### Test 4.3: View Due Reminders (Achievements)

**Objective**: Verify due/overdue reminders appear in the achievements section.

**Preconditions**:
- At least one reminder alarm has fired (Test 3.4)

**Steps**:
1. Wait for a reminder alarm to fire
2. Open extension popup

**Expected Results**:
- ✓ "Achievements - You resisted! 🎉" section appears
- ✓ Section header shows:
  - Title: "Achievements - You resisted! 🎉"
  - Total saved: "Saved: $XX.XX"
- ✓ Reminder card(s) display:
  - Product image
  - Product name
  - Price
  - No time remaining shown (since it's due)
  - "I changed my mind" button

**Pass Criteria**: Due reminders appear in achievements section correctly.

---

#### Test 4.4: Click "I Changed My Mind" Button

**Objective**: Verify clicking this button opens the product page and dismisses the reminder.

**Preconditions**:
- At least one reminder is visible in popup

**Steps**:
1. Open extension popup
2. Find a reminder card
3. Click "I changed my mind" button

**Expected Results**:
- ✓ New tab opens with the product URL
- ✓ Reminder status changes to "dismissed" in storage
- ✓ Reminder disappears from popup on next open
- ✓ Badge count decreases if it was in achievements

**Console Verification**:
```
[Popup] handleChangedMind called for reminder: <uuid>
[Background] Received message: STORAGE_SET
[Background] Received message: CREATE_TAB
```

**Pass Criteria**: Product page opens and reminder is dismissed correctly.

---

#### Test 4.5: Empty State Display

**Objective**: Verify the popup shows an appropriate message when no reminders exist.

**Preconditions**:
- No reminders in storage (clear storage if needed)

**Steps**:
1. Open extension popup

**Expected Results**:
- ✓ Empty state message displays:
  - Icon: 💭
  - Title: "No items yet"
  - Subtitle: "Click 'Sleep on it' on any Amazon product to start saving"
- ✓ No error messages

**Pass Criteria**: Empty state is friendly and informative.

---

### Test Suite 5: "I Need It" Flow

#### Test 5.1: Navigate to I Need It View

**Objective**: Verify clicking "I need it" shows the confirmation screen.

**Steps**:
1. Navigate to Amazon product page
2. Wait for overlay to appear
3. Click "I need it" button

**Expected Results**:
- ✓ View transitions to INeedIt screen
- ✓ Screen displays:
  - Trophy icon at top
  - Title: "Trusting yourself is powerful"
  - Subtitle: "Enjoy your new purchase"
- ✓ Product is saved with `state: "iNeedThis"` in storage
- ✓ Screen disappears after a few seconds (auto-close)

**Console Verification**:
```
[ProductView] Product saved with iNeedThis state
```

**Pass Criteria**: INeedIt view displays correctly and saves product state.

---

#### Test 5.2: Back Navigation from INeedIt

**Objective**: Verify returning to main view from confirmation.

**Steps**:
1. Navigate to INeedIt view
2. Click back button before auto-close

**Expected Results**:
- ✓ View transitions back to ProductView
- ✓ Auto-close timer is cancelled

**Pass Criteria**: Navigation works correctly.

---

### Test Suite 6: Advanced Flows

#### Test 6.1: "Early Return From Sleep" Flow

**Objective**: Verify returning to a product page while a reminder is still pending.

**Preconditions**:
- A reminder is set for a product (e.g., with "24 hours" duration)

**Steps**:
1. Set reminder for product X with "24 hours" duration
2. Within the 24 hours, navigate back to product X's Amazon page
3. Wait for overlay to appear

**Expected Results**:
- ✓ "EarlyReturnFromSleep" view appears instead of ProductView
- ✓ Screen displays:
  - Thoughtful icon
  - Title: "You said you'd sleep on this! What changed your mind?"
  - Action buttons:
    - "I reconsidered, I don't need this"
    - "I need this now"

**Pass Criteria**: Special view appears for products with active reminders.

---

#### Test 6.2: Early Return - "I Need This Now" Action

**Objective**: Verify proceeding with purchase from early return view.

**Preconditions**:
- EarlyReturnFromSleep view is displayed (Test 6.1)

**Steps**:
1. Display EarlyReturnFromSleep view
2. Click "I need this now" button

**Expected Results**:
- ✓ Reminder is deleted from storage
- ✓ Product state changes to "iNeedThis"
- ✓ Celebration view appears briefly
- ✓ Overlay closes or tab closes

**Console Verification**:
```
[EarlyReturnFromSleep] Reminder deleted
[EarlyReturnFromSleep] Product state updated to iNeedThis
```

**Pass Criteria**: Purchase proceeds correctly and reminder is cancelled.

---

#### Test 6.3: "Back To An Old Flame" Flow

**Objective**: Verify returning to a product after previously saying "I don't need it".

**Preconditions**:
- Product was previously saved with `state: "dontNeedIt"`

**Steps**:
1. Visit product X, click "I don't really need it"
2. Later, return to product X's Amazon page
3. Wait for overlay to appear

**Expected Results**:
- ✓ "BackToAnOldFlame" view appears instead of ProductView
- ✓ Screen displays:
  - Thoughtful icon
  - Title: "You said you didn't need this, did you change your mind?"
  - Action buttons:
    - "You are right I don't need this"
    - "I need this now"

**Pass Criteria**: Special view appears for previously dismissed products.

---

#### Test 6.4: Back To Old Flame - "I Don't Need This" Action

**Objective**: Verify confirming the original decision.

**Preconditions**:
- BackToAnOldFlame view is displayed (Test 6.3)

**Steps**:
1. Display BackToAnOldFlame view
2. Click "You are right I don't need this" button

**Expected Results**:
- ✓ Celebration view appears: "🎉 Awesome!"
- ✓ Subtitle: "Closing tab..."
- ✓ Tab closes automatically after 2 seconds

**Console Verification**:
```
[BackToAnOldFlame] Requesting tab close after celebration...
[BackToAnOldFlame] Tab close request successful
```

**Pass Criteria**: Tab closes gracefully after confirmation.

---

#### Test 6.5: Back To Old Flame - "I Need This Now" Action

**Objective**: Verify changing decision on previously dismissed product.

**Preconditions**:
- BackToAnOldFlame view is displayed (Test 6.3)

**Steps**:
1. Display BackToAnOldFlame view
2. Click "I need this now" button

**Expected Results**:
- ✓ Product state changes to "iNeedThis"
- ✓ Celebration view appears: "🎉 Awesome!"
- ✓ Subtitle: "You made a thoughtful choice! Enjoy your purchase!"
- ✓ View closes after 4 seconds

**Console Verification**:
```
[BackToAnOldFlame] Product state updated to iNeedThis
```

**Pass Criteria**: Decision change is saved and user is allowed to proceed.

---

### Test Suite 7: Notification Interactions

#### Test 7.1: Click Notification

**Objective**: Verify clicking a notification opens the extension popup or product page.

**Preconditions**:
- A reminder notification has appeared (Test 3.4)

**Steps**:
1. Wait for reminder notification to appear
2. Click on the notification

**Expected Results**:
- ✓ Notification closes
- ✓ Extension popup may open (depending on implementation)
- ✓ OR product page opens in new tab

**Console Verification**:
```
[NotificationService] Notification clicked: <notification-id>
```

**Note**: Current implementation may vary. Check code for exact behavior.

**Pass Criteria**: Clicking notification triggers the intended action.

---

#### Test 7.2: Dismiss Notification

**Objective**: Verify dismissing a notification works correctly.

**Steps**:
1. Wait for reminder notification to appear
2. Click "Dismiss" or "X" on notification

**Expected Results**:
- ✓ Notification closes
- ✓ Reminder remains in storage (still accessible via popup)
- ✓ Badge count remains unchanged

**Pass Criteria**: Notification can be dismissed without data loss.

---

### Test Suite 8: Badge Counter

#### Test 8.1: Badge Shows Due Reminder Count

**Objective**: Verify the extension badge displays the count of due reminders.

**Preconditions**:
- Set at least 2 reminders with "1 minute" duration

**Steps**:
1. Set 2 reminders for different products
2. Wait for both alarms to fire (1 minute each)
3. Check extension icon in toolbar

**Expected Results**:
- ✓ Badge appears on extension icon
- ✓ Badge shows "2" (count of due reminders)
- ✓ Badge color is visible (typically red or blue)

**Console Verification**:
```
[BadgeService] Badge count updated: 2
```

**Pass Criteria**: Badge shows correct count of due reminders.

---

#### Test 8.2: Badge Updates When Reminder is Dismissed

**Objective**: Verify badge count decreases when reminders are handled.

**Preconditions**:
- Badge shows count > 0

**Steps**:
1. Open extension popup
2. Click "I changed my mind" on one reminder
3. Check extension icon

**Expected Results**:
- ✓ Badge count decreases by 1
- ✓ If no more due reminders exist, badge disappears

**Console Verification**:
```
[BadgeService] Badge count updated: 1
```

**Pass Criteria**: Badge count updates correctly in real-time.

---

#### Test 8.3: Badge Resets on Browser Restart

**Objective**: Verify badge count persists or recalculates after browser restart.

**Steps**:
1. Set several reminders with short durations
2. Wait for alarms to fire (badge shows count)
3. Restart Chrome browser
4. Check extension icon

**Expected Results**:
- ✓ Badge count recalculates on startup
- ✓ Badge shows correct count based on current due reminders
- ✓ Background worker reinitializes alarms

**Console Verification (after restart)**:
```
[Background] Service worker STARTING...
[Background] Found X reminders in storage
[Background] Active alarms after initialization: X
```

**Pass Criteria**: Badge state is correctly restored after restart.

---

### Test Suite 9: Data Persistence

#### Test 9.1: Product Data Persists Across Sessions

**Objective**: Verify saved products remain in storage after closing and reopening browser.

**Steps**:
1. Set a reminder for a product
2. Close Chrome completely
3. Reopen Chrome
4. Open extension popup

**Expected Results**:
- ✓ Reminder still appears in popup
- ✓ Product information is intact
- ✓ No data loss

**Storage Verification**:
- Check `chrome://extensions/` → ThinkTwice → "Service worker" → Console:
  ```javascript
  chrome.storage.local.get(null, (data) => console.log(data))
  ```
- Verify products and reminders exist

**Pass Criteria**: All data persists correctly across sessions.

---

#### Test 9.2: Product States Are Tracked Correctly

**Objective**: Verify product state transitions are saved correctly.

**Steps**:
1. Visit product A → click "I don't need it" → verify state is "dontNeedIt"
2. Visit product B → click "Sleep on it" → set reminder → verify state is "sleepingOnIt"
3. Visit product C → click "I need it" → verify state is "iNeedThis"
4. Check storage for all three products

**Expected Results**:
- ✓ Product A has `state: "dontNeedIt"`
- ✓ Product B has `state: "sleepingOnIt"`
- ✓ Product C has `state: "iNeedThis"`
- ✓ Each product has unique ID

**Storage Verification**:
```javascript
chrome.storage.local.get('thinktwice_products', (data) => {
  console.log(data.thinktwice_products)
})
```

**Pass Criteria**: All product states are correctly stored.

---

#### Test 9.3: Reminder States Are Tracked Correctly

**Objective**: Verify reminder status transitions work correctly.

**Steps**:
1. Set a reminder → verify status is "pending"
2. Wait for alarm to fire → verify status remains "pending"
3. Dismiss reminder from popup → verify status changes to "dismissed"
4. Check storage

**Expected Results**:
- ✓ New reminder starts as "pending"
- ✓ Fired alarm doesn't change status (stays "pending")
- ✓ User dismissal changes status to "dismissed"
- ✓ Dismissed reminders don't appear in popup

**Storage Verification**:
```javascript
chrome.storage.local.get('thinktwice_reminders', (data) => {
  console.log(data.thinktwice_reminders)
})
```

**Pass Criteria**: Reminder states transition correctly through lifecycle.

---

### Test Suite 10: Multi-Product Scenarios

#### Test 10.1: Multiple Reminders for Different Products

**Objective**: Verify handling multiple simultaneous reminders.

**Steps**:
1. Open 3 different Amazon product pages in separate tabs
2. Set "1 minute" reminder for each product
3. Wait for all alarms to fire
4. Open extension popup

**Expected Results**:
- ✓ All 3 reminders appear in achievements section
- ✓ Total saved amount is sum of all 3 prices
- ✓ Badge shows "3"
- ✓ Each reminder displays correct product info

**Pass Criteria**: Multiple reminders are handled correctly without interference.

---

#### Test 10.2: Same Product Multiple Times

**Objective**: Verify behavior when visiting same product after setting reminder.

**Steps**:
1. Visit product X → set "24 hours" reminder
2. Visit product X again (before 24 hours)
3. Observe overlay behavior

**Expected Results**:
- ✓ "EarlyReturnFromSleep" view appears (not ProductView)
- ✓ Existing reminder is referenced
- ✓ No duplicate reminders are created

**Pass Criteria**: Extension correctly detects existing product state.

---

#### Test 10.3: Rapid Tab Switching

**Objective**: Test overlay behavior when rapidly switching between product tabs.

**Steps**:
1. Open 5 Amazon product tabs
2. Rapidly switch between tabs
3. Observe overlay on each tab

**Expected Results**:
- ✓ Overlay appears on each product page independently
- ✓ No overlay conflicts between tabs
- ✓ Each overlay shows correct product-specific state
- ✓ No performance degradation

**Pass Criteria**: Extension handles multiple tabs without issues.

---

## Browser Testing

### Cross-Browser Compatibility

While ThinkTwice is built for Chrome, test these scenarios:

#### Chrome Versions

**Latest Stable Chrome**:
- Follow all test suites above
- This is the primary testing target

**Chrome Beta** (optional):
- Install extension
- Run Test Suite 1, 3, 4 (core functionality)
- Note any differences or issues

**Chromium** (optional):
- Test basic functionality
- Verify manifest V3 compatibility

#### Browser Variations

**Chrome with Extensions**:
- Install 5-10 other popular extensions
- Run Test Suite 1, 3 (check for conflicts)
- Verify no interference from other extensions

**Chrome Profiles**:
- Create new Chrome profile
- Install ThinkTwice
- Run Test Suite 1 (clean profile test)

---

### Operating Systems

Test on multiple OS platforms if possible:

#### Linux (Primary)
- Tested on: Ubuntu 22.04+ or similar
- Run all test suites

#### Windows (Secondary)
- Test notification appearance (Windows notification style)
- Test keyboard shortcuts
- Run Test Suite 1, 3, 4

#### macOS (Secondary)
- Test notification appearance (macOS notification center)
- Test keyboard shortcuts (Cmd instead of Ctrl)
- Run Test Suite 1, 3, 4

---

## Edge Cases and Error Scenarios

### Test Suite 11: Error Handling

#### Test 11.1: Amazon Page Without Product ID

**Objective**: Verify graceful handling when product ID can't be extracted.

**Steps**:
1. Navigate to Amazon homepage (`https://www.amazon.com`)
2. Navigate to Amazon search results page
3. Navigate to Amazon category page

**Expected Results**:
- ✓ No overlay appears (correct behavior)
- ✓ No JavaScript errors in console
- ✓ Extension remains functional

**Pass Criteria**: Extension doesn't interfere with non-product pages.

---

#### Test 11.2: Product Without Price

**Objective**: Verify handling products where price extraction fails.

**Steps**:
1. Find Amazon product without visible price (e.g., "Currently unavailable")
2. Navigate to that product page
3. Set a reminder
4. Check storage and popup

**Expected Results**:
- ✓ Overlay still appears
- ✓ Reminder can be set
- ✓ Popup shows product with `price: null` or missing
- ✓ Total savings calculations handle null prices
- ✓ No JavaScript errors

**Pass Criteria**: Extension handles missing price data gracefully.

---

#### Test 11.3: Product Without Image

**Objective**: Verify handling products without images.

**Steps**:
1. Navigate to product page with missing/broken image
2. Set reminder
3. Open popup

**Expected Results**:
- ✓ Overlay still appears
- ✓ Reminder card in popup handles missing image:
  - Shows placeholder, OR
  - Omits image section
- ✓ No broken image icons
- ✓ No layout issues

**Pass Criteria**: Missing images don't break UI.

---

#### Test 11.4: Storage Quota Exceeded

**Objective**: Verify behavior when Chrome storage is full.

**Steps**:
1. Fill Chrome storage with large amount of data (via console):
   ```javascript
   const largeData = new Array(100000).fill('X').join('')
   chrome.storage.local.set({spam: largeData}, () => {
     console.log('Filled storage')
   })
   ```
2. Try to set a new reminder
3. Observe error handling

**Expected Results**:
- ✓ Extension detects storage error
- ✓ User-friendly error message appears (alert or UI message)
- ✓ Extension doesn't crash
- ✓ Console logs error details

**Console Verification**:
```
[SleepOnIt] Failed to save reminder: QuotaExceededError
```

**Pass Criteria**: Storage errors are caught and reported gracefully.

---

#### Test 11.5: Background Worker Crashes

**Objective**: Verify recovery when background service worker becomes inactive.

**Steps**:
1. Set a reminder
2. Go to `chrome://extensions/` → ThinkTwice
3. Click "Service worker" link
4. In console, run: `chrome.runtime.reload()`
5. Wait for reminder alarm to fire

**Expected Results**:
- ✓ Background worker restarts
- ✓ Existing alarms are restored from storage
- ✓ Reminder notification still appears on time
- ✓ Extension remains functional

**Console Verification**:
```
[Background] Service worker STARTING...
[Background] Found X reminders in storage
[Background] Restoring alarm for reminder: <uuid>
```

**Pass Criteria**: Extension recovers gracefully from worker restart.

---

#### Test 11.6: Network Errors (Product Page Load Failures)

**Objective**: Verify behavior when Amazon page doesn't load correctly.

**Steps**:
1. Disconnect internet
2. Navigate to Amazon product page
3. Reconnect internet
4. Reload page

**Expected Results**:
- ✓ Extension doesn't interfere with page load errors
- ✓ Overlay appears after successful page load
- ✓ No extension errors compound page load failures

**Pass Criteria**: Extension handles page load issues gracefully.

---

### Test Suite 12: Boundary Conditions

#### Test 12.1: Very Long Product Names

**Objective**: Test UI with extremely long product titles.

**Steps**:
1. Find product with very long title (100+ characters)
2. Set reminder
3. Check popup display

**Expected Results**:
- ✓ Product name is truncated in popup (with ellipsis)
- ✓ No layout overflow
- ✓ Tooltip shows full name on hover (if implemented)

**Pass Criteria**: Long text doesn't break layout.

---

#### Test 12.2: Very High Product Prices

**Objective**: Test price formatting with large numbers.

**Steps**:
1. Find expensive product (e.g., $10,000+)
2. Set reminder
3. Check popup total savings calculation

**Expected Results**:
- ✓ Price displays correctly with commas: "$10,000.00"
- ✓ Total savings calculations are accurate
- ✓ No number formatting issues

**Pass Criteria**: Large numbers display correctly.

---

#### Test 12.3: Many Reminders (Performance)

**Objective**: Test performance with large number of reminders.

**Steps**:
1. Set 50+ reminders for different products
2. Open popup
3. Monitor performance

**Expected Results**:
- ✓ Popup opens within 1-2 seconds
- ✓ All reminders render correctly
- ✓ Scrolling is smooth
- ✓ No memory leaks

**Performance Verification**:
- Use Chrome DevTools → Performance tab
- Monitor memory usage
- Check for layout thrashing

**Pass Criteria**: Extension remains performant with many reminders.

---

#### Test 12.4: Very Short Reminder Durations

**Objective**: Test edge case of immediate reminders.

**Steps**:
1. Set reminder for "1 minute"
2. Immediately check if alarm is set
3. Wait for alarm to fire

**Expected Results**:
- ✓ Alarm is created immediately
- ✓ Notification appears after exactly 1 minute
- ✓ No race conditions or timing issues

**Pass Criteria**: Short-duration reminders work reliably.

---

#### Test 12.5: Very Long Reminder Durations

**Objective**: Test long-term reminders (e.g., 1 week).

**Steps**:
1. Set reminder for "1 week"
2. Check alarm is scheduled
3. (Optional) Fast-forward system time to test alarm

**Expected Results**:
- ✓ Alarm is scheduled for correct future timestamp
- ✓ Reminder persists across browser restarts
- ✓ Alarm fires at correct time (after 1 week)

**Note**: Full testing may require time manipulation or waiting actual duration.

**Pass Criteria**: Long-duration reminders are correctly scheduled.

---

## Performance Testing

### Metrics to Monitor

#### Extension Load Time
- Initial load on browser startup: < 100ms
- Overlay appearance on product page: < 500ms
- Popup open time: < 300ms

#### Memory Usage
- Idle state: < 10 MB
- With 10 reminders: < 15 MB
- With 100 reminders: < 30 MB

#### CPU Usage
- Background worker idle: < 1%
- During overlay rendering: < 5% (brief spike)
- During alarm processing: < 2%

### Performance Test Procedures

#### Test P.1: Extension Startup Performance

**Steps**:
1. Restart Chrome browser
2. Open Chrome Task Manager (Shift+Esc)
3. Find ThinkTwice extension process
4. Monitor memory and CPU

**Expected Results**:
- ✓ Extension starts within 100ms
- ✓ Memory usage < 10 MB initially
- ✓ CPU spike settles to < 1% within 5 seconds

**Tools**: Chrome Task Manager, DevTools Performance tab

---

#### Test P.2: Product Page Injection Performance

**Steps**:
1. Navigate to Amazon product page
2. Open DevTools → Performance tab
3. Record page load and overlay injection
4. Analyze flame graph

**Expected Results**:
- ✓ Content script injection: < 50ms
- ✓ Overlay render: < 200ms
- ✓ No blocking of page load
- ✓ No excessive DOM operations

---

#### Test P.3: Storage Operation Performance

**Steps**:
1. Use console to time storage operations:
   ```javascript
   console.time('save')
   await storage.saveReminder({...})
   console.timeEnd('save')
   ```

**Expected Results**:
- ✓ Save product: < 50ms
- ✓ Save reminder: < 50ms
- ✓ Get all reminders: < 100ms
- ✓ Update reminder: < 30ms

---

#### Test P.4: Popup Rendering Performance

**Steps**:
1. Set 50 reminders
2. Open popup
3. Measure render time via console or DevTools

**Expected Results**:
- ✓ Initial render: < 500ms
- ✓ Re-render on data change: < 100ms
- ✓ Smooth scrolling (60 FPS)

---

## Security and Privacy Testing

### Test Suite 13: Security

#### Test 13.1: Permission Usage Verification

**Objective**: Verify extension only uses declared permissions.

**Steps**:
1. Review `package.json` manifest permissions:
   ```json
   "permissions": ["storage", "alarms", "notifications"]
   "host_permissions": ["*://*.amazon.com/*"]
   ```
2. Use Chrome DevTools → Application → Permissions
3. Verify no excessive permissions are requested

**Expected Results**:
- ✓ Only declared permissions are used
- ✓ No access to unrelated domains
- ✓ No access to browser history, bookmarks, etc.

**Pass Criteria**: Minimal permissions are requested.

---

#### Test 13.2: Data Storage Security

**Objective**: Verify stored data doesn't contain sensitive information.

**Steps**:
1. Set reminders for various products
2. Inspect storage via DevTools:
   ```javascript
   chrome.storage.local.get(null, (data) => console.log(data))
   ```
3. Review stored data

**Expected Results**:
- ✓ Only product data is stored (name, price, URL, image)
- ✓ No personal user information
- ✓ No payment information
- ✓ No browsing history beyond explicit user actions

**Pass Criteria**: No sensitive data is stored.

---

#### Test 13.3: Third-Party Communication

**Objective**: Verify extension doesn't communicate with external servers.

**Steps**:
1. Open DevTools → Network tab
2. Use extension normally (set reminders, view popup)
3. Monitor network requests

**Expected Results**:
- ✓ No network requests to external APIs
- ✓ Only requests to Amazon (from Amazon page itself)
- ✓ All data stays local

**Pass Criteria**: Extension is fully local (no external calls).

---

### Test Suite 14: Privacy

#### Test 14.1: Data Isolation

**Objective**: Verify data is isolated per Chrome profile.

**Steps**:
1. Create two Chrome profiles
2. Install extension in both
3. Set reminders in Profile A
4. Switch to Profile B, check popup

**Expected Results**:
- ✓ Profile B has no access to Profile A's data
- ✓ Each profile has independent storage
- ✓ No data leakage between profiles

**Pass Criteria**: Data is properly isolated.

---

#### Test 14.2: Data Deletion

**Objective**: Verify users can delete their data.

**Steps**:
1. Set multiple reminders
2. Uninstall extension
3. Reinstall extension
4. Check storage

**Expected Results**:
- ✓ Uninstalling extension clears all data
- ✓ Reinstalling starts with clean slate
- ✓ No residual data remains

**Alternative**: Check if extension offers data export/deletion in settings.

**Pass Criteria**: Data is fully deletable by user.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Overlay Doesn't Appear on Product Page

**Symptoms**: No ThinkTwice overlay shows on Amazon product pages.

**Debugging Steps**:
1. Check extension is enabled in `chrome://extensions/`
2. Verify URL matches pattern: `/dp/` or `/gp/product/`
3. Check console for errors (F12)
4. Verify content script is injected:
   ```javascript
   // In page console, check:
   document.querySelector('[data-plasmo]')
   ```

**Possible Causes**:
- Extension not enabled
- Wrong URL format
- Content script injection failed
- Conflicting extensions

**Solutions**:
- Reload extension
- Hard refresh page (Ctrl+Shift+R)
- Disable other extensions temporarily
- Check console for specific errors

---

#### Issue 2: Reminders Not Saving

**Symptoms**: Clicking "Set Reminder" doesn't save or shows error.

**Debugging Steps**:
1. Open console during save attempt
2. Check background worker console
3. Verify storage access:
   ```javascript
   chrome.storage.local.get(null, (data) => console.log(data))
   ```

**Possible Causes**:
- Storage permission not granted
- Storage quota exceeded
- Background worker not running

**Solutions**:
- Check permissions in manifest
- Clear storage if quota exceeded
- Reload extension to restart worker

---

#### Issue 3: Notifications Not Appearing

**Symptoms**: Alarm fires but no notification shows.

**Debugging Steps**:
1. Check background worker console for alarm events
2. Verify Chrome notifications are enabled:
   - System Settings → Notifications → Chrome → Enabled
3. Check notification permission for extension

**Possible Causes**:
- System notifications disabled
- Notification permission not granted
- Background worker crashed

**Solutions**:
- Enable system notifications
- Check notification permission in Chrome settings
- Restart extension

---

#### Issue 4: Badge Not Updating

**Symptoms**: Extension badge doesn't show correct count.

**Debugging Steps**:
1. Check background worker console for badge update logs
2. Manually trigger update:
   ```javascript
   // In background worker console:
   chrome.action.setBadgeText({text: "1"})
   ```

**Possible Causes**:
- Badge service not running
- Storage listener not firing
- Badge update logic error

**Solutions**:
- Reload extension
- Check badge service logs
- Verify reminder status in storage

---

#### Issue 5: Tab Won't Close After Setting Reminder

**Symptoms**: Tab doesn't auto-close after 4-second countdown.

**Debugging Steps**:
1. Check console for tab close logs
2. Verify tab close permission
3. Check if popup is blocking tab close

**Possible Causes**:
- Tab service error
- Permission issue
- Chrome security policy blocking close

**Solutions**:
- Manually close tab (extension still works)
- Check TabService implementation
- Verify tabs permission in manifest (if needed)

---

### Debug Mode

Enable verbose logging for troubleshooting:

**Console Filters**:
- Background worker: `[Background]`
- Content script: `[Amazon]`, `[ProductView]`, `[SleepOnIt]`
- Popup: `[Popup]`
- Services: `[AlarmService]`, `[BadgeService]`, `[NotificationService]`

**Useful Console Commands**:

```javascript
// Get all storage data
chrome.storage.local.get(null, (data) => console.log(JSON.stringify(data, null, 2)))

// Get specific keys
chrome.storage.local.get(['thinktwice_reminders', 'thinktwice_products'], console.log)

// Clear all data
chrome.storage.local.clear(() => console.log('Cleared'))

// Get all alarms
chrome.alarms.getAll((alarms) => console.log(alarms))

// Clear specific alarm
chrome.alarms.clear('reminder_<uuid>', (wasCleared) => console.log(wasCleared))

// Get badge text
chrome.action.getBadgeText({}, (text) => console.log(text))
```

---

## Testing Checklist

Use this checklist for comprehensive testing sessions:

### Pre-Release Testing Checklist

#### Setup & Installation
- [ ] Fresh Chrome installation test
- [ ] Development build loads successfully
- [ ] Production build loads successfully
- [ ] No console errors on extension load
- [ ] Service worker initializes correctly

#### Core Functionality
- [ ] ProductView overlay appears on Amazon product pages
- [ ] All three decision paths are accessible
- [ ] Product data extraction works
- [ ] Nudges display correctly and randomly

#### "I Don't Need It" Flow
- [ ] IDontNeedIt view displays correctly
- [ ] Product state saves as "dontNeedIt"
- [ ] Investment option buttons are clickable
- [ ] Back navigation works
- [ ] Close button works

#### "Sleep On It" Flow
- [ ] SleepOnIt view displays correctly
- [ ] All duration options are selectable
- [ ] Reminder saves successfully
- [ ] Alarm is created in background
- [ ] Tab auto-closes after setting reminder
- [ ] Notification appears when alarm fires
- [ ] Badge count updates correctly

#### "I Need It" Flow
- [ ] INeedIt view displays correctly
- [ ] Product state saves as "iNeedThis"
- [ ] Auto-close works correctly

#### Extension Popup
- [ ] Popup opens without errors
- [ ] Pending reminders section displays correctly
- [ ] Achievements section displays correctly
- [ ] Empty state displays when no reminders
- [ ] "I changed my mind" button works
- [ ] Product images load correctly
- [ ] Price calculations are accurate

#### Advanced Flows
- [ ] EarlyReturnFromSleep view appears correctly
- [ ] BackToAnOldFlame view appears correctly
- [ ] Celebration screens display correctly
- [ ] Auto-close timers work correctly

#### Notifications & Alarms
- [ ] Notifications appear on time
- [ ] Notification content is correct
- [ ] Clicking notifications works
- [ ] Dismissing notifications works
- [ ] Alarms persist after browser restart

#### Badge Counter
- [ ] Badge shows correct count
- [ ] Badge updates when reminders fire
- [ ] Badge updates when reminders dismissed
- [ ] Badge disappears when count is zero

#### Data Persistence
- [ ] Reminders persist across sessions
- [ ] Products persist across sessions
- [ ] Product states are tracked correctly
- [ ] Reminder states are tracked correctly
- [ ] Storage handles multiple reminders

#### Error Handling
- [ ] Non-product Amazon pages handled gracefully
- [ ] Products without price work correctly
- [ ] Products without images work correctly
- [ ] Storage errors are caught and reported
- [ ] Background worker crashes are recoverable

#### Performance
- [ ] Extension starts quickly (< 100ms)
- [ ] Overlay appears quickly (< 500ms)
- [ ] Popup opens quickly (< 300ms)
- [ ] Memory usage is reasonable (< 30 MB with 100 reminders)
- [ ] No memory leaks detected

#### Security & Privacy
- [ ] Only required permissions are used
- [ ] No sensitive data is stored
- [ ] No external network requests
- [ ] Data is isolated per profile
- [ ] Data deletion works (uninstall)

#### Cross-Browser/OS Testing
- [ ] Chrome latest stable (Linux)
- [ ] Chrome latest stable (Windows) - if available
- [ ] Chrome latest stable (macOS) - if available
- [ ] Notifications work on all OS platforms

#### Final Checks
- [ ] All console errors resolved
- [ ] No TODO or FIXME comments in production code
- [ ] Code is linted (npm run lint)
- [ ] Code is formatted (npm run format)
- [ ] README is up to date
- [ ] Documentation is complete

---

## Test Results Documentation

### Test Report Template

Use this template to document test results:

```markdown
# ThinkTwice Test Report

**Test Date**: YYYY-MM-DD  
**Tester**: [Your Name]  
**Extension Version**: [Version Number]  
**Chrome Version**: [Chrome Version]  
**Operating System**: [OS and Version]  
**Build Type**: Development / Production

## Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Skipped: [Number]

## Test Results

### Test Suite: [Name]

#### Test Case: [Test ID and Name]
- **Status**: ✅ Pass / ❌ Fail / ⏭️ Skip
- **Notes**: [Any observations or issues]
- **Screenshots**: [Link if applicable]

## Critical Issues
[List any blocking or critical issues found]

## Minor Issues
[List any non-blocking issues]

## Recommendations
[Any suggestions for improvements]

## Conclusion
[Overall assessment of extension quality and readiness]
```

---

## Continuous Testing

### Automated Testing Recommendations

While this guide focuses on manual testing, consider implementing:

1. **Unit Tests**: Test utility functions (productExtractor, storage operations)
2. **Integration Tests**: Test message passing, storage persistence
3. **E2E Tests**: Use Playwright or Puppeteer to automate user flows
4. **Visual Regression Tests**: Use Percy or similar to catch UI changes

### CI/CD Integration

Consider adding these checks to GitHub Actions or similar:

```yaml
# Example workflow
- Run linting (npm run lint)
- Run formatting check (npm run format:check)
- Build extension (npm run build)
- Run unit tests (if implemented)
- Upload build artifacts
```

---

## Appendix

### Useful Resources

- **Chrome Extension Documentation**: https://developer.chrome.com/docs/extensions/
- **Plasmo Framework Docs**: https://docs.plasmo.com/
- **Chrome Extension Samples**: https://github.com/GoogleChrome/chrome-extensions-samples
- **Testing Chrome Extensions**: https://developer.chrome.com/docs/extensions/mv3/tut_debugging/

### Glossary

- **Content Script**: JavaScript injected into web pages
- **Background Service Worker**: Extension's background process
- **Popup**: UI that appears when clicking extension icon
- **Alarm**: Chrome API for scheduled events
- **Badge**: Number/text overlay on extension icon
- **Storage**: Chrome's local storage API for extensions
- **Manifest V3**: Latest Chrome extension manifest version

---

**Document Version**: 1.0  
**Last Updated**: November 2, 2025  
**Author**: Testing Documentation Team

---

## Quick Start Testing (5-Minute Smoke Test)

For quick validation, run these essential tests:

1. ✅ Load extension → No errors
2. ✅ Visit Amazon product → Overlay appears
3. ✅ Click "Sleep on it" → Select "1 minute" → Set reminder
4. ✅ Wait 1 minute → Notification appears
5. ✅ Click extension icon → Reminder shows in popup
6. ✅ Click "I changed my mind" → Product page opens

If all pass, extension is working at a basic level. Proceed with comprehensive testing for production release.

