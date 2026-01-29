# Bug Report: Overlay Not Showing for Different Product After "I Need It"

## Summary

After clicking "I need it" on one product and waiting for the celebration to disappear, navigating to a different product does not show the overlay. The overlay should appear for the new product since it's a different product ID.

## Severity

**Medium** - Affects user experience when browsing multiple products in sequence

## Steps to Reproduce

1. Navigate to an Amazon product page (Product A)
2. Wait for the ThinkTwice overlay to appear
3. Click the "I need it" button
4. Wait 4 seconds for the celebration message to disappear
5. Navigate to a different Amazon product page (Product B)
6. Observe that the overlay does not appear

## Expected Behavior

The overlay should appear for Product B since it's a different product from Product A. Each product should be evaluated independently, and clicking "I need it" on one product should not prevent the overlay from showing on other products.

## Actual Behavior

The overlay does not appear when navigating to a different product after clicking "I need it" on the first product.

## Test Case

A test case has been created to reproduce this bug:
- **File**: `tests/e2e/ineedit.spec.ts`
- **Test Name**: `should show overlay for different product after clicking "I need it" on first product`
- **Status**: Currently failing (reproducing the bug)

## Environment

- **Extension Version**: [Current version]
- **Browser**: Chrome
- **Platform**: All platforms

## Technical Details

### Test Configuration

The test uses two different product IDs from `tests/e2e/test-config.ts`:
- **PRIMARY**: `B005EJH6Z4` (Anker PowerCore 10000 Portable Charger)
- **SECONDARY**: `B07BMKXBVW`

### Root Cause Hypothesis

The issue likely stems from one of the following:

1. **State Management**: The extension may be tracking a global state that prevents overlay display after "I need it" is clicked, rather than checking per-product state
2. **Storage Check Logic**: The product state check may be incorrectly evaluating the storage state for the new product
3. **Overlay Initialization**: The overlay initialization logic may not be triggered when navigating to a new product after the previous overlay was dismissed

### Related Files

- `contents/amazon.tsx` - Content script that handles overlay display
- `hooks/useProductPageState.ts` - Hook that manages product page state
- `storage/types.ts` - Storage types for product states

## Impact

- Users cannot use the extension for multiple products in a single browsing session
- After clicking "I need it" on one product, users must refresh the page or restart the browser to see the overlay on other products
- Reduces the extension's effectiveness for users browsing multiple products

## Workaround

- Refresh the page after navigating to a new product
- Close and reopen the browser tab
- Restart the browser

## Notes

- The overlay correctly prevents reappearing for the same product after "I need it" is clicked (this is expected behavior)
- The bug only affects navigation to different products
- The celebration view and auto-close functionality work correctly

