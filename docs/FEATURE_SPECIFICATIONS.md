# TrapKiller: Core Expansion Feature Specifications

This document outlines the complete architectural design, engineering specifications, data flow, and legal compliance guidelines for the three core expansion modules of **TrapKiller**:

1. [WhatsApp Cancellation Bot](#1-whatsapp-cancellation-bot)
2. [Downloadable "Legal Proof of Cancellation" Certificate (PDF)](#2-downloadable-legal-proof-of-cancellation-certificate-pdf)
3. [Chrome / Edge Browser Extension (Manifest V3)](#3-chrome--edge-browser-extension-manifest-v3)

---

## 1. WhatsApp Cancellation Bot

### 1.1 Executive Overview & Purpose
In India and emerging markets, WhatsApp is the primary digital operating system with over 500 million daily active users. Eliminating the friction of visiting a web app or logging into a dashboard drives immediate consumer adoption. Users simply forward a link or send a service name to trigger an autonomous cloud agent, review live screenshots directly inside their WhatsApp chat, and approve the final click with native interactive buttons.

```
┌──────────────┐          Webhook          ┌───────────────────────────┐
│   Consumer   │ ────────────────────────> │ Next.js API               │
│  (WhatsApp)  │ <──────────────────────── │ /api/webhooks/whatsapp    │
└──────────────┘      Screenshot Proof     └─────────────┬─────────────┘
       │                                                 │
       │ Interactive Button (Approve / Abort)            ▼
       └────────────────────────────────────────>  LangGraph Agent Worker
                                                   (Playwright / TinyFish)
```

---

### 1.2 Technical Architecture & API Integration

#### Service Provider
* **Meta WhatsApp Cloud API** (Graph API v21.0) via verified WhatsApp Business Account (WABA).
* High-throughput webhook ingestion running at `src/app/api/webhooks/whatsapp/route.ts`.

#### Inbound Webhook Payload (Message Processing)
1. **URL Detection:** Regex extraction of target domain/URL from incoming user text.
2. **Session Pairing:** The sender's phone number (`wa_id`) maps to `users.phone` or creates a lightweight guest session tied to their WhatsApp identity.
3. **Agent Dispatch:** Asynchronously dispatches `enqueueStart` in `src/server/agent/runner.ts` using TinyFish cloud browser.

```typescript
// Incoming Webhook Contract
export interface WhatsAppIncomingMessage {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts: Array<{ profile: { name: string }; wa_id: string }>;
        messages: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: "text" | "interactive";
          interactive?: {
            type: "button_reply";
            button_reply: { id: string; title: string };
          };
        }>;
      };
    }>;
  }>;
}
```

---

### 1.3 Conversational State Machine & Interactive Templates

```
[User sends link: "https://streamvault.com/account"]
       │
       ▼
[Bot: "🔍 Scanning page for dark patterns..."]
       │
       ▼
[Bot: "⚠️ Found 3 dark patterns (Roach Motel, Confirmshaming). Starting cancellation agent..."]
       │
       ▼ (Agent steps through retention offers screen-by-screen)
       │
[Bot sends Media Message: Live Screenshot of Final Step]
       │
[Bot sends Interactive Quick-Reply Buttons]
┌────────────────────────────────────────────────────────┐
│ 🛑 Final Step: StreamVault demands cancellation confirm │
│ Do you want TrapKiller to make the final click?         │
│                                                        │
│   [ ✅ Yes, Cancel Service ]      [ ❌ Stop & Keep Plan ]   │
└────────────────────────────────────────────────────────┘
       │
       ├─ If "Yes, Cancel Service":
       │   Agent clicks -> Captures confirmation -> Sends final proof image + PDF.
       │
       └─ If "Stop & Keep Plan":
           Agent immediately halts session, clears credentials, and closes browser.
```

---

### 1.4 Safety & Rate Limiting Guardrails
* **Interactive Approval Expiry:** Approval buttons expire after 10 minutes. If no reply is received, the session aborts safely without clicking.
* **Webhook Signature Verification:** Cryptographic validation of `X-Hub-Signature-256` using the app's `WHATSAPP_APP_SECRET`.
* **Media Delivery:** Proof screenshots are uploaded to Supabase Storage with signed 1-hour download URLs sent directly as image messages.

---

## 2. Downloadable "Legal Proof of Cancellation" Certificate (PDF)

### 2.1 Executive Overview & Purpose
When a merchant continues charging a credit card or debit card after cancellation, banks and credit card issuers (HDFC, SBI, ICICI, Visa, Mastercard, Amex) demand verifiable evidence before granting a chargeback. 

TrapKiller generates a cryptographically hashed, legally admissible **"Certificate of Cancellation"** formatted under **Section 65B of the Indian Evidence Act / IT Act 2000** and the **US FTC Click-to-Cancel Rule (16 CFR Part 425)**.

---

### 2.2 Visual Layout & Embedded Content

The certificate is generated as an authoritative single-page A4 PDF containing:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TRAPKILLER ™ CONSUMER PROTECTION AUDIT TRAIL                           │
│  OFFICIAL CERTIFICATE OF SUBSCRIPTION TERMINATION                       │
│  Certificate ID: TK-2026-98421F        Issued: 21 Nov 2026, 13:20 IST   │
├─────────────────────────────────────────────────────────────────────────┤
│  1. TARGET & CONTRACT DETAILS                                           │
│     • Merchant Domain: streamvault.com                                  │
│     • Service Account: user@example.com                                 │
│     • Plan Discontinued: Premium Membership (₹999/month)                │
│     • Final Termination URL: https://streamvault.com/cancel/success     │
│                                                                         │
│  2. VERIFIED EVIDENCE SCREENSHOT (EMBEDDED)                             │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │                                                             │     │
│     │   [ OFFICIAL SCREENSHOT CAPTURED BY AUTONOMOUS AGENT ]      │     │
│     │   "Your subscription has been successfully cancelled.       │     │
│     │    You will not be billed again."                           │     │
│     │                                                             │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  3. CRYPTOGRAPHIC INTEGRITY & AUDIT PROOF                               │
│     • Capture Timestamp: 2026-11-21T07:50:12.482Z                       │
│     • SHA-256 Image Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b9 │
│     • Agent Session ID: 7f83a91b-41c3-4de7-8912-32a89df46123            │
│     • Human Approval Timestamp: 2026-11-21T07:49:58.110Z (Verified)     │
│                                                                         │
│  4. STATUTORY DECLARATION                                               │
│     "This record certifies completion of the merchant's official        │
│      cancellation procedure pursuant to CCPA Dark Pattern Guidelines    │
│      (2023) and FTC Click-to-Cancel Regulations. Any subsequent         │
│      recurring debit constitutes an unauthorized transaction."          │
│                                                                         │
│  [ DIGITAL SEAL / QR CODE TO VERIFY ONLINE ]       TRAPKILLER AUDIT LAB │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Technical Implementation (`src/app/api/cancellations/[id]/certificate/route.ts`)

* **Renderer Engine:** Built using `@react-pdf/renderer` or server-side Puppeteer headless print-to-PDF (`pdf({ format: 'A4', printBackground: true })`).
* **Cryptographic Hashing:**
  ```typescript
  import { createHash } from "node:crypto";

  export function generateProofHash(screenshotBuffer: Buffer, sessionId: string, timestamp: string): string {
    return createHash("sha256")
      .update(screenshotBuffer)
      .update(sessionId)
      .update(timestamp)
      .digest("hex");
  }
  ```
* **Storage & Retrieval:** The PDF is permanently stored under `proofs/{userId}/{sessionId}/certificate.pdf` in Supabase Storage with download headers set to `Content-Disposition: attachment; filename="TrapKiller-Proof-[merchant].pdf"`.

---

## 3. Chrome / Edge Browser Extension (Manifest V3)

### 3.1 Executive Overview & Purpose
A lightweight browser extension brings TrapKiller's intelligence directly to the user's everyday browsing. As consumers navigate checkout pages or account portals, the extension:
1. Passively inspects DOM mutations in real time for banned dark pattern phrases.
2. Injects a non-intrusive warning badge on deceptive UI elements (e.g. countdown timers, pre-selected checkboxes).
3. Provides a single-click button: **"Hand cancellation to TrapKiller Agent"**, opening a side panel where the cloud agent navigates the maze for them.

---

### 3.2 Directory Structure (`extension/`)

```
extension/
├── manifest.json              # Chrome Manifest V3 manifest
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── background/
│   └── service-worker.ts      # Auth token storage, tab communication, API bridge
├── content/
│   ├── detector.ts            # Fast DOM scanner using lightweight phrase tables
│   ├── highlighter.ts         # Highlighting badges & deceptive element markers
│   └── content.css            # Styles for warning tags & floating action button
├── sidepanel/
│   ├── sidepanel.html         # Live agent stream side panel (Chrome 114+)
│   ├── sidepanel.tsx          # Real-time agent status & approval modal
│   └── sidepanel.css
└── popup/
    ├── popup.html             # Quick settings & account status
    └── popup.tsx
```

---

### 3.3 `manifest.json` Specification (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "TrapKiller — Dark Pattern & Auto-Cancel Guard",
  "version": "1.0.0",
  "description": "Detects manipulative dark patterns and autonomously navigates cancellation funnels safely.",
  "permissions": [
    "activeTab",
    "storage",
    "sidePanel"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["content/content.js"],
      "css": ["content/content.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  }
}
```

---

### 3.4 In-Page Detection & Floating Agent Action Button
* **Client-Side Scanner:** Uses a compiled lookup table of regex patterns derived from `src/server/detection/taxonomy.ts` running locally inside the content script (0 network calls, 0 latency).
* **Element Injection:**
  * If a deceptive countdown or confirmshaming phrase is found, inserts a small yellow warning marker:
    `[⚠️ Deceptive Urgency Detected]`
  * On subscription and billing pages (`/account`, `/billing`, `/subscription`, `/manage`), renders a sleek floating pill:
    ```
    ┌────────────────────────────────────────────────────────┐
    │ 🛡️ TrapKiller: Cancellation Maze Detected              │
    │ [ Send Agent to Cancel ]                               │
    └────────────────────────────────────────────────────────┘
    ```
* **Side Panel Handoff:** Clicking "Send Agent to Cancel" opens the Chrome Side Panel (`chrome.sidePanel.open`), connects via WebSocket / SSE to TrapKiller's `/api/agent/[id]/events`, and allows the user to watch the cloud agent execute and approve the final click without leaving their tab.

---

## 4. Integration Roadmap & Implementation Sequence

| Phase | Milestone | Core Deliverables | Target Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **PDF Proof Certificate** | • `/api/cancellations/[id]/certificate` route<br/>• SHA-256 hash generator<br/>• PDF download button in Activity and Dashboard | **Immediate (Week 1)** |
| **Phase 2** | **Browser Extension** | • Manifest V3 workspace<br/>• In-page dark pattern highlighter<br/>• Chrome SidePanel agent monitor | **Sprint 2 (Weeks 2–3)** |
| **Phase 3** | **WhatsApp Bot** | • Meta Cloud API webhook listener<br/>• Interactive approval button templates<br/>• Screenshot proof delivery pipeline | **Sprint 3 (Weeks 3–4)** |

---

## 5. Security, Privacy & Compliance Summary

1. **Zero Credential Retention:**
   Passwords and session cookies used during cancellation runs are kept in volatile memory only and wiped immediately upon session finalization.
2. **Human Authorization Proof:**
   Every generated PDF certificate and WhatsApp interaction logs the exact millisecond and IP/phone identity of the human approval step to prevent non-repudiation disputes.
3. **Indian & Global Regulatory Alignment:**
   Explicitly mapped against:
   * **CCPA (India) Guidelines for Prevention of Dark Patterns (2023)**
   * **US FTC Click-to-Cancel 16 CFR Part 425 (2024/2025)**
   * **EU Digital Services Act (DSA) Article 25 (Deceptive Interfaces)**
