# ThinkTwice - User Flows Analysis

## Application Overview

**ThinkTwice** is a Chrome browser extension designed to help users make better purchasing decisions on Amazon by providing behavioral nudges and alternative considerations before completing a purchase. The extension intervenes at the product page level, presenting users with thoughtful prompts to reconsider their purchase decisions.

## Technology Stack

- **Framework**: Plasmo (Chrome Extension Framework)
- **UI Library**: React 19
- **Content Script**: Injected on Amazon product pages
- **Manifest**: Chrome Extension Manifest V3

---

## Current Implementation Status

### ✅ Implemented Flows

#### 1. Core Product Intervention Flow

**Entry Point**: User visits an Amazon product page (`/dp/` or `/gp/product/` URLs)

**Flow**:

1. Extension detects Amazon product page
2. Displays overlay card with:
   - ThinkTwice branding
   - Random behavioral nudge (from 3 mock nudges)
   - Three action buttons:
     - "I don't really need it" (primary)
     - "Sleep on it" (tertiary)
     - "I need it" (tertiary)

**Components Used**:

- `ProductView.tsx` - Main intervention screen
- `Nudge.tsx` - Random nudge display
- `Card.tsx`, `Button.tsx`, `Header.tsx` - UI components

---

#### 2. "I Don't Need It" Flow

**Entry Point**: User clicks "I don't really need it" button

**Flow**:

1. Navigate to IDontNeedIt view
2. Display:
   - Congratulatory message
   - Star icon
   - Question: "Do you want to grow the money you saved?"
   - Three investment option buttons (all currently non-functional):
     - "Start investing"
     - "Learn how"
     - "Maybe later"
   - Info box with retirement savings fact
3. Can navigate back to ProductView

**Status**: ⚠️ **Partially Implemented** - UI exists but action handlers only log to console

**Components Used**:

- `IDontNeedIt.tsx`
- Star icon
- Lightbulb icon (info section)

---

#### 3. "Sleep On It" Flow

**Entry Point**: User clicks "Sleep on it" button

**Flow**:

1. Navigate to SleepOnIt view
2. Display:
   - Moon icon
   - "Brilliant choice!" message
   - Statistic: "3 out of 4 people change their mind within 24 hours"
3. Can navigate back to ProductView

**Status**: ⚠️ **Partially Implemented** - Shows confirmation but no follow-up system

**Components Used**:

- `SleepOnIt.tsx`
- Moon icon

---

#### 4. "I Need It" Flow

**Entry Point**: User clicks "I need it" button

**Flow**:

1. Navigate to INeedIt view
2. Display:
   - Trophy icon
   - "Trusting yourself is powerful" message
   - "Enjoy your new purchase" subtitle
3. Can navigate back to ProductView

**Status**: ✅ **Complete** (as a simple acknowledgment)

**Components Used**:

- `INeedIt.tsx`
- Trophy icon

---

## ❌ Missing User Flows (To Be Implemented)

### 1. Investment Options Flow (IDontNeedIt)

**Priority**: HIGH

**Missing Implementation**:

- **"Start investing" action**: Should redirect to investment platform or show investment options
- **"Learn how" action**: Should open educational content about investing/saving
- **"Maybe later" action**: Should save decision and allow user to continue browsing

**Suggested Implementation**:

```
- Create investment partner integration or link to educational resources
- Add storage to track "money saved" from avoided purchases
- Create a "saved money" tracker view
- Consider gamification: show total savings over time
```

---

### 2. Alternative Purchase Options Flow

**Priority**: HIGH

**Evidence**: Three icon components exist but are unused:

- `DIYIcon.tsx` (🔧)
- `RefurbishedIcon.tsx` (♻️)
- `RentBorrowIcon.tsx` (🤝)

**Missing Implementation**:
This suggests a planned flow for showing alternatives when user doesn't need the product:

**Suggested Flow**:

```
1. When user clicks "I don't really need it"
2. Before showing investment options, show alternative considerations:
   - "Or consider these alternatives..."
   - DIY Alternative: "Could you make this yourself?"
   - Refurbished Option: "Buy it refurbished and save money"
   - Rent/Borrow: "Could you rent or borrow this instead?"
3. Each option would:
   - Link to relevant marketplaces/resources
   - Show potential cost savings
   - Provide environmental impact information
```

**Implementation Needed**:

- Create AlternativeOptions view component
- Integrate DIY, Refurbished, RentBorrow icon components
- Add routing logic from ProductView or IDontNeedIt view
- Research and integrate relevant APIs/services:
  - Refurbished marketplaces (eBay, BackMarket, Amazon Renewed)
  - Rental services (Rent the Runway, Fat Llama)
  - DIY tutorial platforms (YouTube, Instructables)

