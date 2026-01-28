# Workflow: "Sleep on it"

This document describes the technical and user-facing workflow triggered when a user clicks the "Sleep on it" button in the ThinkTwice extension.

## Summary

The "Sleep on it" action allows users to defer a purchase by setting a reminder. It updates the product state to "sleepingOnIt", creates a scheduled reminder and an alarm, and eventually closes the browser tab to help the user step away from the purchase.

## Step-by-Step Flow

### 1. User Interaction (Entry)

- **Trigger**: User clicks the "Sleep on it" button in [ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx).
- **Component**: `ProductView`
- **Action**: Calls `handleSleepOnIt`, which transitions the view to `"sleeponit"`.

### 2. Duration Selection

- **View**: [SleepOnIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/SleepOnIt.tsx) displays several duration options (1 min, 1 hr, 6 hrs, 24 hrs, 3 days, 1 week).
- **Default**: 24 hours.
- **Action**: User selects a duration and clicks "Set Reminder".

### 3. State & Reminder Persistence

- **Logic**: Handled by [ProductActionManager.sleepOnIt](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts).
- **Storage Update**:
  - Saves the product with `state: "sleepingOnIt"`.
  - Creates a `Reminder` object with a generated UUID, `reminderTime` (now + duration), and `status: "pending"`.
- **Alarm**: Calls `ChromeMessaging.createAlarm` to schedule a notification for when the reminder expires.

### 4. Success State

- **UI Update**: `SleepOnIt` view shows a success message: "✓ Reminder saved! Hold tight and remember about the goal!"
- **Location**: `setSaved(true)` triggers the success UI and sets an auto-close timer.

### 5. Automated Tab Closure

- **Trigger**: Once saved, a 4-second timer starts (`autoCloseDelay`).
- **Action**: Calls `ChromeMessaging.closeCurrentTab()`.
- **Fallback**: If tab closure fails (e.g., due to browser restrictions), it simply hides the overlay by calling `onClose`.

## Related Files

- [views/SleepOnIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/SleepOnIt.tsx) - Duration selection and timer.
- [managers/ProductActionManager.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts) - Saves reminder and product state.
- [services/ChromeMessaging.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/services/ChromeMessaging.ts) - Handles alarm creation and tab closure.
