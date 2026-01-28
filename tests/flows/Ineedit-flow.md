# Workflow: "I need it"

This document describes the technical and user-facing workflow triggered when a user clicks the "I need it" button in the ThinkTwice extension.

## Summary

The "I need it" action marks the product as a confirmed purchase decision, records this in local storage to prevent the overlay from appearing for this product again, and shows a final confirmation/celebration message.

## Step-by-Step Flow

### 1. User Interaction

- **Trigger**: User clicks the "I need it" button in [ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx).
- **Component**: `ProductView`
- **Action**: Calls `handleINeedIt`.

### 2. State Persistence

- **Logic**: Handled by [ProductActionManager.needIt](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts).
- **Storage Update**:
  - Updates the product state to `iNeedThis` (ProductState.I_NEED_THIS).
- **Side Effects**: If a `reminderId` is provided (e.g., when clicking "I need it" after a "Sleep on it" period), the reminder is deleted and its associated Chrome alarm is cleared.

### 3. View Transition

- **Trigger**: The local state in `amazon.tsx` or `ProductView` transitions to the `"ineedit"` view.
- **Rendering**: The `INeedIt` component is rendered.

### 4. Celebration View

- **Component**: [INeedIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/INeedIt.tsx) renders the [Celebration.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/Celebration.tsx) component.
- **UI Elements**:
  - **Icon**: Trophy icon (`trophyIcon`).
  - **Message**: "Trusting your decision is powerful! 🎉"
  - **Sub-message**: "Enjoy your purchase, you've been thoughtful about it."
- **Behavior**: An `autoCloseDelay` of 4000ms (4 seconds) is set.

### 5. Completion

- **Action**: After 4 seconds, the celebration view calls the `onClose` callback.
- **Result**: The overlay is hidden, and the user can proceed with their purchase on Amazon without further interruption from the extension for this specific product.

## Related Files

- [views/ProductView.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/ProductView.tsx) - Entry point.
- [managers/ProductActionManager.ts](file:///home/verte/Desktop/Thinktwice/plugin-3/managers/ProductActionManager.ts) - Handles state storage and reminder cleanup.
- [views/INeedIt.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/INeedIt.tsx) - View wrapper.
- [views/Celebration.tsx](file:///home/verte/Desktop/Thinktwice/plugin-3/views/Celebration.tsx) - Final feedback UI.
