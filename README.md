# CICR Inventory Portal 🚀
### Centre for Innovation, Creativity & Robotics | College Club Inventory System

A modern, high-performance web dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase Backend** for managing club electronics, microcontrollers, sensors, motors, fabrication equipment, and student project borrow requests.

---

## ⚡ Features

### 🔐 1. Full Authentication & Member Profiles
- **Sign Up & Sign In** with Supabase Auth:
  - Full Name, Student Roll Number, College Email, Department & Club Role.
  - Role-based permissions (**Admin**, **Lead**, **Member**).
- **1-Click Quick Demo Login** on the login modal:
  - **Admin Lead**: `admin@cicr.edu.in` / `cicr_admin_2026`
  - **Club Member**: `member@cicr.edu.in` / `cicr_member_2026`
- Persistent session storage & automatic token refresh.
- Profile editing (Name, Department, Roll Number, Phone Number).

### 📦 2. Inventory Management
- **Catalog of Club Equipment**:
  - Microcontrollers & SBCs (ESP32, Arduino Mega, Raspberry Pi 4, etc.)
  - Sensors & Modules (LiDAR, MPU-6050, Ultrasonic, etc.)
  - Motors, Actuators & Drivers (NEMA 17, MG996R Servos, L298N, etc.)
  - Power & Batteries (3S LiPo, chargers, bench power)
  - Fabrication & Lab Tools (Creality 3D Printers, TS100 Soldering Stations)
  - Mechanical & Electronic Components
- **Item Details**: SKU codes, Storage Locations (Lab Shelf/Cabinet/Locker), Total vs Available stock, Minimum alert thresholds, Condition badges, Image URLs, and direct Datasheet links.
- **Dual View Modes**: Interactive Grid view and searchable Table view.
- **Real-Time Filters & Sorting**: Search by name/SKU/keyword, filter by domain category, filter by stock status, and sort by quantity/name.
- **CRUD Operations**: Leads & Admins can add, update, and remove items with instant feedback.

### 🔄 3. Equipment Borrowing & Issuance System
- **Borrow Requisition**:
  - Club members submit requests with project name, purpose, quantity, and expected return date.
- **Admin Approval Queue**:
  - Admins & Leads can review, approve, reject, or mark items as returned with notes.
  - Automatic real-time inventory quantity deduction on approval.
  - Automatic stock restoration upon marking item returned.
- **Personal Requisition History**:
  - Members can track all components they currently possess and their return deadlines.

### 📊 4. Dashboard Analytics & Audit Trail
- Metric counters: Total Items, In-Stock Units, Active Checkouts, Low Stock Warnings.
- Category distribution breakdown with visual availability bars.
- Live Lab Activity feed & Audit trail logging every creation, checkout, return, and update.

### 🌐 5. Supabase Backend Integration
- Integrated with remote Supabase project `nmwkljtaymujqnmzgyxn`.
- Complete schema migration script provided in `supabase_schema.sql` (Profiles, Inventory, Borrow Requests, Activity Logs, and automated triggers).
- **Dual-Mode Sync**: Works seamlessly with live Supabase PostgreSQL tables; if tables are fresh, gracefully caches locally and provides a 1-click **"Seed Live Database"** button to populate the remote tables immediately once schema is run!

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend & Auth**: Supabase (`@supabase/supabase-js`, PostgreSQL, Row-Level Security)
- **Build Tool**: Vite 6

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/simplyvardaan/cicr_inventory_.git
cd cicr_inventory_
npm install
```

### 2. Environment Configuration
The `.env` file is pre-configured with the Supabase credentials:
```env
VITE_SUPABASE_URL=https://nmwkljtaymujqnmzgyxn.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄 Database Schema Setup (1-Minute Setup)

To enable live remote database tables in your Supabase project:
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/nmwkljtaymujqnmzgyxn/sql/new).
2. Copy and paste the contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Click **Run**.
4. In the web app, click **Backend Ready** or open the **Supabase Backend Setup** dialog and click **"Seed Live Database"** to instantly push all starter inventory items to your PostgreSQL tables!

---

Developed with ❤️ for the **Centre for Innovation, Creativity & Robotics (CICR)**.

