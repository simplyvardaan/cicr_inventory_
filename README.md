<div align="center">

<img src="./logo.png" width="90" alt="CICR Logo" />

# CICR Inventory Hub

**Creative & Innovative Cell in Robotics — Hardware Allocation & Laboratory Vault System**

Track, reserve, and deploy microcontrollers, sensors, actuators, and power electronics from JIIT's robotics laboratory vault with a modern full-stack web platform: **React 18 + TypeScript + Vite**, **Tailwind CSS**, **Supabase (PostgreSQL)** real-time engine, **Dual Superadmin Security**, and **Real-Time Requisition Telemetry**.

[![Live Demo](https://img.shields.io/badge/LIVE-cicr--inventory.vercel.app-00f0ff?style=for-the-badge&logo=vercel&logoColor=white)](https://cicr-inventory.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GITHUB-cicr__inventory_-bd00ff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/simplyvardaan/cicr_inventory_)
[![Database](https://img.shields.io/badge/DATABASE-Supabase%20PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Table of Contents

- [System Overview](#system-overview)
- [System Architecture](#system-architecture)
- [Core Features & Platform Capabilities](#core-features--platform-capabilities)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Documentation & Deep Dive Specifications](#documentation--deep-dive-specifications)
- [Mentors & Core Team](#mentors--core-team)

---

## System Overview

CICR Inventory Hub is the official digital hardware vault for the Creative & Innovative Cell in Robotics (CICR) at Jaypee Institute of Information Technology (JIIT), Sector 128, Noida. The platform manages the entire lifecycle of laboratory equipment, including inventory tracking, student hardware loan requisitions, administrative clearance verification, return logging, and activity audits across 172+ physical assets.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Vite + React 18 SPA)"]
        UI["Modern UI / UX Engine"]
        TopNav["Floating Top Navbar & Theme Toggle"]
        Vault["Component Vault & Request Cart"]
        Clearance["Requisition Clearance Portal"]
        AdminHub["Admin Control Center & 7-Day Audit"]
        TeamShowcase["macOS Window Team Showcase"]
        Profile["2-Box Locked Operator Profile"]
        ClockHUD["Airport Matrix Live 24h Clock"]
    end

    subgraph State["Reactive Context Layer"]
        AuthCtx["AuthContext (Dual Superadmin Guard)"]
        InvCtx["InventoryContext (Auto-Sync 1.5s)"]
        ThemeCtx["ThemeContext (Dark #07070a / Light #f8fafc)"]
        ToastCtx["ToastContext (Real-Time Feedback)"]
    end

    subgraph Cloud["Primary Cloud Database (Supabase)"]
        AuthService["Supabase Auth Service"]
        ProfilesTable["profiles (Role & Identity)"]
        InventoryTable["inventory_items (172+ Lab Assets)"]
        BorrowTable["borrow_requests (Requisition Flow)"]
        LogsTable["activity_logs (7-Day Telemetry)"]
    end

    subgraph CDN["Production Edge Hosting"]
        Vercel["Vercel Edge Network (SPA Routing & Proxy)"]
    end

    Client --> State
    State --> Cloud
    Client --> Vercel
```

---

## Core Features & Platform Capabilities

### 1. Dual Superadmin & Institutional Authentication Guard
- **Master Admin Whitelist**: Master administrative privileges are strictly locked to verified institutional superadmins:
  - `vardaansaxena096@gmail.com`
  - `cicrinventory@gmail.com`
- **Institutional Email Validation**: Student self-registration requires valid institutional email accounts (`@mail.jiit.ac.in`).
- **Account Clearance Gate**: New member accounts enter `pending` verification status; members cannot request hardware until an administrator authorizes their profile.
- **Cold-Start Resilient Session Hydration**: Synchronous session hydration from `localStorage` eliminates page-refresh authentication blinks.
- **Zero Stuck Authentication**: Dedicated local form submission state prevents login buttons from hanging on "Authenticating...".

### 2. Multi-Tier Requisition Clearance Portal
- **Admin Clearance Gate**: Members stage hardware requisitions; components cannot be issued or collected without verified administrative approval.
- **Interactive Action Presets**: Administrators can approve requisitions with collection instructions (locker bay, rack location) or reject with explanatory feedback.
- **Hardware Return Workflow**: Borrowers return issued items; returned hardware is physically inspected and verified by administrators before inventory capacity is restored.
- **Optimistic 1.5-Second Auto-Sync**: Background polling ensures newly approved or returned hardware reflects across all active devices in 1-2 seconds without manual page refreshes.

### 3. Component Vault (172+ Robotics Hardware Assets)
- **Comprehensive Laboratory Inventory**: 172 real robotics components categorized across five hardware bays:
  - **Microcontrollers & SBCs**: Arduino Uno/Mega/Nano, ESP32, ESP8266, Raspberry Pi 4/Zero, STM32 Nucleo, Teensy 4.1.
  - **Sensors & Modules**: Ultrasonic HC-SR04, PIR Motion, MPU-6050 Gyro, LiDAR TF-Luna, GPS NEO-6M, Color TCS3200, Load Cells.
  - **Actuators & Motors**: NEMA 17 Steppers, MG996R Servos, 12V High-Torque DC Motors, TB6600 Drivers, L298N Modules.
  - **Power & Energy**: 3S LiPo 2200mAh, Step-Down Buck Converters (LM2596), 18650 Battery Shields, 12V 5A Industrial Adapters.
  - **Tools & Equipment**: Digital Multimeters, TS100 Soldering Kits, Logic Analyzers, Jumper Bundles, Breadboard Workbenches.
- **Standardized Reserve Logic**:
  - **In Stock**: Available quantity greater than or equal to 50% of total allocation.
  - **Low Reserves**: Available quantity strictly less than 50% and greater than 0 (triggers warning indicator exclusively for administrators).
  - **Depleted**: Available quantity equals 0.
- **Removed "Min Threshold"**: Eliminated ambiguous threshold metrics; stock health is directly and transparently computed from live physical counts.

### 4. Scoped Request Cart
- **Inventory-Only Visibility**: The Request Cart button in the top navbar is strictly and exclusively rendered when viewing the Component Vault inventory page.
- **Real-Time Badge Telemetry**: Displays the current staging count with live badge updates.
- **Multi-Item Loan Requests**: Stage multiple hardware items and dispatch a unified loan request with project title, purpose, and return timeline.

### 5. Two-Box Locked Operator Profile
- **Two Distinct Side-by-Side Modules**:
  - **Left Box (Operator Identity)**: High-resolution profile avatar, full name, role badge (`ADMIN` / `LEAD` / `MEMBER`), and biography.
  - **Right Box (Institutional Credentials)**: Security-locked, tamper-proof fields for Email Address, Enrollment Number, and Contact Number.
- **Security-Locked Notice**: Clear indicators informing operators that verified institutional credentials can only be amended by master superadmins.

### 6. macOS Window Team Showcase
- **macOS Window Frame**: Window title bar with colored traffic light controls (`#ff5f56`, `#ffbd2e`, `#27c93f`), file moniker (`~/[filename]`), and role tag.
- **Role Hierarchy**:
  - **Mentor**: **Gunjan Pal** — Project Mentor & Technical Advisor
  - **Developers**: **Vardaan Saxena**, **Samiksha Jhunjhunwala**, **Mohammad Arsh**
- **Dynamic Role Filter Tabs**: Switch seamlessly between `All Members (4)`, `Mentor (1)`, and `Developers (3)`.
- **Radiant Gradient Glow Ring**: Highlights the active member with amber (Mentor) or purple/blue (Developer) glows.
- **Verified Social Badges**: Touch-friendly, high-contrast action pills for LinkedIn, GitHub, and personal portfolio.

### 7. Live Airport Matrix Clock HUD
- **Real-Time 24h Departures Cockpit**: Mechanical split-flap matrix clock displaying New Delhi (IST) local time with live seconds update.
- **Ambient Greeting**: Dynamic greeting ("Good morning", "Good afternoon", "Good evening") customized to the operator's verified name.

### 8. Dual Theme Engine (LiquidToggle)
- **Deep Cyber Dark Mode**: `#07070a` deep obsidian background, neon purple accents, emerald stock badges, and crisp white typography.
- **Crisp Light Mode**: `#f8fafc` soft slate background, royal blue accents, high-contrast black headers, and dark emerald indicators.
- **Zero Transparency Bleed**: Solid notification panels, modals, and tables eliminating visual clipping.

---

## Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling & Design** | Tailwind CSS 3, Custom Cyberpunk CSS Tokens, Lucide React Icons |
| **Animation & VFX** | Framer Motion, CSS Keyframe Animations |
| **Primary Database & Auth** | Supabase (PostgreSQL 15), Supabase Auth, Row-Level Security (RLS) |
| **Session & State Management** | React Context (Auth, Inventory, Theme, Toast), Synchronous LocalStorage Hydration |
| **Deployment & Hosting** | Vercel (Edge SPA Routing, API Rewrites, SSL) |

---

## Repository Structure

```text
cicr_inventory_/
├── public/                     # Static production assets
│   ├── cicr-logo.jpg           # Official CICR crest
│   ├── logo.png                # Transparent GitHub logo
│   └── images/team/            # Roster photographs (gunjan, vardaan, samiksha, arsh)
├── src/
│   ├── assets/                 # Component assets & icons
│   ├── components/
│   │   ├── auth/               # LoginForm, SignupForm, AuthModal
│   │   ├── common/             # CicrLogo, Toast, Badge
│   │   ├── dashboard/          # TopNavbar, DashboardOverview, ComponentVaultView,
│   │   │                       # RequisitionsView, AdminHubView, MeetTheDevelopers,
│   │   │                       # OperatorProfileView, CategoryDistribution, StatsOverview
│   │   ├── inventory/          # AddEditItemModal, ItemDetailModal, RequestCartModal
│   │   ├── layout/             # BottomNavbar, AppSidebar, SchemaNoticeModal
│   │   ├── profile/            # ChangePasswordModal, UserProfile
│   │   ├── requests/           # RequestsList (Requisition queues)
│   │   └── ui/                 # airport-matrix-clock, liquid-toggle, notification-bell
│   ├── context/
│   │   ├── AuthContext.tsx     # Institutional auth, superadmin whitelist, session hydration
│   │   └── InventoryContext.tsx# 1.5s auto-sync, 172-item CRUD, borrow & return dispatches
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client + admin service-role key fallbacks
│   │   ├── sampleData.ts       # 172 authentic robotics hardware components
│   │   └── theme/              # useTheme hook (dark / light persistence)
│   ├── types/
│   │   └── inventory.ts        # TypeScript interfaces (InventoryItem, BorrowRequest, etc.)
│   ├── App.tsx                 # Root router, ErrorBoundary, branded pulse loader
│   ├── index.css               # Tailwind directives & theme variables
│   └── main.tsx                # React DOM mounting
├── scripts/                    # Local maintenance and audit utilities
├── AGENT.md                    # AI agent guidelines, constraints & system protocols
├── CHANGELOG.md                # Official Semantic Versioning release notes
├── DEEPDIVE.md                 # Technical deep dive, telemetry logs & version registry
├── LICENSE                     # MIT License (Copyright 2026 CICR)
├── package.json                # Project dependencies & npm scripts (v2.18.4)
├── README.md                   # System documentation & architectural reference
├── SECURITY.md                 # Security assessment & penetration test report
├── tailwind.config.js          # Tailwind custom palette & animations
├── tsconfig.json               # TypeScript compiler configuration
├── vercel.json                 # Vercel SPA routing & API proxy rules
└── vite.config.ts              # Vite bundle configuration
```

---

## Getting Started & Local Setup

### Prerequisites
- Node.js: `>= 18.0.0`
- npm or pnpm
- Git

### Installation
```bash
# 1. Clone repository
git clone https://github.com/simplyvardaan/cicr_inventory_.git
cd cicr_inventory_

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## Environment Variables

Create a `.env` file in the project root. These public Supabase values are also
the names to use in Vercel project settings:

```env
# Supabase public configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-only secrets
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

The browser sends database requests through `/api/db`, which uses Supabase Auth and Supabase PostgREST with the configured server-side service key.

### Local endpoint audit

With the local development server running, probe every serverless API handler
and append redacted JSONL results to `SECURITY-AUDIT-ENDPOINTS.jsonl`:

```powershell
python scripts\audit_endpoints.py
```

The probe defaults to loopback, uses validation-oriented payloads, truncates
responses, and refuses non-local targets unless `--allow-external` is explicitly
provided.

### 4. Configure the Supabase schema

Run [supabase_schema.sql](./supabase_schema.sql) in the Supabase SQL Editor.
The schema is safe to rerun because existing RLS policies are replaced.

### Email notifications

Email notifications are disabled. The application does not configure or use an
SMTP provider.


### 5. Run Development Server
```bash
npm run dev
```
Run `npm run dev` for the full local app. It serves the Vite frontend and `/api/*` endpoints natively on `http://localhost:3000`; Vercel is not required for local development.

### 6. Production Build
```bash
npm run build
npm run preview
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key

```

---

## Production Deployment

The platform is optimized for **zero-configuration Vercel deployment**:

1. Push your changes to the `main` branch.
2. Connect your repository to **Vercel**.
3. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel project settings for
   the Production environment, then redeploy.
5. Deployments run on `https://cicr-inventory.vercel.app`.

---

## Documentation & Deep Dive Specifications

For comprehensive technical documentation, refer to the following repository guides:

- [Technical Deep Dive & System Logs](./DEEPDIVE.md) — Complete version release logs from `v1.0.0` to `v2.18.4`, Git tag registry, full PostgreSQL table schemas, 7-day audit telemetry engine, and BOTE capacity analysis.
- [AI Agent Engineering Guidelines](./AGENT.md) — Operational blueprint, design system invariants, role guards, and protocol instructions for AI coding agents.
- [Security Assessment & Penetration Test Report](./SECURITY.md) — Threat model, vulnerability audit findings, defensive patches, and responsible disclosure policy.
- [Codebase Engineering Rules & Architecture Standards](./RULES.md) — Modular architecture rules (no single-file bloat), rich explanatory comments, zero-emoji enforcement, zero-hyphen formatting, debuggability protocol, and MAJOR.MINOR.BUGS semver specification.

---

## Mentors & Core Team

### Project Mentor & Technical Advisor
* **Gunjan Pal** : Project Mentor

### Core Engineering Team
* **Vardaan Saxena**
* **Samiksha Jhunjhunwala**
* **Mohammad Arsh**

---

<div align="center">

**Copyright 2026 CICR Inventory Hub : Creative & Innovative Cell in Robotics, JIIT Noida**

[![Visit Live Platform](https://img.shields.io/badge/VISIT-VAULT-00f0ff?style=for-the-badge)](https://cicr-inventory.vercel.app/)

</div>
