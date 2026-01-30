# Workflow: "I don't really need it"

This document describes the technical and user-facing workflow triggered when a user clicks the "I don't really need it" button in the ThinkTwice extension.

## Summary

The "I don't really need it" action marks the product as unwanted, records this decision in the local storage, displays a celebratory message to reinforce the positive behavior, and finally closes the extension overlay.

## Step-by-Step Flow

### 1. User Interaction

- **Trigger**: User clicks the "I don't really need it" button in [ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx).
- **Component**: `ProductView`
- **Action**: Calls `handleIDontNeedIt`.

### 2. State Transition (Business Logic)

- **Logic**: The action is handled by [ProductActionManager.dontNeedIt](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts).
- **Storage Update**:
  - Checks if the product already exists in local storage.
  - Updates (or creates) the product entry with `state: "dontNeedIt"`.
- **Location**: `storage.updateProductState(productId, ProductState.DONT_NEED_IT)`.

### 3. View Switch

- **Transition**: The main application in [amazon.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/contents/amazon.tsx) updates its internal state:
  - `localView` is set to `"idontneedit"`.
- **Rendering**: The `IDontNeedIt` component is rendered.

### 4. Celebration View

- **Component**: [IDontNeedIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/IDontNeedIt.tsx) renders the [Celebration.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/Celebration.tsx) component.
- **UI Elements**:
  - **Icon**: Trophy icon (`trophyIcon`).
  - **Message**: "Well done for choosing not to buy! 🎉"
  - **Sub-message**: "Your future self will thank you for being so thoughtful."
- **Behavior**: An `autoCloseDelay` of 4000ms (4 seconds) is set.

### 5. Auto-Close

- **Timer**: After 4 seconds, the celebration triggers tab closure.
- **Action**: Calls `ChromeMessaging.closeCurrentTab()`.
- **Fallback**: If tab close fails, calls `onClose()` to hide the overlay.
- **Result**: The browser tab closes, removing the temptation to purchase. If the user navigates to the same product again in the future, the overlay will appear again (unlike "I need it" which is a terminal state).

## Related Files

- [contents/amazon.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/contents/amazon.tsx) - Main injection and view routing.
- [managers/ProductActionManager.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts) - Handles the storage logic.
- [views/ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx) - Entry point (button source).
- [views/IDontNeedIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/IDontNeedIt.tsx) - View orchestrator for this flow.
- [views/Celebration.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/Celebration.tsx) - Visual reinforcement and auto-close timer.
