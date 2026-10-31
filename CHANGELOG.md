# Changelog

All notable changes to the **CICR Robotics Vault & Inventory Management Platform** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-10-31

### Added
- **Two-Box Side-by-Side Profile View**: Split Operator Profile into two distinct side-by-side modules: Operator Identity & Avatar (Left) and Verified Academic Credentials (Right).
- **Locked Institutional Credentials**: Enforced security locks on Email, Enrollment Number, and Contact Number so they cannot be changed.
- **Admin-Exclusive Warnings**: Low reserve warning pills in `TopNavbar` and stock warning notifications are strictly restricted to administrator accounts.
- **Persistent Notification Read State**: Reading or clearing notifications permanently stores their read state in `localStorage` (`cicr-read-notifications`), guaranteeing read alerts never pop up as unread again.
- **Fast Auto-Synchronization**: Requisitions, approvals, and inventory availability synchronize in real time every 1.5 seconds in the background without needing a page refresh.
- **macOS Window Team Showcase**: Interactive developer and mentor profile card matching the KPH JIIT design with traffic light window controls (`#ff5f56`, `#ffbd2e`, `#27c93f`), radiant gradient avatar ring, and interactive social buttons (LinkedIn, GitHub, Portfolio).
- **Strict Role Separation**: Hierarchical tab segregation between `Mentor` (Gunjan Pal) and `Developer` (Vardaan Saxena, Samiksha Jhunjhunwala, Mohammad Arsh).
- **Synchronous Session Hydration**: Added `getInitialAuth()` to `AuthContext` to instantly restore active user sessions and profiles from `localStorage` upon initial script evaluation, completely eliminating page refresh flickers and stuck authentication states.
- **Dynamic File Code Tags**: Each team member profile dynamically displays a live file code moniker (`gunjan_pal.tsx`, `vardaan_saxena.tsx`, `samiksha_jhunjhunwala.tsx`, `mohammad_arsh.tsx`).

### Changed
- **50% Low Reserve Rule**: Standardized low reserves logic across the entire platform: components with availability strictly less than 50% are flagged as Low Reserves, and 0 is Depleted.
- **Removed "Min Threshold"**: Fully eliminated "Min Threshold" and "Min Alert Qty" cards, inputs, and metrics from item details, addition modals, and vault views.
- **Centered & Prominent Request Slider**: Removed the redundant Close button from the item detail modal and placed the `Slide to Request Item` slider in the center with a larger `lg` footprint.
- **Inventory Vault Scoping for Cart**: Moved and strictly restricted the `Cart` indicator button in `TopNavbar` so that it is only visible when the user is actively viewing the Component Vault inventory page.
- **Minimalist Team Typography**: Removed subtitle badge tags (`Lead Architect & Developer`, `Mentor & Technical Advisor`, etc.) beneath developer and mentor names as requested.
- **Header Action Cleanup**: Removed redundant `Request Cart` and `+ Add Equipment` buttons from the vault subheader for a clean, streamlined dashboard experience.
- **Eliminated Preloader Delays**: Removed the blocking full-page spinning preloader, ensuring instant frame-1 rendering of the dashboard.

### Fixed
- Fixed faint text and unreadable amber/yellow dates in light theme on the Requisition Approval Portal.
- Fixed `Invalid Date` display in the notification popover with resilient timestamp parsing.
- Fixed text turning invisible on hover in light theme across the Admin Hub navigation tabs, filter buttons, and search clear icons.
- Fixed dark container box in light theme on the Requisition Approval Portal when no borrow requests match filter criteria.
- Fixed backend synchronization for the Requisitions tab by ensuring `borrow_requests` queries and submissions bypass RLS restrictions and sync immediately with Supabase and activity logs.
- Fixed issue where refreshing the browser on `localhost` or `cicr-inventory.vercel.app` briefly routed the user to the login form or stayed stuck on "Authenticating...".
- Fixed action pill clutter at the bottom of the developer page.
- Fixed layout responsiveness of the member avatar carousel on mobile and desktop viewports.

---

## [2.1.0] - 2026-10-31

### Added
- **Dual-Database Failover & Secondary Mirror**: Integrated secondary PostgreSQL redundancy powered by Neon DB with scheduled 15-minute synchronization workflows.
- **High-Contrast Theme Palettes**:
  - Dark Theme: Deep Black (`#05030a`), Neon Purple accents, Clean White, Emerald availability badges, Red alert indicators.
  - Light Theme: Crisp White, Blue accents, Solid Black text, Red fatal alert indicators.
- **Solid Notification Panel**: Enhanced notification drawer with 100% opaque background, eliminating transparency bleed-through over hero clocks and inventory grids.
- **Interactive Liquid Theme Toggle**: Modern smooth toggle button with intuitive visual feedback for switching between light and dark modes.

### Changed
- Refined component card typography and border contrasts for enhanced legibility under bright ambient lighting.
- Synchronized low-reserve stock thresholds with Supabase real-time triggers.

### Fixed
- Fixed mobile navbar icon overlapping and dock alignment issues on narrow screens.
- Fixed admin role synchronization directly from the activity logs view.
- Fixed notification drawer dismissal on outside click.

---

## [2.0.0] - 2026-10-31

### Added
- **172 Lab Component Assets**: Complete synchronization of the laboratory hardware catalog spanning Microcontrollers & SBCs, Sensors & Modules, Motors & Actuators, Power & Batteries, and Tools & Fabrication.
- **Digital Issue Pass System**: Instant verification pass modal with dynamic QR codes, digital authentication timestamps, and return deadlines.
- **Dynamic RBAC & Approval Pipeline**: Self-service student registration with mandatory admin clearance verification before platform access.
- **Multi-Item Hardware Requisition Cart**: Batch component requisition system allowing users to stage multiple parts in a single request.
- **Immutable Activity Audit Log**: 7-day automated transaction logging for checkouts, returns, user status updates, and equipment modifications.

---

## [1.0.0] - 2026-09-15

### Added
- Initial release of the Creative & Innovative Cell in Robotics (CICR) laboratory inventory platform.
- Basic component tracking, manual loan logs, and user authentication.
