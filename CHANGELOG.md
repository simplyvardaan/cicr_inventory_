# Changelog

All notable changes to the **CICR Robotics Vault & Inventory Management Platform** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.18.5] : 2026-11-01

### Added
* Backend Connected Role Promotions & Demotions: Connected the "Promote to Admin" / "Demote to Member" actions to the backend `/api/accounts` endpoint via `updateUserRole` in `AuthContext`.
* Full Stack Synchronization: Role changes now synchronously update Supabase Postgres `profiles`, Supabase Auth `user_metadata` (`supabase.auth.admin.updateUserById`), and mirror to Neon PostgreSQL (`NEON_DATABASE_URL`).
* Audit Logging & Email Notifications: Automatically logs role promotions and demotions to `activity_logs` with admin and member identifiers and dispatches a dedicated `role_updated` notification email to the affected user.
* UI Feedback & Protection: Added button loading state (`Updating...`), disabled interactions during processing, and enforced safeguards preventing self-demotion or alteration of master superadministrator accounts.

### Fixed
* Zero-Flicker Sign-In Authorization Gate: Resolved the visual screen flicker where unapproved applicants briefly saw the dashboard mount before being logged out. Implemented `checkUserApproval` in `onAuthStateChange` and `initSession` and added an authorization guard in `App.tsx` (`isApproved`) to block unauthorized dashboard renders at the root level.
* Pending Registration Portal Messaging: Added prominent Amber banner feedback on `LoginForm` notifying applicants that their registration request has been submitted to the Admin Portal and is awaiting administrator authorization before sign-in can proceed.
* Sanitized Initial Storage Hydration: Refactored `getInitialAuth` to ignore unapproved or rejected cached session records from local storage.

***

## [2.18.4] : 2026-11-01

### Fixed
* Google SMTP Password Fallback & Credentials Sanitization: Corrected the encoded base64 Google App Password fallback in `api/_mailer.ts` (`ezoufqenvifmudgv`) and added automatic whitespace/quote sanitization for 16-character Google App Passwords.
* Serverless SMTP Connection Stability: Set `pool: false` and added 8-second connection, greeting, and socket timeouts on nodemailer transporters to eliminate stale socket reuse and prevent serverless `FUNCTION_INVOCATION_FAILED` timeouts on Vercel.
* Fault-Tolerant Account Emails: Wrapped `sendAccountEmail` in `api/accounts.ts` and `api/reminders.ts` in non-blocking try-catch blocks to prevent email delivery hiccups from breaking core user registration, approvals, or cron execution.
* Serverless JSON Body Parsing: Added resilient body parsing in `api/email.ts` and `api/accounts.ts` to cleanly handle both parsed JSON objects and raw payload strings across edge and node runtimes.

***

## [2.18.3] : 2026-11-01

### Fixed
* Account Requests Detection: Enhanced `fetchPendingAccounts` in `UserDashboard.tsx` to cross-reference both `profiles` and `activity_logs` (`ACCOUNT_REQUEST`) to reliably surface all pending registration requests in the Management Hub even if direct profile row insertion was delayed or bypassed.
* Club Members Roster Hygiene: Updated `fetchAllMembers` to strictly filter for approved accounts, keeping pending applicants separated until authorized by an administrator.
* Client Signup Profile Synchronization: Fixed client-side registration fallback in `AuthContext.tsx` to explicitly write `status: initialStatus` and `role: enforcedRole` during profile upserts.

***

## [2.18.2] : 2026-10-31

### Fixed
* Responsive Notification Panel Positioning: Fixed horizontal overflow on mobile viewports by anchoring panel with `fixed top-[4.5rem] inset-x-2.5 mx-auto max-w-sm` on mobile and `sm:absolute sm:top-full sm:right-0 sm:w-[410px]` on desktop, eliminating viewport clipping.
* Mobile Touch Backdrop: Added semi-transparent backdrop overlay on mobile devices to focus the notification panel and enable intuitive single-tap dismissal outside the container.
* Touch and Keyboard Outside Dismissal: Added `touchstart` and `keydown` (Escape key) listeners alongside `mousedown` to ensure responsive dismissal on all touchscreens and desktop setups.
* TopNavbar Stacking Priority: Increased `TopNavbar` stacking index to `z-50` to guarantee notification dropdown floats cleanly above all content and docks.

### Added
* Notification Filter Tabs: Introduced interactive "All" and "Unread" tab toggles with morphing indicator to filter notification streams dynamically.
* Actionable Dismissal and Clear Controls: Added individual notification dismiss buttons, one-click "Clear all" tray action, and "Read all" quick action.
* Comprehensive Alert Streams: Expanded notification triggers to include declined requisition notices for members and pending user registration reviews for administrators.

***

## [2.18.1] : 2026-10-31

### Fixed
* Responsive Category Navigation Submenu: Centered floating catalog category submenu directly above the bottom navigation dock across both mobile and desktop viewports.
* Mobile Viewport Boundary Clamping: Constrained submenu container to `max-w-[calc(100vw-1.5rem)]` with smooth touch momentum scrolling and hidden scrollbars to prevent horizontal clipping.
* Filter Key Synchronization: Aligned category keys between `BottomNavbar.tsx` and `ComponentVaultView.tsx` (`mcu` and `microcontrollers`), restoring interactive real-time category filtering.
* Touch Event Recognition: Added `touchstart` listener alongside `mousedown` to ensure clean outside-dismissal on touch devices.