---

### 3. Sleep On It - Reminder System

**Priority**: MEDIUM

**Current Gap**: No mechanism to actually remind user after they choose to "sleep on it"

**Missing Implementation**:

- Product tracking storage
- Reminder notification system
- View saved "sleep on it" products
- Time-based notifications

**Suggested Flow**:

```
1. User clicks "Sleep on it"
2. Extension saves:
   - Product ID
   - Product name/image
   - Timestamp
   - Reminder time (default: 24 hours)
3. After 24 hours:
   - Browser notification appears
   - Clicking notification shows saved product
   - User can:
     - Still interested → Link back to product
     - Changed mind → Remove from reminders
     - Wait longer → Snooze for another period
```

**Implementation Needed**:

- Chrome storage API integration
- Chrome alarms API for scheduled notifications
- Chrome notifications API
- RemindersView component to show all pending reminders
- Background service worker to handle alarms

---

### 4. Popup Interface Enhancement

**Priority**: MEDIUM

**Current State**: Popup is just a static placeholder with title and tagline

**Missing Implementation**: Rich popup interface with useful features

**Suggested Flow**:

```
When user clicks extension icon:
1. Show dashboard with:
   - Quick stats: Money saved, purchases avoided
   - Pending reminders (sleep on it items)
   - Recent decisions history
   - Settings access
2. Navigation options:
   - View saved products
   - View decision history
   - Manage reminders
   - Settings
   - About/Help
```

**Implementation Needed**:

- Popup dashboard UI
- Integration with Chrome storage
- Stats calculation and display
- Settings panel
- History view component

---

### 5. Data Persistence & Tracking

**Priority**: HIGH

**Current Gap**: No data persistence - all decisions are lost

**Missing Implementation**:

- User decision tracking
- Product interaction history
- Analytics and insights
- Export data functionality

**Suggested Implementation**:

```
Storage Schema:
- decisions: [{
    productId: string,
    productName: string,
    productImage: string,
    decision: 'need' | 'dont-need' | 'sleep',
    timestamp: number,
    price: number (if available)
  }]
- reminders: [{
    productId: string,
    reminderTime: number,
    status: 'pending' | 'completed' | 'dismissed'
  }]
- stats: {
    totalProductsViewed: number,
    purchasesAvoided: number,
    estimatedMoneySaved: number,
    startDate: number
  }
```

**Implementation Needed**:

- Chrome storage sync API integration
- Data model definitions
- CRUD operations for decisions
- Stats calculation logic
- Privacy considerations and data export

---

### 6. Settings & Customization

**Priority**: LOW

**Missing Implementation**:

- User preferences
- Nudge customization
- Notification settings
- Extension behavior options

**Suggested Settings**:

```
- Nudge Preferences:
  - Enable/disable nudges by theme (environmental, financial, mindfulness)
  - Custom nudges (user-created)
  - Nudge frequency

- Notification Settings:
  - Default reminder duration
  - Notification sound/style
  - Do not disturb hours

- Behavior Options:
  - Auto-show on product pages (toggle)
  - Marketplaces to monitor (Amazon, eBay, etc.)
  - Price threshold (only show for purchases over $X)

- Data & Privacy:
  - View stored data
  - Export data
  - Clear all data
  - Privacy policy
```

**Implementation Needed**:

- Options page (`options.tsx`)
- Settings storage schema
- Settings context/provider
- UI for settings management

---

### 7. Enhanced Nudges System

**Priority**: MEDIUM

**Current Gap**: Only 3 hardcoded nudges, randomly selected

**Missing Implementation**:

- Dynamic nudge selection based on context
- Nudge effectiveness tracking
- Community nudges
- Personalized nudges

**Suggested Enhancement**:

```
1. Context-Aware Nudges:
   - Product category-specific nudges
   - Price-based nudges (luxury vs necessity)
   - User history-based nudges

2. Nudge Library:
   - Expanded set of 50+ nudges
   - Categorized by theme
   - A/B testing different nudges

3. Personalization:
   - Learn which nudges work best for user
   - Adapt messaging based on past decisions
   - User goals integration (e.g., "You're saving for [goal]")

4. Community Features:
   - User-submitted nudges
   - Voting on most effective nudges
   - Share nudges with friends
```

**Implementation Needed**:

- Expanded nudge database
- Context detection logic
- Effectiveness tracking
- Personalization algorithm
- Optional: Backend API for community features

---

