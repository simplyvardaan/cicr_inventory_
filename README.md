<div align="center">

<img src="./logo.png" width="90" alt="CICR Logo" />

# CICR Inventory Hub

**Creative & Innovative Cell in Robotics — Hardware Allocation & Laboratory Vault System**

Track, reserve, and deploy microcontrollers, sensors, actuators, and power electronics from JIIT's robotics laboratory vault with a modern full-stack web platform: **React 18 + TypeScript + Vite**, **Tailwind CSS**, **Supabase (PostgreSQL)** real-time engine, **Neon PostgreSQL** secondary backup failover, **Dual Superadmin Security**, and **Real-Time Requisition Telemetry**.

[![Live Demo](https://img.shields.io/badge/LIVE-cicr--inventory.vercel.app-00f0ff?style=for-the-badge&logo=vercel&logoColor=white)](https://cicr-inventory.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GITHUB-cicr__inventory_-bd00ff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/simplyvardaan/cicr_inventory_)
[![Database](https://img.shields.io/badge/DATABASE-Supabase%20PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Secondary Mirror](https://img.shields.io/badge/SECONDARY-Neon%20PostgreSQL-00e599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![License](https://img.shields.io/badge/LICENSE-MIT-1e2327?style=for-the-badge)](#-license)

</div>

---

## 📑 Table of Contents

- [Version History & Registry](#-version-history--registry)
- [System Architecture](#-system-architecture)
- [Core Features & Platform Capabilities](#-core-features--platform-capabilities)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Database Schema & Real-Time Tables](#-database-schema--real-time-tables)
- [Dual Superadmin & Institutional Auth Guard](#-dual-superadmin--institutional-auth-guard)
- [Requisition Approval Workflow & Clearance Portal](#-requisition-approval-workflow--clearance-portal)
- [Component Vault & Hardware Allocation Logic](#-component-vault--hardware-allocation-logic)
- [Modern UI/UX, Themes & Real-Time Matrix HUD](#-modern-uiux-themes--real-time-matrix-hud)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Production Deployment](#-production-deployment)
- [Project Mentors & Core Engineering Team](#-project-mentors--core-engineering-team)
- [License](#-license)

---

## 📌 Version History & Registry

| Version | Status | Key Milestones & Innovations |
|:---|:---:|:---|
| **v1.0.0** | ✅ Released | Initial prototype, static equipment catalog, and authentication baseline. |
| **v1.5.0** | ✅ Released | Cloud migration to Supabase PostgreSQL, real-time database schema, and student account creation. |
| **v2.0.0** | ✅ Released | **Dual Superadmin Security & 172 Authentic Lab Assets.** Master lock for `vardaansaxena096@gmail.com` & `cicrinventory@gmail.com`; institutional email validation (`@mail.jiit.ac.in`); complete 172-item robotics laboratory inventory. |
| **v2.2.0** | ✅ Released | **React 18 + Vite SPA Transformation.** Modern modular frontend, Airport Matrix live departure clock, dynamic category filtering, real-time toast alerts, and dark-theme aesthetic. |
| **v2.5.0** | ✅ Released | **Requisition Clearance Portal & Activity Stream.** Requisition workflow requiring administrator clearance before hardware can be collected; live activity audit logs; responsive bottom navigation dock. |
| **v2.7.0** | ✅ Released | **Database Purge, Master Whitelist & Tamper-Proof Profiles.** Test data wiped; vault reset to authentic inventory; 2-box side-by-side operator profile with security-locked credentials (email, enrollment number, contact). |
| **v2.10.0** | ✅ Released | **Secondary Database Redundancy & 1.5s Auto-Sync.** Automated backup mirror with Neon PostgreSQL; 1.5-second background auto-synchronization; permanent notification read state persistence in localStorage. |
| **v2.12.0** | ✅ Released | **Dual Theme Engine & High-Contrast Visual Polish.** High-contrast Cyber Dark (`#07070a`) and Clean Light (`#f8fafc`) theme switch with LiquidToggle; complete elimination of faint text and dark container patches. |
| **v2.13.0** | ✅ Released (current) | **Cyber Calendar Picker, KPH Team Showcase, <50% Low Reserves & UI Perfection.** Interactive cyber calendar picker with preset shortcuts; macOS terminal window team showcase (Gunjan, Vardaan, Samiksha, Arsh); top-navbar cart strictly scoped to inventory; 100% full stock vault restock; admin-only warnings; branded cold-start pulse loader; and official MIT License. |

> **Current Active Release: v2.13.0** — Verified on production with live database sync across Vercel frontend, Supabase PostgreSQL, and Neon secondary redundancy.

### 🏷️ Official Version Registry (Git Tags)

| Version | Git Tag | Release Milestone | Focus Area |
|:---|:---|:---:|:---|
| **v1.0.0** | `v1.0.0` | Baseline MVP | Hardware catalog foundation |
| **v1.5.0** | `v1.5.0` | Database Evolution | Supabase PostgreSQL migration |
| **v2.0.0** | `v2.0.0` | Institutional Security | Dual superadmins & 172 lab assets |
| **v2.2.0** | `v2.2.0` | React SPA & Clocks | Vite + React 18, Airport Matrix HUD |
| **v2.5.0** | `v2.5.0` | Clearance Workflow | Admin requisition portal & audit ledger |
| **v2.7.0** | `v2.7.0` | Security Hardening | Locked credentials & database purge |
| **v2.10.0** | `v2.10.0` | Redundancy & Sync | Neon PostgreSQL mirror, 1.5s auto-sync |
| **v2.12.0** | `v2.12.0` | Theme Engine | Dual theme contrast & LiquidToggle |
| **v2.13.0** | `v2.13.0`, `v2.13` | Production Release | KPH Team Showcase, Cyber Calendar, Restock, MIT License |

---

## 🏗️ System Architecture

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

    subgraph Secondary["Secondary Database Redundancy (Neon)"]
        NeonDB["Neon PostgreSQL (Automated 15-min Mirror)"]
        BackupScripts["Backup & Sync Workflows"]
    end

    subgraph CDN["Production Edge Hosting"]
        Vercel["Vercel Edge Network (SPA Routing & Proxy)"]
    end

    Client --> State
    State --> Cloud
    Cloud -.-> BackupScripts -.-> Secondary
    Client --> Vercel
```

---

## ⚡ Core Features & Platform Capabilities

### 1. 🛡️ Dual Superadmin & Institutional Authentication Guard
- **Master Admin Whitelist**: Master administrative privileges are locked to verified institutional superadmins:
  - `vardaansaxena096@gmail.com`
  - `cicrinventory@gmail.com`
- **Institutional Email Validation**: Student self-registration requires valid institutional emails (`@mail.jiit.ac.in`).
- **Account Clearance Gate**: New member accounts enter `pending` verification status; members cannot request hardware until an admin authorizes their profile.
- **Cold-Start Resilient Session Hydration**: Synchronous session hydration from `localStorage` completely eliminates page-refresh authentication blinks.
- **Zero Stuck Authentication**: Dedicated local form submission state prevents login buttons from hanging on "Authenticating...".

### 2. 📋 Multi-Tier Requisition Clearance Portal
- **Admin Clearance Gate**: Members stage hardware requisitions; components **cannot be issued or collected** without verified administrative approval.
- **Interactive Action Presets**: Admins can approve with collection instructions (e.g. locker bay, rack number) or reject with explanatory notes.
- **Hardware Return Workflow**: Borrowers return issued items; returned hardware is inspected and verified by administrators before inventory capacity is restored.
- **Optimistic 1.5-Second Auto-Sync**: Background polling ensures newly approved or returned hardware reflects across all active devices in 1–2 seconds without page refreshes.

### 3. 📦 Component Vault (172+ Robotics Hardware Assets)
- **Comprehensive Laboratory Inventory**: 172 real robotics components categorized across 5 distinct hardware bays:
  - 🧠 **Microcontrollers & SBCs**: Arduino Uno/Mega/Nano, ESP32, ESP8266, Raspberry Pi 4/Zero, STM32 Nucleo, Teensy 4.1.
  - 📡 **Sensors & Modules**: Ultrasonic HC-SR04, PIR Motion, MPU-6050 Gyro, LiDAR TF-Luna, GPS NEO-6M, Color TCS3200, Load Cells.
  - ⚙️ **Actuators & Motors**: NEMA 17 Steppers, MG996R Servos, 12V High-Torque DC Motors, TB6600 Drivers, L298N Modules.
  - ⚡ **Power & Energy**: 3S LiPo 2200mAh, Step-Down Buck Converters (LM2596), 18650 Battery Shields, 12V 5A Industrial Adapters.
  - 🔧 **Tools & Equipment**: Digital Multimeters, TS100 Soldering Kits, Logic Analyzers, Jumper Bundles, Breadboard Workbenches.
- **Standardized Reserve Logic**:
  - 🟢 **In Stock**: Available quantity $\ge 50\%$ of total allocation.
  - 🟡 **Low Reserves**: Available quantity strictly $< 50\%$ and $> 0$ (triggers pulse alert exclusively for admins).
  - 🔴 **Depleted**: Available quantity equals $0$.
- **Removed "Min Threshold"**: Eliminated confusing legacy threshold metrics; stock status is transparently derived from live physical counts.

### 4. 🛒 Scoped Request Cart
- **Inventory-Only Visibility**: The Request Cart button in the top navbar is strictly and exclusively rendered when viewing the Component Vault inventory page.
- **Real-Time Badge Telemetry**: Displays the current staging count with live badge updates.
- **Multi-Item Loan Requests**: Stage multiple hardware items and dispatch a unified loan request with project name, purpose, and return timeline.

### 5. 🔒 Two-Box Locked Operator Profile
- **Two Distinct Side-by-Side Modules**:
  - **Left Box (Operator Identity)**: High-resolution profile avatar, full name, role badge (`ADMIN` / `LEAD` / `MEMBER`), and bio.
  - **Right Box (Institutional Credentials)**: Security-locked, tamper-proof fields for **Email Address**, **Enrollment Number**, and **Contact Number**.
- **Security-Locked Notice**: Clear indicators informing operators that verified institutional credentials can only be amended by master superadmins.

### 6. 👥 macOS Window Team Showcase (KPH JIIT Style)
- **Authentic macOS Window Frame**: Window title bar with colored traffic light controls (`#ff5f56`, `#ffbd2e`, `#27c93f`), file moniker (`~/[filename]`), and role tag.
- **Strict Role Separation**:
  - **Mentor**: **Gunjan Pal** — Project Mentor & Technical Advisor
  - **Developers**: **Vardaan Saxena**, **Samiksha Jhunjhunwala**, **Mohammad Arsh**
- **Dynamic Role Filter Tabs**: Switch seamlessly between `All Members (4)`, `Mentor (1)`, and `Developers (3)`.
- **Radiant Gradient Glow Ring**: Highlighting the active member with amber (Mentor) or purple/blue (Developer) radial glows.
- **Verified Social Badges**: Touch-friendly, high-contrast action pills for LinkedIn, GitHub, and personal portfolio.

### 7. 🕒 Live Airport Matrix Clock HUD
- **Real-Time 24h Departures Cockpit**: Authentic mechanical split-flap matrix clock displaying New Delhi (IST) local time with live seconds update.
- **Ambient Greeting**: Dynamic greeting ("Good morning", "Good afternoon", "Good evening") customized to the operator's verified name.

### 8. 🎨 Dual Theme Engine (LiquidToggle)
- **Deep Cyber Dark Mode**: `#07070a` deep obsidian background, neon purple accents, emerald stock badges, and crisp white typography.
- **Crisp Light Mode**: `#f8fafc` soft slate background, royal blue accents, high-contrast black headers, and dark emerald indicators.
- **Zero Transparency Bleed**: 100% solid notification panels, modals, and tables eliminating visual clipping.

---

## 💻 Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling & Design** | Tailwind CSS 3, Custom Cyberpunk CSS Tokens, Lucide React Icons |
| **Animation & VFX** | Framer Motion, CSS Keyframe Animations |
| **Primary Database & Auth** | Supabase (PostgreSQL 15), Supabase Auth, Row-Level Security (RLS) |
| **Secondary Backup Mirror** | Neon Serverless PostgreSQL (Automated 15-min failover scripts) |
| **Session & State Management** | React Context (Auth, Inventory, Theme, Toast), Synchronous LocalStorage Hydration |
| **Deployment & Hosting** | Vercel (Edge SPA Routing, API Rewrites, SSL) |

---

## 📂 Repository Structure

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
├── scripts/
│   ├── backup_to_neon.cjs      # Scheduled secondary PostgreSQL backup mirror
│   └── initialize_neon.cjs     # Neon DB schema initialization
├── CHANGELOG.md                # Official Semantic Versioning release notes
├── LICENSE                     # MIT License (Copyright 2026 CICR)
├── package.json                # Project dependencies & npm scripts (v2.13.0)
├── README.md                   # System documentation & architectural reference
├── tailwind.config.js          # Tailwind custom palette & animations
├── tsconfig.json               # TypeScript compiler configuration
├── vercel.json                 # Vercel SPA routing & API proxy rules
└── vite.config.ts              # Vite bundle configuration
```

---

## 🗄️ Database Schema & Real-Time Tables

The platform connects to Supabase PostgreSQL with automated failover mirroring to Neon PostgreSQL:

### 1. `public.profiles` (Operator Roster & Role Hierarchy)
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    roll_number TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `public.inventory_items` (172+ Robotics Laboratory Assets)
```sql
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Microcontrollers', 'Sensors', 'Actuators', 'Power', 'Tools')),
    description TEXT,
    location TEXT NOT NULL,
    total_qty INTEGER NOT NULL DEFAULT 1 CHECK (total_qty >= 0),
    available_qty INTEGER NOT NULL DEFAULT 1 CHECK (available_qty >= 0 AND available_qty <= total_qty),
    status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Reserves', 'Depleted')),
    image_url TEXT,
    datasheet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `public.borrow_requests` (Requisition Clearance Pipeline)
```sql
CREATE TABLE IF NOT EXISTS public.borrow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    enrollment_no TEXT,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    project_name TEXT NOT NULL,
    purpose TEXT,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `public.activity_logs` (7-Day Centralized Audit Ledger)
```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('auth', 'inventory', 'hardware', 'loans', 'system')),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_items (category);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON public.borrow_requests (status);
CREATE INDEX IF NOT EXISTS idx_borrow_user ON public.borrow_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs (created_at DESC);
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm** or **pnpm**
- **Git**

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

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nmwkljtaymujqnmzgyxn.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Secondary Redundancy (Neon PostgreSQL)
NEON_DATABASE_URL=postgresql://neondb_owner:...@ep-odd-dawn-b5go8elm-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🚢 Production Deployment

The platform is optimized for **zero-configuration Vercel deployment**:

1. Push your changes to the `main` branch.
2. Connect your repository to **Vercel**.
3. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
5. Deployments run on `https://cicr-inventory.vercel.app`.

---

## 👥 Project Mentors & Core Engineering Team

### Project Mentor & Technical Advisor
- **Gunjan Pal** — Project Mentor & Technical Advisor, CICR

### Core Engineering Team
- **Vardaan Saxena** — Lead Full-Stack Developer & System Architect
- **Samiksha Jhunjhunwala** — Frontend & UI Specialist
- **Mohammad Arsh** — Hardware Systems & Robotics Developer

---

## 📜 License

Distributed under the **MIT License**.

```text
MIT License

Copyright (c) 2026 Creative & Innovative Cell in Robotics (CICR)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

<div align="center">

**© 2026 CICR Inventory Hub — Creative & Innovative Cell in Robotics • JIIT Noida**

[![Visit Live Platform](https://img.shields.io/badge/VISIT-VAULT-00f0ff?style=for-the-badge)](https://cicr-inventory.vercel.app/)

</div>