***

## [2.18.0] : 2026-10-31

### Added
* Personalized Member Active Loans Filter: Configured active loans metric and status filter in Component Vault to display strictly personalized loan counts for normal members, while administrators retain full visibility over all member loans across the lab.
* Dynamic Card Subtitle: Active loans card dynamically indicates "Checked out by you" for members and "Checked out by members" for administrators.

### Changed
* Streamlined Requisition Clearance: Removed locker and collection instructions text input field from pending requisitions in `RequisitionsView.tsx` for a cleaner, one-click authorization workflow.

### Fixed
* Persistent Notification Read State: Fixed "Read all" button in the notification popover by connecting handler to persistent local storage synchronization, ensuring marked alerts do not reappear during real-time polling intervals.
* System Inventory Stock Restoration: Verified all outstanding borrow requests as returned and restored full 100% available stock across all 53 hardware components.

***

## [2.17.0] : 2026-10-31

### Added
* Official Google SMTP Mailer Integration: Configured production SMTP transport via Gmail SSL on port 465 using official account `cicrinventoryofficial@gmail.com`.
* Serverless Mailer Engine & Telemetry: Added automated notification templates for login, logout, account creation, account approval, account rejection, borrow requests, borrow approvals, borrow rejections, return records, and return reminders.
* Base64 Decoded Production SMTP Fallbacks: Integrated resilient failover decoders in `api/_mailer.ts` and `api/reminders.ts` ensuring automated emails send reliably across local, serverless, and cloud deployments.
* Cron Return Reminders Service: Added automated due date reminder endpoint in `api/reminders.ts` querying impending and overdue item returns.
* Production Environment Templates: Updated `.env` and `.env.example` with standard Google SMTP parameters.

***

## [2.16.0] : 2026-10-31

### Added
* Failover Client Decoders: Added base64 decoding utilities in `src/lib/supabase.ts` to guarantee production fallback credentials load seamlessly even when host environment variables are absent.
* Direct Supabase Failovers: Added resilient fallback pathways in `AuthContext.tsx` for account registration, administrative approval, and account rejection directly via `supabaseAdmin` if serverless API routes are unreachable.
* Vercel API Rewrite Guard: Reinstated serverless route rewrites in `vercel.json` for all `/api/(.*)` paths.

### Fixed
* Resolved blank white screen on Vercel deployment caused by top level unhandled exceptions on missing environment variables.
* Cleaned up multiline template escape sequences across asynchronous handlers.
* Full cross branch parity established across `main`, `UI-UX-Updates`, `Docs`, `Backend-Updates`, and `Emailing-Updates`.

***

## [2.15.0] : 2026-10-31

### Added
* Student Applicant Review Notification Modal: Interactive Framer Motion popup confirming student registration requests have been forwarded to the Admin Portal for review before login.
* High Contrast Morphing Dialog: Elevated dialog backdrop to `z-[70]` with explicit light and dark theme backgrounds to eliminate visual bleed through.

### Changed
* Management Hub Member Roster: Display full member names (such as Gunjan Pal, Vardaan Saxena, Divyam Jain, Kushagra Garg, Mahak Katahara) without initial truncation.
* Requisitions Clearance Portal: Implemented responsive flex wrapping and `break-all` styling on borrower emails, formatted lab location badges, and expanded action buttons to full width on mobile viewports.

***

## [2.14.0] : 2026-10-31

### Added
* Phase 1 and Phase 2 Architecture in Team Showcase:
  1. Phase 1: Mentor Gunjan Pal; Developers Vardaan Saxena, Kushagra Garg, Divyam Jain, Mahak Katahara.
  2. Phase 2: Mentor Gunjan Pal; Developers Vardaan Saxena, Samiksha Jhunjhunwala, Mohammad Arsh.
* Interactive Sub Buttons: Nested Mentor and Developers filter buttons under Phase 1 and Phase 2 selectors, defaulting to Phase 2 upon navigation.
* Dedicated Team Avatars: Integrated individual photo assets for Divyam Jain, Kushagra Garg, and Mahak Katahara.
* Defensive Penetration Hardening: Audited and fortified authentication caller guards, enforced integer reservation bounds, and locked master superadmin privileges.
* Architecture Governance Documents: Created `AGENT.md`, `RULES.md`, and `SECURITY.md` defining code length limits, zero emoji enforcement, zero hyphen list formatting, and telemetry standards.

***

## [2.13.0] - 2026-10-31

### Added
- **Final Official Version Tag v2.13.0 / v2.13**: Official production release with MIT license and comprehensive system architecture documentation.
- **KPH-Style Complete Team Showcase**: Unified team presentation with all 4 members (Gunjan Pal - Mentor, Vardaan Saxena - Developer, Samiksha Jhunjhunwala - Developer, Mohammad Arsh - Developer) with responsive role filters and dynamic avatar selection.
- **Resilient Cold-Start & ErrorBoundary Guard**: Branded pulse loading and React ErrorBoundary to eliminate any blank white screens or session hangs.
- **Strict Local State for Authentication**: Added explicit submitting state to prevent login button from getting stuck on "Authenticating...".
- **Admin Warning Guard**: Ensured warning pills and low reserve indicators strictly display only for verified administrator accounts.
- **High-Contrast Light Mode Optimization**: Crisp text and badge styling across Activity Logs, Account Requests, and Requisitions with full light/dark theme fidelity.

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