### 8. Marketplace Expansion

**Priority**: LOW

**Current State**: Only Amazon is supported

**Evidence**: Code mentions `marketplace: "amazon"` parameter, suggesting planned multi-marketplace support

**Missing Implementation**:

- Support for other e-commerce platforms
- Marketplace-specific adaptations

**Suggested Platforms**:

```
Priority 1:
- eBay
- Walmart
- Target

Priority 2:
- Best Buy
- Etsy
- Shopify stores

Priority 3:
- AliExpress
- Wish
- Regional marketplaces
```

**Implementation Needed**:

- URL pattern matching for each marketplace
- DOM selectors for product info extraction (per marketplace)
- Marketplace-specific manifest permissions
- Testing infrastructure for each platform
- Content script per marketplace

---

### 9. Social/Community Features

**Priority**: LOW

**Potential Implementation**:

- Share decisions with friends
- Group savings challenges
- Social accountability features
- Leaderboards for money saved

**Suggested Flow**:

```
1. User makes decision (e.g., "I don't need it")
2. Option to share achievement:
   - "Share your smart decision"
   - Choose platform (Twitter, Facebook, etc.)
   - Pre-formatted message with stats
3. Optional: Join savings challenge
   - Compete with friends
   - Weekly/monthly goals
   - Group rewards
```

**Implementation Needed**:

- Social sharing integration
- Optional: Backend service for challenges
- Privacy controls
- Community guidelines

---

### 10. Close/Dismiss Behavior

**Priority**: HIGH

**Current Gap**: Close button in ProductView has empty handler `() => {}`

**Missing Implementation**: What happens when user closes the overlay?

**Suggested Options**:

```
Option A - Minimal Friction:
- Close overlay, allow user to continue
- Don't show again for this product (session)
- Track as "dismissed" in analytics

Option B - Gentle Persistence:
- Close overlay with delay option
- "Remind me in 5 minutes" option
- Show again on page reload

Option C - User Choice:
- First time: Close normally
- Repeated dismissals: Ask "Don't show for this product?" or "Disable for today?"
- Respect user preference
```

**Implementation Needed**:

- Decide on UX strategy
- Implement close handler
- Add session/persistent storage for dismissed products
- Settings option for auto-show behavior

---

### 11. Product Information Integration

**Priority**: MEDIUM

**Current Gap**: Extension detects product but doesn't use product data

**Missing Implementation**:

- Extract and display product info
- Price-based insights
- Category-based suggestions
- Historical price data

**Suggested Enhancement**:

```
1. Extract from Amazon:
   - Product name
   - Price
   - Category
   - Rating/reviews
   - Prime eligibility

2. Show in overlay:
   - "You're about to spend $[price]"
   - "This [category] item..."
   - Price history graph (if available)
   - Alternative products at lower prices

3. Smart suggestions:
   - "This is more expensive than similar items"
   - "Price has dropped 20% in past month - might drop more"
   - "This is a frequently returned item"
```

**Implementation Needed**:

- DOM scraping utilities for product data
- Data extraction and parsing
- Price history API integration (e.g., CamelCamelCamel, Keepa)
- Product comparison logic
- Enhanced ProductView with product details

---

### 12. Error Handling & Edge Cases

**Priority**: MEDIUM

**Missing Implementation**: Robust error handling

**Needed Error Flows**:

```
1. Product detection failures:
   - Gracefully handle non-standard Amazon URLs
   - Fallback if product ID can't be extracted

2. Storage failures:
   - Handle quota exceeded
   - Sync failures
   - Data corruption recovery

3. API failures (future):
   - Timeout handling
   - Offline mode
   - Rate limiting

4. User experience:
   - Loading states (Loading.tsx component exists but unused)
   - Error messages (Error.tsx component exists but unused)
   - Retry mechanisms
```

**Implementation Needed**:

- Try-catch blocks around critical operations
- Use existing Loading and Error components
- Fallback UI states
- Error reporting/logging (optional)

---

## Implementation Priority Matrix

### Phase 1: Core Functionality (MVP+)

1. ✅ Data persistence and tracking (HIGH)
2. ✅ Close/dismiss behavior (HIGH)
3. ✅ Investment options handlers (HIGH)
4. ✅ Alternative purchase options flow (HIGH)

### Phase 2: User Retention

5. ✅ Sleep on it reminder system (MEDIUM)
6. ✅ Popup interface enhancement (MEDIUM)
7. ✅ Product information integration (MEDIUM)

### Phase 3: Engagement & Polish

