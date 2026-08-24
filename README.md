# Aetheria Live-Ops Console (Frontend)

A web-based mission control console for live-ops producers, game designers, SREs, and QA leads. Built with Nuxt 3, Vue 3, Tailwind CSS, Pinia, and Socket.IO.

---

## Core Capabilities

- **Multi-Track Synchronized Schedule Matrix**: High-density operational calendar aggregating live events, maintenance windows, build rollouts, and flash discounts across customizable time ranges (24 hours, 7 days, 30 days).
- **Real-Time Discuss Hub (`/discuss`)**: Full-screen communication workspace featuring public channels, direct messages with online presence indicators, themed message bubble cards, and real-time delivery receipts (`✓` delivered, `✓✓` seen).
- **Unified Operator Inbox & Notification Popover (`/inbox`)**: Header notification dropdown (`💬`) and centralized inbox streaming assigned tickets, mentions, and system alerts with 1-click deep-linking.
- **Incident Response & Universal Ticket Assignment (`/issues`)**: 4-stage Kanban bug pipeline with dynamic operator assignee selection ("Assign to Me"), automated push notifications, and Kanban card assignee tags.
- **Dedicated Game Server Fleet Telemetry (`/servers`)**: Real-time infrastructure monitoring displaying concurrent player loads (CCU), tick rates, network latency, CPU/memory consumption, and traffic draining controls.
- **Live Event Orchestration (`/events`)**: Schedule recurring in-game events, configure experience/drop rate bonuses, and apply player segment targeting rules.
- **Structured Patch Deployment (`/patches`)**: Manage client/server build alignments, configure scheduled maintenance lockouts, and inspect version diff histories.
- **Virtual Economy & Flash Sales (`/shop`)**: Coordinate store catalog rotations, adjust currency pricing, and execute batch promotion flash sales.
- **8 Custom Telemetry Theme Palettes**: Dark & Light mode support across Tech-Slate, Emerald, Cyberpunk Rose, and Amethyst palettes with persistent local storage.

---

## Technology Stack

- **Framework**: Nuxt 3 (SSR and Single Page Application routing)
- **UI Component Engine**: Vue 3 with Composition API (`<script setup>`)
- **Real-Time Gateway**: `socket.io-client` (WebSocket connection with JWT handshake)
- **State Management**: Pinia stores with reactive state and persistent session synchronization
- **Design System**: Tailwind CSS with custom 8-theme design token engine
- **Date Utilities**: `date-fns`
- **Testing**: Vitest with `@vue/test-utils` and JSDOM (**16 test suites**)

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- Backend REST API & Socket.IO running at `http://localhost:4000`

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Running Tests

```bash
# Run all 16 client tests
npm run test
```

---

## Role Permissions Matrix

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system control: provision server nodes, drain traffic, create operator accounts, audit logs. |
| **Live-Ops Editor** | Manage content operations: create/edit events, publish patch notes, adjust shop items, assign tickets, and communicate in discuss channels. |
| **Read-Only Viewer** | Audit and inspection access across all operational matrices, telemetry dashboards, and inbox feeds. |
