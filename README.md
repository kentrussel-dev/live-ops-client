# Aetheria Live-Ops Console (Frontend)

An enterprise-grade, high-density live operations command center built for game studios, live-ops producers, and backend SRE teams. Engineered with **Nuxt 3**, **Vue 3**, **Tailwind CSS**, and **Pinia**.

---

## ✨ Key Features & Subsystems

1. **Multi-Track Synchronized Timeline**: Visual Gantt-style matrix synchronizing live events, patch deployments, flash sales, and active incidents across time windows (24H, 7D, 30D).
2. **Live Game Events Management**: Interactive scheduler, player segmentation targeting, cluster filtering, and emergency pause/resume controls.
3. **Patch Notes & Diff Tracking**: Structured patch publishing, client/server build matching, and real-time visual diff history.
4. **Shop Catalog & Flash Sales**: Featured rotations, limited-time discounts, stock limits, and batch category updates.
5. **Incident Response & Known Issues Pipeline**: Kanban-style triage board for P0 blockers, affected clusters, and internal engineering notes.
6. **Technical Game Server Fleet Infrastructure**: Real-time dedicated server fleet control plane (CCU capacity, ping RTT, tick rate, CPU/Memory telemetry, traffic draining, and reboot orchestration).
7. **Operator Directory & Audit Trail**: Role-based access control (Admin, Live-Ops Editor, QA Viewer) and immutable activity logs.

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (SSR & Client Hydration)
- **UI Engine**: [Vue 3](https://vuejs.org/) + Composition API (`<script setup>`)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark gaming theme
- **Date Utilities**: `date-fns`
- **Testing**: Vitest + Vue Test Utils (16 automated tests)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Backend API**: Running at `http://localhost:4000`

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
```

### 3. Installation
```bash
npm install
```

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
# Build the production bundle
npm run build

# Preview production build
npm run preview
```

### 6. Automated Testing
```bash
npm run test
```

---

## 🔐 Operator Authentication & Roles

| Role | Access Permissions |
| :--- | :--- |
| **Admin** | Full system control, fleet provisioning/draining, operator account creation |
| **Live-Ops Editor** | Create and edit events, patch notes, shop sales, and resolve tickets |
| **Read-Only Viewer** | QA auditor view access across all live matrices and logs |