8. ✅ Enhanced nudges system (MEDIUM)
9. ✅ Error handling & edge cases (MEDIUM)
10. ✅ Settings & customization (LOW)

### Phase 4: Growth Features

11. ✅ Marketplace expansion (LOW)
12. ✅ Social/community features (LOW)

---

## Technical Debt & Code Quality

### Existing Issues to Address

1. **TypeScript Typing**:
   - Button component lacks proper TypeScript types for props
   - Many components use implicit `any` types

2. **Code Organization**:
   - `hooks/` directory exists but is empty
   - Consider creating custom hooks for:
     - `useStorage` - Chrome storage operations
     - `useProductInfo` - Product data extraction
     - `useReminders` - Reminder management
     - `useStats` - Statistics calculations

3. **Testing**:
   - No test files exist
   - Consider adding:
     - Unit tests for components
     - Integration tests for flows
     - E2E tests for critical paths

4. **Accessibility**:
   - No ARIA labels on interactive elements
   - No keyboard navigation support
   - Screen reader compatibility not considered

5. **Performance**:
   - Product detection runs on every Amazon page (could optimize)
   - No memoization of expensive computations
   - Consider lazy loading components

---

## API & Integration Opportunities

### Recommended External Services

1. **Investment Platforms**:
   - Acorns API (micro-investing)
   - Robinhood API
   - Generic referral links to investment platforms

2. **Price Tracking**:
   - CamelCamelCamel API (Amazon price history)
   - Keepa API (Amazon price tracker)
   - Honey API (coupon and price comparison)

3. **Product Alternatives**:
   - eBay Finding API (refurbished items)
   - Google Shopping API (price comparison)
   - iFixit API (DIY repair guides)

4. **Rental Services**:
   - Fat Llama API (peer-to-peer rental)
   - Rent the Runway API (fashion rental)
   - Tool rental marketplaces

5. **Educational Content**:
   - YouTube API (DIY tutorials)
   - Instructables API (maker projects)
   - Personal finance blogs (RSS feeds)

---

## User Research Needs

### Questions to Answer

1. **User Behavior**:
   - When do users dismiss vs engage with the overlay?
   - Which nudges are most effective?
   - What's the conversion rate for each decision path?

2. **Feature Validation**:
   - Would users actually use investment options?
   - Is 24 hours the right reminder duration?
   - Do users want social features?

3. **Pain Points**:
   - Is the overlay intrusive or helpful?
   - What information is missing from decisions?
   - What would make users trust the extension more?

### Recommended Research Methods

1. User interviews (5-10 users)
2. A/B testing different nudges
3. Analytics on decision patterns
4. User feedback form in extension
5. Beta testing program

---

## Privacy & Ethics Considerations

### Data Collection

- **Minimize data**: Only collect what's necessary
- **Local storage**: Keep data on user's device when possible
- **Transparency**: Clear privacy policy
- **User control**: Easy data export and deletion

### Ethical Design

- **No dark patterns**: Don't manipulate users
- **Opt-in features**: Social features should be optional
- **Honest messaging**: Don't exaggerate savings or benefits
- **No affiliate conflicts**: Disclose any affiliate relationships

### Compliance

- Chrome Web Store policies
- GDPR compliance (for EU users)
- CCPA compliance (for California users)
- Accessibility standards (WCAG 2.1)

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Engagement**:
   - % of product page views that trigger overlay
   - % of overlays that get user interaction
   - Average time spent on overlay

2. **Decision Impact**:
   - % of users who choose "I don't need it"
   - % of "sleep on it" reminders that lead to no purchase
   - Average estimated money saved per user

3. **Retention**:
   - Daily active users (DAU)
   - Weekly active users (WAU)
   - 7-day, 30-day retention rates

4. **Feature Usage**:
   - % of users who use investment options
   - % of users who explore alternatives
   - % of users who set reminders

5. **Quality**:
   - Error rate
   - Average load time
   - User-reported issues

---

## Conclusion

ThinkTwice has a solid foundation with the core intervention flow implemented. The immediate priorities should be:

1. **Complete existing flows**: Implement handlers for investment options and finalize the close behavior
2. **Add persistence**: Without data storage, user decisions are lost - this is critical
3. **Build alternative options**: The DIY/Refurbished/RentBorrow components suggest this was planned and would add significant value
4. **Enhance the popup**: Transform it from a placeholder to a useful dashboard

The extension has potential to grow into a comprehensive conscious consumption tool, but should focus on perfecting core flows before adding advanced features like social sharing or multi-marketplace support.

---

**Document Version**: 1.0  
**Date**: November 2, 2025  
**Author**: Analysis based on codebase review
