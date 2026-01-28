# Workflow: "Close and Pause"

This document describes the workflow triggered when a user clicks the closing (X) button in the header of the ThinkTwice extension.

## Summary

The "Close" action does not just hide the overlay; it presents a menu allowing the user to either close the extension for the current tab session or "snooze" the extension globally for a set duration (1 hour, 1 day, or 5 minutes in debug mode).

## Step-by-Step Flow

### 1. User Interaction

- **Trigger**: User clicks the close (X) button in the [Header](file:///home/verte/Desktop/Thinktwice/plugin-3/components/ui/Header.tsx) component.
- **Component**: [ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx)
- **Action**: Calls `handleCloseClick`, which sets `showPauseMenu(true)`.

### 2. Pause Menu Overlay

- **Component**: [PauseMenu.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/components/ui/PauseMenu.tsx) is rendered as a modal overlay.
- **Options**:
  - **Close for now**: Just closes the overlay for this tab session.
  - **Pause for 1 hour**: Snoozes the extension globally for 1 hour.
  - **Pause for 1 day**: Snoozes the extension globally for 24 hours.
  - **Pause for 5 minutes (Debug only)**: Available only in development mode.
  - **Cancel**: Closes the menu and returns to the product view.

### 3. Selection & Storage Logic

The user's choice is processed by `handlePauseMenuSelect` in `ProductView.tsx`:

#### Case: "Close for now"

- **Logic**: Calls `onClose()`.
- **Result**: Sets `pluginClosed(true)` in the current tab session state. The overlay disappears for this specific tab until the tab is reloaded or the session is reset.

#### Case: "Pause for [duration]"

- **Logic**:
  - Calculates the expiration timestamp (`Date.now() + duration`).
  - Calls `storage.setGlobalSnooze(snoozedUntil)`.
  - Calls `onClose()`.
- **Storage**: Updates the `thinktwice_snooze` key in local storage.
- **Result**: The extension will remain hidden on **all** product pages until the snooze expires.

### 4. Continuous Visibility Check

- **Hook**: [useProductPageState.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/hooks/useProductPageState.ts)
- **Logic**: During every page load and on storage change, the extension checks:
  ```typescript
  const snoozedUntil = await storage.getGlobalSnooze()
  if (snoozedUntil && snoozedUntil > Date.now()) {
      setHideOverlay(true)
      return
  }
  ```
- **Cleanup**: If the snooze has expired, the hook automatically clears it and allows the overlay to appear again.

## Related Files

- [views/ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx) - Orchestrates the pause menu and storage calls.
- [components/ui/PauseMenu.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/components/ui/PauseMenu.tsx) - The modal UI for choosing pause duration.
- [hooks/useProductPageState.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/hooks/useProductPageState.ts) - Respects the global snooze setting during page load.
- [storage/index.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/storage/index.ts) - Manages the `thinktwice_snooze` storage key.
