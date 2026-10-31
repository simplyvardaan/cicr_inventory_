# CICR Inventory Hub : Codebase Engineering Rules and Architecture Standards

Creative and Innovative Cell in Robotics : Coding Protocol and Quality Guidelines

***

## 1. Single File Code Length and Modularity Standards

* Maximum File Length: No individual source code file should exceed 250 to 300 lines of code.
* Single Responsibility Principle: Every file must serve a distinct, dedicated purpose. Never merge UI layouts, state managers, API clients, and static lookup tables into one monolithic file.
* Component Decomposition: Large views must be split into modular subcomponents located in dedicated subdirectories.
* Hook Extraction: Extract complex reactive state, timers, and storage listeners into reusable custom hooks inside `src/hooks/`.
* Utility Isolation: Move helper calculations, date formatters, and validators into isolated functions inside `src/utils/`.
* Clean Exports: Use concise, explicit module exports to maintain clear architectural boundaries between views and services.

***

## 2. Comprehensive Code Comments and Explanatory Documentation

* Mandatory Function Documentation: Every function, custom hook, service method, and exported constant must have rich explanatory JSDoc comments.
* Explain the Rationale: Comments must not merely restate syntax; they must explain the architectural intent, hardware context, and security reasoning.
* Parameter and Return Annotations: Explicitly document parameter types, valid numerical bounds, expected string formats, and return structures.
* Edge Case and Failure Documentation: Explicitly comment potential error states, timeout conditions, and network failover behaviors.
* Inline Logic Annotations: Complex algorithms, atomic state mutations, and authorization guards must feature step by step inline commentary.
* Comment Preservation: Never delete existing explanatory comments during refactoring unless the underlying business logic is obsolete.

***

## 3. Zero Emoji Enforcement

* Strict Ban on Unicode Emojis: Absolutely zero emojis are permitted across the entire repository.
* Scope of Restriction: This rule applies to Markdown documentation files, TypeScript source files, HTML templates, CSS styles, UI strings, button labels, toast notifications, telemetry records, and Git commit messages.
* Professional Presentation: System alerts, status badges, and notifications must rely on professional typography, semantic colors, and crisp SVG vector icons from Lucide React.
* Automated Verification: All commits and pull requests must be verified via regex scanners to guarantee zero emoji presence before deployment.

***

## 4. Zero Hyphen Formatting Convention

* List Punctuation: Use asterisk symbols `*` or numbered sequences `1.` `2.` `3.` for all bulleted points. Never use hyphen symbols for list bullets.
* Section Dividers: Use triple asterisks `***` for thematic horizontal rules.
* Prose Separation: Use colons `:`, semicolons `;`, parentheses `()`, or standard periods `.` to separate clauses.
* Compound Terminology: Write compound terms without hyphenation, using separated words or closed compounds such as `full stack`, `realtime`, `subcomponent`, `prerelease`, `frontend`, and `backend`.
* Code Identifiers: Use camelCase, PascalCase, or snake_case for all variables, functions, types, and database columns.

***

## 5. System Debuggability and Telemetry Standards

* Explicit Exception Handling: Every asynchronous operation and external network invocation must be enclosed within try catch blocks. Never silently swallow errors.
* Context Rich Error Logging: When an error is caught, log it using `console.error` with structured contextual metadata including module name, operation identifier, and target entity IDs.
* Meaningful User Feedback: Surface clear, actionable toast alerts to operators that explain why an action failed, rather than displaying generic failure messages.
* Component Crash Isolation: Wrap view trees with React error boundaries such as `VaultErrorBoundary` to catch UI rendering crashes and provide graceful recovery without whole page collapse.
* Traceable Telemetry Stream: All hardware checkouts, approvals, rejections, and inventory mutations must emit structured audit records with ISO timestamps to `activity_logs`.
* Network Timeout Resilience: Network requests and authentication hydration must employ timeout guards to prevent indefinite UI freezing during cloud cold start intervals.

***

## 6. Versioning Convention and Bug Tracking Protocol : Major.Minor.Bugs

The repository strictly adheres to Semantic Versioning structured as `MAJOR.MINOR.BUGS`:

* MAJOR Version Increments: Triggered by breaking architectural alterations, primary database schema restructuring, or fundamental authentication workflow redesigns. Example: transition from standalone Vite prototype to Supabase PostgreSQL authentication engine.
* MINOR Version Increments: Triggered by substantial new feature implementations, new functional views, theme engine enhancements, or queue additions that preserve backwards compatibility. Example: adding the Requisition Clearance Portal or the KPH Team Showcase.
* BUGS Version Increments: Triggered by defect resolutions, security patches, styling alignment corrections, typography contrast adjustments, and defensive boundary hardening.
* Bug Classification Taxonomy:
  1. Critical Security Bugs: Vulnerabilities impacting authentication, authorization, or role escalation. Must be patched immediately and documented in `SECURITY.md`.
  2. Inventory Arithmetic Bugs: Discrepancies in stock calculations, negative quantity inputs, or reservation sync errors.
  3. UI Accessibility Bugs: Contrast failures, theme color inconsistencies, and mobile viewport clipping.
  4. Telemetry and State Bugs: Notification persistence failures, timer race conditions, or unhandled promise rejections.
* Release Verification Protocol: Every bug resolution must pass TypeScript typechecking, production bundle compilation `npm run build`, and Git tag creation before merging into production.

***

