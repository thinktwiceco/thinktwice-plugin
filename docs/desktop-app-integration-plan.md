# ThinkTwice Desktop App Integration Plan

**Created:** January 28, 2026  
**Purpose:** Connect Chrome extension to local Electron desktop application with Agent Forge backend

---

## Overview

Build an Electron desktop application that:

- Runs Agent Forge Go server locally
- Provides AI-powered purchase advice via chat interface
- Receives product data from Chrome extension
- Displays alternatives, savings advice, and purchase analysis

---

## Architecture

```
┌─────────────────────┐
│ Chrome Extension    │
│ (ThinkTwice)        │
└──────────┬──────────┘
           │ Custom Protocol
           │ thinktwice://
┌──────────▼──────────┐
│ Electron Desktop    │
│ ┌─────────────────┐ │
│ │ React Frontend  │ │
│ └────────┬────────┘ │
│          │ HTTP      │
│ ┌────────▼────────┐ │
│ │ Agent Forge     │ │
│ │ Go Server       │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Components

### 1. Agent Forge Server Configuration

**Location:** New repository or subdirectory  
**Technology:** Go, using existing Agent Forge codebase

**Requirements:**

- Single main agent with comprehensive system prompt
- HTTP API endpoints for product analysis
- Conversation persistence for user history
- LLM integration (OpenAI, TogetherAI, or DeepSeek)

**System Prompt:**

```
You are ThinkTwice, a thoughtful purchase decision advisor.

When a user shares a product they're considering:
1. Analyze if they truly need it
2. Suggest alternatives (DIY, refurbished, rental, borrow)
3. Compare value vs. cost
4. Calculate potential savings
5. Explain investment opportunities for saved money
6. Help them make intentional purchasing decisions

Be friendly, non-judgmental, and focus on empowering thoughtful choices.
```

**API Endpoints:**

- `POST /api/chat` - Send product info and user message, receive streaming response
- `GET /api/history` - Retrieve conversation history
- `GET /api/stats` - Get savings statistics

### 2. Electron Application

**Location:** New repository: `thinktwice-desktop`  
**Technology:** Electron, Node.js

**Main Process Responsibilities:**

- Spawn Agent Forge Go binary on startup
- Register custom protocol handler (`thinktwice://`)
- Create application window
- Manage system tray icon
- Handle graceful shutdown

**Files:**

- `main.js` - Electron main process
- `preload.js` - Security bridge between renderer and main
- `package.json` - Dependencies and build config

### 3. React Frontend

**Location:** Inside `thinktwice-desktop/frontend`  
**Technology:** React + TypeScript, Vite

**Features:**

- Chat interface for AI interaction
- Product card display (image, name, price)
- Streaming response rendering
- Savings dashboard
- Purchase history view

**Key Components:**

- `ProductAnalysisView.tsx` - Main view when product received
- `ChatInterface.tsx` - Message input and response display
- `StatsPanel.tsx` - Savings and decision statistics

### 4. Chrome Extension Integration

**Location:** Existing `plugin-3` repository  
**Changes Required:** Minimal

**New Features:**

- Button to "Ask ThinkTwice" on product pages
- Send product data via custom protocol

**Implementation:**

```typescript
// New button handler
async function openThinkTwiceDesktop(product: Product) {
  const url =
    `thinktwice://analyze?` +
    new URLSearchParams({
      productId: product.id,
      name: product.name,
      price: product.price || "0",
      imageUrl: product.image || "",
      url: product.url
    })

  chrome.tabs.create({ url })
}
```

---

## Communication Protocol

### Extension → Desktop App

**Method:** Custom URL Protocol  
**Format:** `thinktwice://analyze?productId=X&name=Y&price=Z&imageUrl=A&url=B`

**Electron Handler:**

```javascript
app.on("open-url", (event, url) => {
  event.preventDefault()
  const params = new URLSearchParams(url.split("?")[1])
  mainWindow.webContents.send("product-received", {
    productId: params.get("productId"),
    name: params.get("name"),
    price: params.get("price"),
    imageUrl: params.get("imageUrl"),
    url: params.get("url")
  })
  mainWindow.show()
})
```

### Frontend → Agent Forge

**Method:** HTTP REST API  
**Format:** JSON

**Example Request:**

```json
POST http://localhost:8000/api/chat
{
  "productId": "B0ABC123",
  "productName": "Wireless Headphones",
  "price": 99.99,
  "message": "Should I buy this?"
}
```

**Response:** Server-Sent Events (SSE) for streaming

---

## Build & Distribution

### Development

```bash
# Start Agent Forge server
cd backend && go run cmd/server/main.go

# Start Electron app
cd thinktwice-desktop && npm run dev
```

### Production Build

1. **Compile Agent Forge:**

   ```bash
   GOOS=darwin GOARCH=arm64 go build -o server-mac
   GOOS=windows GOARCH=amd64 go build -o server.exe
   GOOS=linux GOARCH=amd64 go build -o server-linux
   ```

2. **Package Electron:**

   ```bash
   npm run build
   npm run package  # Creates .dmg, .exe, .AppImage
   ```

3. **Bundle Structure:**
   ```
   ThinkTwice.app/
   ├── Contents/
   │   └── Resources/
   │       └── bin/
   │           └── agentforge-server
   ```

### Installer Size Estimate

- Electron: ~100 MB
- Agent Forge binary: ~15-20 MB
- Frontend assets: ~5 MB
- **Total:** ~120 MB

---

## Cloud Migration Strategy

### Phase 1: Local Only (MVP)

- Everything runs locally
- No external dependencies except LLM API

### Phase 2: Hybrid

- Try local server first
- Fallback to cloud if unavailable
- Sync conversation history

### Phase 3: Full Cloud

- Deploy Agent Forge to cloud service
- Electron becomes optional
- Chrome extension can call cloud directly
- Desktop app provides enhanced features

**Migration Path:** Same Agent Forge codebase deploys to cloud (Fly.io, Railway, AWS)

---

## Security Considerations

1. **Local-only data** - Conversation history stored locally in SQLite
2. **Custom protocol** - Validate all parameters from extension
3. **CORS** - Configure Agent Forge to only accept localhost connections initially
4. **API Keys** - Store LLM API keys securely in Electron's secure storage

---

## Future Enhancements

- Bank account integration (Plaid SDK)
- Automatic deposit of saved money
- Browser notifications from desktop app
- Multi-device sync via cloud
- Product watchlists and price tracking

---

## Success Metrics

- Extension → Desktop handoff works seamlessly
- AI responses stream in real-time
- Conversation history persists across sessions
- User can track savings over time
- App starts quickly (<3 seconds)
