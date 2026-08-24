# Aetheria Live-Ops Console (Frontend)

A web-based mission control console for live-ops producers, game designers, and infrastructure reliability engineers. Built with Nuxt 3, Vue 3, Tailwind CSS, and Pinia.

---

## Core Capabilities

- **Multi-Track Synchronized Schedule Matrix**: High-density operational calendar aggregating live events, maintenance windows, build rollouts, and flash discounts across customizable time ranges (24 hours, 7 days, 30 days).
- **Live Event Orchestration**: Schedule recurring in-game events, configure experience/drop rate bonuses, and apply player segment targeting rules.
- **Structured Patch Deployment**: Manage client/server build alignments, configure scheduled maintenance lockouts, and inspect version diff histories.
- **Virtual Economy & Flash Sales**: Coordinate store catalog rotations, adjust currency pricing, and set global purchase quotas.
- **Incident Response & Known Issues**: Triage active gameplay blockers, track cluster impact, and maintain private developer notes.
- **Dedicated Game Server Fleet Telemetry**: Real-time infrastructure monitoring displaying concurrent player loads (CCU), tick rates, network latency, CPU/memory consumption, and traffic draining controls.
- **Operator Access Control**: Role-based interface gating for Admins, Live-Ops Editors, and Read-Only QA Viewers with complete audit log visibility.

---

## Technology Stack

- **Framework**: Nuxt 3 (SSR and Single Page Application routing)
- **UI Component Engine**: Vue 3 with Composition API (`<script setup>`)
- **State Management**: Pinia stores with persistent cookie synchronization
- **Design System**: Tailwind CSS with custom dark mode interface
- **Date Calculation**: `date-fns`
- **Testing**: Vitest with `@vue/test-utils` and JSDOM

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- Backend REST API running at `http://localhost:4000`

### Environment Setup

Create a `.env` file in the client directory based on `.env.example`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
```

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
npm run test
```

---

## Role Permissions Matrix

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system control: provision server nodes, drain traffic, create operator accounts, audit logs. |
| **Live-Ops Editor** | Manage content operations: create/edit events, publish patch notes, adjust shop items, and resolve tickets. |
| **Read-Only Viewer** | Audit and inspection access across all operational matrices and telemetry dashboards. |
