# CICR Robotics Vault & Inventory Management Platform 🤖⚡
### Creative & Innovative Cell in Robotics | JIIT Noida

A modern, high-performance web dashboard and robotics hardware management platform built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**, deployed on **Vercel**. Designed to manage laboratory components, microcontrollers, sensors, actuators, and student project requisitions with complete audit accountability.

🌐 **Live Production App**: [https://cicr-inventory.vercel.app/](https://cicr-inventory.vercel.app/)  
📦 **Repository**: [https://github.com/simplyvardaan/cicr_inventory_](https://github.com/simplyvardaan/cicr_inventory_)  
🏷️ **Current Version**: `v2.2.0`  
📜 **Release Notes & History**: [CHANGELOG.md](./CHANGELOG.md)

---

## 🏛️ System Architecture

The CICR Inventory Platform is architected around a reactive, cloud-native stack with strict security isolation, real-time database synchronizations, and edge delivery:

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 18 + Vite)"]
        UI["Modern Glassmorphism UI (Tailwind CSS)"]
        Dock["Floating Centered Dock Navbar"]
        AuthCtx["AuthContext (Dynamic RBAC)"]
        InvCtx["InventoryContext (172 Assets Stream)"]
        Router["Client-Side SPA Routing"]
    end

    subgraph CDN ["Edge Delivery (Vercel)"]
        VercelCDN["Vercel Global Edge Network"]
        Rewrites["vercel.json SPA Rewrites"]
    end

    subgraph Backend ["Cloud Infrastructure (Supabase)"]
        SupaAuth["Supabase Auth (JWT & GoTrue)"]
        Postgres["PostgreSQL Database"]
        RLS["Row Level Security (RLS Policies)"]
        
        subgraph Tables ["Database Tables"]
            T_Profiles["profiles (Members & Roles)"]
            T_Items["inventory_items (172 Hardware Assets)"]
            T_Requests["borrow_requests (Requisition State Machine)"]
            T_Logs["activity_logs (7-Day Immutable Audit)"]
        end
    end

    UI --> Dock
    UI --> AuthCtx
    UI --> InvCtx
    CDN --> Router
    Router --> UI

    AuthCtx <-->|"JWT Auth & Session"| SupaAuth
    InvCtx <-->|"PostgREST API & RLS"| Postgres
    
    Postgres --> T_Profiles
    Postgres --> T_Items
    Postgres --> T_Requests
    Postgres --> T_Logs
```

---

## ⚡ Core Features

### 1. 🔐 Dynamic Authentication & Admin Approval Pipeline
- **Student Signups**: College Email (`@mail.jiit.ac.in`), Enrollment Number, Phone Number, and requested laboratory role.
- **Admin Clearance Queue**: All newly created member accounts start in `status:pending`. Users cannot access the platform until an Administrator approves their registration in the **Management Hub**.
- **100% Dynamic Roles**: Zero hardcoded credentials or bypasses. Roles (`admin`, `lead`, `member`) are dynamically queried from Supabase `profiles` with Row Level Security enforcement.

### 2. 🗄️ Component Vault (172 Laboratory Assets)
- **172 Hardware Assets** categorized into 5 primary robotics domains:
  - **Microcontrollers & SBCs** (ESP32-WROOM, Arduino Mega 2560, Raspberry Pi 4, STM32 Blue Pill)
  - **Sensors & Modules** (RPLIDAR A1, MPU-6050, Ultrasonic HC-SR04, PIR Motion Sensor, VL53L0X ToF)
  - **Motors & Actuators** (NEMA 17 Steppers, MG996R Metal Servos, L298N Motor Drivers)
  - **Power & Batteries** (3S LiPo Packs, Buck Converters, 18650 Battery Shields)
  - **Tools & Fabrication** (Soldering Stations, Wire Strippers, RunCam FPV, Multimeters)
- **Live Metrics**: Total Assets (172), Available Ready for Checkout (172), Active Loans, Low Reserves, and Depleted stock.
- **Real-Time Stock Adjustment**: Stock is automatically decremented upon approval and restored immediately upon component return.

### 3. 👥 Club Members Roster & Management
- Direct overview of all registered club members with:
  - Avatar initials, Full Name, Role Badge (`ADMIN`, `LEAD`, `MEMBER`).
  - College Email, Enrollment Number, Phone Number, and Join Date.
  - Hardware requisition metrics (total requests submitted, active loans held).
  - **Activity Trail**: Dedicated drawer displaying every transaction associated with an individual member.
  - **Dynamic Role Promotions**: Administrators can promote or demote members between `Member`, `Lead`, and `Admin` directly from the dashboard.

### 4. 📜 7-Day Immutable Activity History & Audit
- Scoped multi-day activity history automatically displaying laboratory operations from the **last 7 days**.
- Quick time filters: **Last 7 Days (Default)**, Today (24 Hours), Last 3 Days, and All Time.
- Category filters: Borrows & Checkouts, Returns, Account Actions, and Component Updates.
- Live search across users, components, and action types.
- Detailed relative timestamps ("10m ago", "Yesterday at 4:15 PM").

### 5. 📱 Responsive Floating Dock Navbar
- Fixed, backdrop-blurred floating bottom dock providing seamless navigation:
  - `Dashboard` | `Inventory` (with dedicated dropup category selector) | `Requests` | `Logs` (Admin only) | `Team`
  - Right user capsule displaying initial avatar, full name, role badge, change password trigger, and logout.
  - Clean responsive shrinking ensuring zero text collisions on mobile, tablet, and widescreen viewports.

---

## 👥 Meet the Team

| Role | Member | Links |
| :--- | :--- | :--- |
| **Mentor** | **Gunjan Pal** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gunjan-pal-796093284/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Gunjan00001) |
| **Developer** | **Vardaan Saxena** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/simplyvardaan/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/simplyvardaan) [![Portfolio](https://img.shields.io/badge/Portfolio-22c55e?style=flat&logo=google-chrome&logoColor=white)](https://vardaansaxena.tech) |
| **Developer** | **Samiksha Jhunjhunwala** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/samiksha-jhunjhunwala-9343b02b3/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Samikshajjw) |
| **Developer** | **Mohammad Arsh** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mohammad-arsh-1792008-hd/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/HybridzDynamics) |

---

## 📋 Version History & Changelog

### `v2.0.0` — Production Release (Current)
- **172 Assets Synchronization**: Fully synchronized all 53 unique component categories totaling 172 units in remote Supabase PostgreSQL.
- **Team Roster Addition**: Integrated **Mohammad Arsh** with GitHub and LinkedIn credentials into the interactive team carousel.
- **Comprehensive Management Hub**: Transformed Logs view into a full member directory with dynamic role management, individual activity trails, and 7-day scoped audit timelines.
- **Admin Approval Queue**: Implemented strict registration authorization where new signups require administrator approval before logging in.
- **Bottom Navbar Redesign**: Removed redundant standalone admin button and added responsive label shortening to eliminate text overlapping.
- **Production Edge Deployment**: Added `vercel.json` SPA rewrites and public client credentials fallbacks in `src/lib/supabase.ts` for instant zero-config deployments.

### `v1.2.0`
- **Dynamic Security Architecture**: Removed all hardcoded credentials and sample admin scripts; unified dynamic role checks against Supabase `profiles`.
- **Schema Simplification**: Streamlined database models by removing deprecated `department`, `condition`, and `sku` columns across UI and PostgreSQL schemas.

### `v1.1.0`
- **Supabase Integration**: Connected live PostgreSQL instance `nmwkljtaymujqnmzgyxn` with Row Level Security (RLS) policies.
- **Requisition State Machine**: Integrated automated quantity deductions upon borrow approval and restorations upon return.

### `v1.0.0`
- **Initial Release**: Core React + Vite dashboard structure, hardware catalog view, mock data fallback, and authentication modals.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript (TSX) |
| **Styling & Design** | Tailwind CSS 3.4, PostCSS, Lucide React Icons |
| **Build & Bundler** | Vite 6 |
| **Database & Auth** | Supabase (PostgreSQL 15, GoTrue Auth, Row Level Security) |
| **Hosting & CDN** | Vercel Global Edge Network (`vercel.json`) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Git**

### 2. Clone & Install
```bash
git clone https://github.com/simplyvardaan/cicr_inventory_.git
cd cicr_inventory_
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root (reference `.env.example`):
```env
VITE_SUPABASE_URL=https://nmwkljtaymujqnmzgyxn.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEON_DATABASE_URL=postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require
```

`NEON_DATABASE_URL`, `SUPABASE_DB_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are
server-side only. They must not be included in frontend deployment variables.
`SUPABASE_DB_URL` is the direct Supabase Postgres connection string used to copy
the existing `auth.users.encrypted_password` hashes without exposing them.

The browser always sends database requests through `/api/db`. The gateway tries
Supabase first and automatically uses the mirrored Neon tables when Supabase
times out or returns a server error. Use the deployed Vercel app (or `vercel dev`)
to run the gateway; plain `npm run dev` only serves the frontend and cannot run
the server-side Neon fallback.

### 4. Configure the Neon backup

Create a Neon PostgreSQL database and run [`neon_backup_schema.sql`](./neon_backup_schema.sql)
once in the Neon SQL editor. Then run the backup from a trusted server, CI job, or
scheduled worker:

```bash
npm run neon:init
npm run backup:neon
```

The GitHub Actions workflow at
[`.github/workflows/backup.yml`](./.github/workflows/backup.yml) runs this mirror
automatically every 15 minutes. Add `VITE_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `NEON_DATABASE_URL` as repository secrets under
**Settings → Secrets and variables → Actions**. You can also run it immediately
from the repository's **Actions** tab.

`neon:init` creates the operational Neon tables from
[`neon_schema.sql`](./neon_schema.sql). Run [`supabase_schema.sql`](./supabase_schema.sql)
in the Supabase SQL Editor to create the matching Supabase tables. The schema is
safe to rerun because existing RLS policies are replaced. The Supabase
REST API cannot execute schema DDL using an anon or service-role key.

The command performs a one-way Supabase-to-Neon mirror for profiles, inventoryitems, borrow requests, activity logs, and authentication metadata.
It replaces each mirrored table's backup snapshot atomically and records each run
in `backup_runs`. Plaintext passwords, access tokens, and session data are never copied.
The mirror reads `auth.users.encrypted_password` through `SUPABASE_DB_URL` and
stores it as `password_hash`, allowing the same password to be verified during
failover. Without `SUPABASE_DB_URL`, the Supabase API cannot provide password
hashes and users are marked `password_reset_required`.

### Database failover gateway

Browser database requests now pass through `/api/db`. The Vercel function tries
Supabase first and routes database reads and writes to Neon when Supabase has a
network or server failure. Configure `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEON_DATABASE_URL` as
Vercel environment variables
environment variables. Supabase Auth remains primary, so login and signup are
not available if Supabase Auth itself is down.

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 6. Production Build
```bash
npm run build
npm run preview
```

---

## 🏷️ Version History & Releases

| Version | Release Date | Key Highlights |
| :--- | :--- | :--- |
| **`v2.2.0`** | Oct 31, 2026 | macOS-inspired team window showcase (KPH style), persistent session hydration on refresh, scoped inventory cart button, removed role badges, zero preloader delays |
| **`v2.1.0`** | Oct 31, 2026 | Dual-theme system (high-contrast light & dark modes), solid notifications drawer, secondary Neon database mirror |
| **`v2.0.0`** | Oct 31, 2026 | Production launch: 172 synchronized robotics hardware assets, digital issue pass generator, dynamic RBAC |
| **`v1.0.0`** | Sep 15, 2026 | Initial prototype release and laboratory inventory tracking foundation |

For the complete release history, see [CHANGELOG.md](./CHANGELOG.md).

---

## 📄 License
Maintained by the **Creative & Innovative Cell in Robotics (CICR)**, Jaypee Institute of Information Technology (JIIT), Noida.
