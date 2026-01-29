# Investigation Report: Overlay Not Showing After "I Need It" on Different Product

## Summary

After clicking "I need it" on one product and navigating to a different product, the overlay does not appear. The root cause is that the `useEffect` hook in `useProductPageState.ts` does not re-run when the URL changes because the URL is not tracked in the dependency array.

## Root Cause

### Location
`hooks/useProductPageState.ts` - Lines 53-257

### Problem

The `useEffect` hook that calls `checkForPendingReminder` has the following dependencies:
```typescript
}, [getProductId, marketplace, tabIdSession])
```

However, `checkForPendingReminder` reads `window.location.href` inside the effect:
```53:62:hooks/useProductPageState.ts
  useEffect(() => {
    const checkForPendingReminder = async () => {
      const url = window.location.href
      const productId = getProductId(url)
      console.log(
        "[useProductPageState] Extracted productId:",
        productId,
        "from url:",
        url
      )
```

### Why This Causes the Bug

1. **Initial State**: When Product A loads, `checkForPendingReminder` runs, detects "I need it" was clicked, and sets `hideOverlay: true`.

2. **Navigation**: User navigates to Product B (different product ID). The URL changes, but:
   - The React component doesn't unmount (single-page navigation)
   - The `useEffect` dependencies (`getProductId`, `marketplace`, `tabIdSession`) haven't changed
   - The effect doesn't re-run
   - `checkForPendingReminder` is never called for Product B

3. **Stale State**: The `hideOverlay` state remains `true` from Product A, so the overlay doesn't appear for Product B.

4. **Storage Listener Limitation**: The storage change listener only triggers when storage changes, not when the URL changes. Since navigating to a different product doesn't change storage (it's the same storage, just a different product key), the listener doesn't fire.

## Evidence

### Code Analysis

1. **Missing URL Dependency**: The `useEffect` at line 257 doesn't include `window.location.href` or the extracted `productId` in its dependency array.

2. **Storage Listener Only Watches Storage**: The storage listener (lines 202-246) only re-checks when storage changes, not when the URL changes:
```202:215:hooks/useProductPageState.ts
    const storageListener = (
      changes: chrome.storage.StorageChange,
      areaName: string
    ) => {
      // Only watch local storage changes
      if (areaName !== "local") return

      // Check if products storage changed - this might include our product
      if ("thinktwice_products" in changes) {
        console.log(
          "[useProductPageState] Products storage changed, re-checking..."
        )
        checkForPendingReminder()
      }
```

3. **Product-Specific State Check**: The code correctly checks per-product state (line 100), but this check never runs for the new product because the effect doesn't re-run:
```99:112:hooks/useProductPageState.ts
          // First check if this product has "iNeedThis" state - if so, hide overlay
          const existingProduct = await storage.getProduct(compositeKey)
          console.log(
            "[useProductPageState] Existing product state:",
            existingProduct?.state
          )
          if (existingProduct?.state === ProductState.I_NEED_THIS) {
            console.log(
              "[useProductPageState] Product has iNeedThis state - hiding overlay"
            )
            setHideOverlay(true)
            setCurrentView(null)
            return
          }
```

### Test Evidence

The failing test in `tests/e2e/ineedit.spec.ts` (lines 130-191) reproduces this exact scenario:
1. Navigate to Product A (PRIMARY)
2. Click "I need it"
3. Wait for celebration to close
4. Navigate to Product B (SECONDARY)
5. Overlay should appear but doesn't

## Impact

- **User Experience**: Users cannot use the extension for multiple products in a single browsing session
- **Workaround Required**: Users must refresh the page or restart the browser to see the overlay on other products
- **Functionality Loss**: The extension's core functionality (showing overlay for new products) is broken after the first "I need it" click

## Recommended Fix

Add URL/productId tracking to the `useEffect` dependency array or implement a URL change listener. Options:

1. **Track productId in state and include in dependencies**:
   - Extract productId and store it in state
   - Include productId in the dependency array
   - Re-run effect when productId changes

2. **Add URL change listener**:
   - Listen for `popstate` events (browser back/forward)
   - Listen for `pushstate`/`replacestate` events (programmatic navigation)
   - Call `checkForPendingReminder` when URL changes

3. **Use Plasmo's navigation tracking** (if available):
   - Check if Plasmo provides hooks or utilities for tracking URL changes in content scripts

## Related Files

- `hooks/useProductPageState.ts` - Main hook with the bug
- `contents/amazon.tsx` - Content script that uses the hook
- `tests/e2e/ineedit.spec.ts` - Failing test case
- `storage/types.ts` - Storage types for product states

## Notes

- The overlay correctly prevents reappearing for the same product after "I need it" is clicked (expected behavior)
- The bug only affects navigation to different products
- The celebration view and auto-close functionality work correctly
- The product state is correctly stored per-product (not globally), but the check never runs for new products

