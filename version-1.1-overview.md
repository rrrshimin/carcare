# CarCare Diary — Version 1.1 Overview

> **Snapshot date:** March 27, 2026
> **App version:** 1.0.0 (as declared in `app.json` and `package.json`)
> **Platform:** React Native (Expo) — iOS & Android
> **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, RPCs)

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [Device Identity & Guest Mode](#7-device-identity--guest-mode)
8. [Subscription & Entitlement System](#8-subscription--entitlement-system)
9. [Feature Inventory](#9-feature-inventory)
   - 9.1 [Onboarding](#91-onboarding)
   - 9.2 [Vehicle Management](#92-vehicle-management)
   - 9.3 [Garage (Multi-Vehicle)](#93-garage-multi-vehicle)
   - 9.4 [Maintenance Tracking](#94-maintenance-tracking)
   - 9.5 [Maintenance Calculations & Due Status](#95-maintenance-calculations--due-status)
   - 9.6 [Logging](#96-logging)
   - 9.7 [Maintenance History](#97-maintenance-history)
   - 9.8 [Mileage Updates](#98-mileage-updates)
   - 9.9 [Spending Analytics](#99-spending-analytics)
   - 9.10 [Fleet Analytics (Garage-Level)](#910-fleet-analytics-garage-level)
   - 9.11 [CSV Export](#911-csv-export)
   - 9.12 [Share Link](#912-share-link)
   - 9.13 [Vehicle Transfer](#913-vehicle-transfer)
   - 9.14 [Notifications & Reminders](#914-notifications--reminders)
   - 9.15 [Account Management](#915-account-management)
   - 9.16 [Paywall & Plans](#916-paywall--plans)
   - 9.17 [Company Profile (Pro)](#917-company-profile-pro)
   - 9.18 [Currency Support](#918-currency-support)
10. [State Management](#10-state-management)
11. [Business Logic — Core Calculations](#11-business-logic--core-calculations)
12. [Notification System — Detailed Logic](#12-notification-system--detailed-logic)
13. [Services Layer](#13-services-layer)
14. [Component Library](#14-component-library)
15. [Design System](#15-design-system)
16. [Assets](#16-assets)
17. [Build & Configuration](#17-build--configuration)
18. [Known Deviations & Open Items](#18-known-deviations--open-items)

---

## 1. Product Summary

CarCare Diary is a mobile app for vehicle maintenance history and upcoming service tracking. It replaces scattered receipts, notes, and memory with a structured timeline of maintenance work per vehicle. Key value propositions:

- **Single source of truth** for all vehicle maintenance
- **Proactive reminders** — mileage-based and time-based due calculations
- **Multi-vehicle garage** for households or resellers
- **Public share link** — read-only vehicle history at `carcarediary.com/{slug}`
- **Spending analytics** — per-vehicle and fleet-wide breakdowns
- **Vehicle transfer** — send ownership to another user by CarCare ID
- **Guest-first** — core features work without an account; auth is optional

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native via **Expo SDK** (managed workflow) |
| Language | **TypeScript** (strict mode) |
| Styling | **NativeWind** (Tailwind CSS for React Native) + `StyleSheet` |
| Navigation | **React Navigation** (native stack) |
| Backend | **Supabase** (PostgreSQL + Auth + Storage + Edge Functions + RPC) |
| Auth | Supabase Auth — Google OAuth (PKCE), Apple Sign-In, Email OTP |
| State | React Context (auth), module-level stores (app, vehicle, entitlement, fleet cache) |
| Local Storage | `@react-native-async-storage/async-storage` |
| Notifications | `expo-notifications` (local, with Expo Go no-op fallback) |
| Fonts | **Poppins** (Regular, SemiBold, Bold, ExtraBold) via `@expo-google-fonts/poppins` |
| Image Handling | `expo-image-picker`, `expo-image-manipulator`, `expo-file-system` |
| QR Code | `react-native-qrcode-svg` + `react-native-view-shot` for PNG export |
| Animations | `react-native-reanimated` |
| Build | **EAS Build** (Android APK profile configured) |

### Key Dependencies

```
@supabase/supabase-js           expo-notifications
@react-navigation/native        expo-image-picker
@react-navigation/native-stack  expo-image-manipulator
@react-native-async-storage     expo-clipboard
@react-native-community/datetimepicker  expo-sharing
@react-native-google-signin     expo-apple-authentication
nativewind + tailwindcss         expo-web-browser
react-native-gesture-handler     expo-crypto
react-native-reanimated          expo-blur
react-native-safe-area-context   expo-auth-session
react-native-screens             react-native-qrcode-svg
react-native-svg                 react-native-view-shot
```

---

## 3. Project Structure

```
CarCare/
├── App.tsx                          # Root: fonts, providers, navigation
├── index.ts                         # Expo entry point
├── app.json                         # Expo config (scheme, plugins, EAS)
├── database.types.ts                # Supabase-generated DB types
├── global.css                       # NativeWind global styles
├── babel.config.js                  # NativeWind + Expo preset
├── tsconfig.json                    # Strict TS, path alias @/* → src/*
├── .env                             # Supabase URL, Anon Key, Google Client ID
├── assets/                          # App icon, splash, onboarding images
├── supabase/
│   └── functions/
│       └── delete-user/index.ts     # Deno edge function for account deletion
├── src/
│   ├── context/
│   │   └── auth-context.tsx         # AuthProvider + useAuth hook
│   ├── navigation/
│   │   ├── routes.ts                # Route name constants
│   │   ├── root-navigator.tsx       # SetupFlow ↔ AppFlow stacks
│   │   ├── setup-flow-navigator.tsx # Splash → Onboarding → AddVehicle → Auth
│   │   ├── app-navigator.tsx        # Vehicle, Garage, Logs, Account, etc.
│   │   └── app-navigation-container.tsx  # NavigationContainer + theme
│   ├── screens/                     # 24 screen files (see §9)
│   ├── components/                  # 32 reusable UI components
│   │   ├── buttons/                 # PrimaryButton, OutlineButton, ActionChip
│   │   ├── cards/                   # ContentCard, VehicleHero, Mileage, etc.
│   │   ├── feedback/               # Loading, Error, Empty, Modals, Sheets
│   │   ├── icons/                   # SVG icon components
│   │   ├── inputs/                  # Text, Date, Multiline, OptionPills
│   │   ├── layout/                  # ScreenTitleBlock, SectionHeader
│   │   └── lists/                   # HistoryLogRow, MaintenanceItemRow
│   ├── features/
│   │   ├── maintenance/             # Summary, history, danger count, add log
│   │   ├── notifications/           # Evaluate, schedule mileage/service
│   │   └── account/                 # Delete account (cascade + edge fn)
│   ├── services/
│   │   ├── api/                     # Supabase RPC/table wrappers (8 files)
│   │   ├── auth-service.ts          # OAuth, OTP, session, sign-out
│   │   ├── vehicle-service.ts       # CRUD, cache, mileage, image upload
│   │   ├── log-service.ts           # Log validation + submit/delete
│   │   ├── share-service.ts         # Enable/disable sharing
│   │   ├── transfer-service.ts      # Transfer domain wrappers
│   │   ├── notification-service.ts  # Facade (real vs noop for Expo Go)
│   │   ├── storage-service.ts       # AsyncStorage helpers
│   │   └── ...                      # Currency, device, entitlement, etc.
│   ├── store/
│   │   ├── app-store.ts             # deviceId, onboarding flag
│   │   ├── vehicle-store.ts         # Active vehicle ID, count
│   │   ├── entitlement-store.ts     # Subscription plan (useSyncExternalStore)
│   │   └── fleet-data-cache.ts      # In-memory fleet snapshot (5-min TTL)
│   ├── hooks/                       # 12 custom hooks
│   ├── utils/
│   │   ├── calculations/            # Due status, intervals, sorting, spending
│   │   ├── formatting/              # Date, mileage display
│   │   ├── sharing/                 # Slug generation, URL building
│   │   └── log-type-filter.ts       # Fuel/transmission applicability
│   ├── types/                       # 8 type definition files
│   ├── constants/                   # Config, theme, thresholds, notification IDs
│   └── icons/                       # SVG + PNG icon source files
└── docs/                            # Product documentation (10 files)
```

---

## 4. Navigation Architecture

### Provider Hierarchy (App.tsx)

```
GestureHandlerRootView
  └── SafeAreaProvider
        └── ErrorBoundary
              └── AuthProvider
                    └── StatusBar (light)
                    └── AppNavigationContainer
                          └── RootNavigator
```

### Navigation Stacks

**RootNavigator** (native stack, no header):

| Stack | Contains |
|-------|----------|
| `SetupFlow` | Splash, Onboarding, AddVehicle, Auth, OTPVerification, Username, BusinessDetails |
| `AppFlow` | Vehicle, Garage, GarageAnalytics, SelectLogType, AddLog, MaintenanceHistory, UpdateMileage, Spending, ShareLink, Transfer, Account, Auth (in-app), OTPVerification, Username, Paywall, Export, CompanySettings, ReminderSettings, EditVehicle |

### Routing Logic (Splash Screen)

```
App Launch
  ├── Onboarding not completed → Onboarding Screen
  ├── Onboarding done, no vehicles → Add Vehicle Screen
  ├── 1 vehicle → AppFlow with Vehicle Screen as active tab
  └── 2+ vehicles → AppFlow with Garage Screen as root
```

The `useNotificationNavigation` hook in `RootNavigator` handles cold/warm start deep linking from notification taps, routing to `updateMileage` or `maintenanceHistory` based on notification payload type.

---

## 5. Database Schema

**8 tables** in Supabase `public` schema:

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **user_devices** | Device identity + subscription | `device_id`, `subscription_status`, `unit` (km/mi), `currency_code` |
| **vehicles** | Vehicle profiles | `name`, `year`, `fuel_type`, `transmission`, `current_odometer`, `image_url`, `shared_link`, `is_active`, `auth_user_id`, `user_id_link` (→ device) |
| **log_categories** | Maintenance groups | `category_name`, `image_url` (8 categories: Engine, Transmission, Fluids, Brakes, Wheels, Electrical, HVAC, Other) |
| **log_types** | Maintenance item definitions | `log_type_name`, `category_link`, `due_type` (mileage/time), `base_due`, `diesel_increment`, `hybrid_increment`, `spec_name`, `spec_placeholder`, `fuel_type[]`, `transmission[]` |
| **user_logs** | Maintenance log entries | `car_id`, `log_type`, `change_date`, `odo_log`, `cost_amount`, `specs`, `notes`, `created_by_auth_id` |
| **user_profiles** | Auth user display info | `auth_user_id`, `username`, `public_id` (CC-######) |
| **company_profiles** | Pro user business details | `auth_user_id`, `company_name`, `billing_email`, `business_address` |
| **transfer_requests** | Vehicle ownership transfers | `vehicle_id`, `sender_auth_id`, `recipient_auth_id`, `status`, `resolved_at` |

### Supabase RPC Functions (27 total)

**Guest/device operations:** `create_device`, `get_device`, `create_guest_vehicle`, `get_guest_vehicle`, `get_guest_vehicles`, `create_guest_log`, `get_guest_logs`, `get_guest_logs_by_type`, `delete_guest_log`, `delete_guest_vehicle`, `set_guest_share_link`, `update_guest_vehicle_odometer`, `update_guest_vehicle_profile`

**Auth-aware operations:** `claim_guest_vehicles`, `update_device_subscription`, `update_device_currency`, `update_device_unit`

**Transfer operations:** `create_transfer_request`, `respond_to_transfer_request`, `cancel_transfer_request`, `get_incoming_transfer_requests`, `get_vehicle_pending_transfer`, `lookup_recipient`

**Shared link (public):** `get_shared_vehicle`, `get_shared_vehicle_logs`

### Edge Functions

- **`delete-user`** — Deno handler that authenticates via JWT, then uses `SUPABASE_SERVICE_ROLE_KEY` to call `auth.admin.deleteUser()` for full account deletion.

---

## 6. Authentication System

### Auth Flows

| Method | Implementation |
|--------|---------------|
| **Google OAuth** | PKCE flow via `expo-web-browser` → `openAuthSessionAsync` → code exchange with Supabase |
| **Apple Sign-In** | `expo-apple-authentication` (UI present but currently disabled) |
| **Email OTP** | `sendEmailOtp()` → 6-digit code → `verifyEmailOtp()` via Supabase Auth |

### Auth Context (`AuthProvider`)

The `AuthProvider` wraps the entire app and provides:

- **`session`** — Supabase session (JWT, user, tokens)
- **`userProfile`** — App-level profile (username, public_id)
- **`isAuthenticated`** / **`isGuest`** — Derived booleans
- **`needsUsername`** — Authenticated but no profile yet
- **`refreshProfile()`** — Re-fetch profile from DB

### Auth State Change Handler

On `SIGNED_IN`:
1. Look up device ID from local storage
2. Claim guest vehicles (`claimGuestVehicles` RPC) — transfers device vehicles to auth user
3. Clear vehicle cache
4. Reload entitlement
5. Fetch user profile

On `SIGNED_OUT`:
1. Reset entitlement store
2. Clear vehicle cache
3. Clear user profile

### Deep-Link OAuth Fallback

A `Linking` event listener in `AuthProvider` handles OAuth redirects that arrive as deep links (cold start or when `openAuthSessionAsync` doesn't capture the redirect), exchanging PKCE codes with a race guard.

---

## 7. Device Identity & Guest Mode

### Device Bootstrap (`ensureDeviceIdentity`)

On first launch:
1. Check AsyncStorage for `device_id`
2. If none, generate UUID via `expo-crypto`
3. Upsert device record via `create_device` RPC
4. Seed default currency from device locale
5. Store `device_id` in AsyncStorage

### Guest vs Authenticated

| Aspect | Guest | Authenticated |
|--------|-------|--------------|
| Vehicle ownership | Via `user_id_link` (device_id) | Via `auth_user_id` |
| API layer | Guest RPCs (`create_guest_*`, `get_guest_*`) | Direct table access with RLS |
| Vehicle limit | Based on device subscription | Based on device subscription |
| On sign-in | Guest vehicles auto-claimed | Claimed + existing vehicles merged |
| On sign-out | Account vehicles hidden, cache cleared | Routes to Add Vehicle if no guest vehicles |

---

## 8. Subscription & Entitlement System

### Plans

| Plan | Car Limit | Features |
|------|-----------|----------|
| **Free** | 1 vehicle | Core maintenance tracking, basic sharing |
| **Base** | 3 vehicles | Multi-vehicle, full sharing |
| **Pro** | 10 vehicles | Fleet analytics, spending insights, CSV export, QR download, business profile |

### Implementation

- Subscription stored on `user_devices.subscription_status`
- `loadEntitlement()` fetches device record → normalizes plan → populates `entitlement-store`
- `useEntitlement()` hook exposes `plan`, `canAddCar`, `refresh()`
- `canAddVehicle()` compares current vehicle count against plan limit
- **No real IAP** — paywall simulates purchase by updating device subscription via `updateDeviceSubscription` API call

### Entitlement Gates

| Feature | Free | Base | Pro |
|---------|------|------|-----|
| Add vehicle beyond limit | Blocked | Up to 3 | Up to 10 |
| Spending screen | Marketing CTA | Full | Full |
| Fleet analytics | N/A | N/A | Full |
| QR code download | Blocked | Full | Full |
| CSV export | N/A | N/A | Full |
| Company profile | N/A | N/A | Full |
| Compact garage cards | N/A | N/A | Yes |
| Business details prompt | No | No | Post-signup |

---

## 9. Feature Inventory

### 9.1 Onboarding

**Screen:** `onboarding-screen.tsx` (111 lines)

- 4 swipeable slides (`FlatList` with `pagingEnabled`)
- Programmatic scroll only (buttons, not swipe)
- "Continue" advances slides; "Get Started" on last slide
- Persists `onboarding_completed = true` in AsyncStorage
- Navigates to Add Vehicle screen

### 9.2 Vehicle Management

**Screens:** `add-vehicle-screen.tsx` (438 lines), `edit-vehicle-screen.tsx` (208 lines)

**Add Vehicle:**
- Photo picker (camera/gallery) with `expo-image-picker`
- Image optimization: resize to 1920px long edge, JPEG compression, 10MB cap
- Fields: name, year, fuel type (Petrol/Diesel/Hybrid/Electric), transmission (Automatic/Manual), odometer
- Distance unit toggle (km/mi) on first vehicle
- Validation: year 1900–next year, odometer 0–9,999,999
- Image uploaded to Supabase Storage (`vehicle-images` bucket)
- First vehicle: shows reminder opt-in bottom sheet after creation
- Additional vehicles: checks entitlement limits; guest users see sign-in gate

**Edit Vehicle:**
- Change name and photo only
- Sends only changed fields (delta update)

**Delete Vehicle:**
- Confirmation alert
- Navigates based on remaining fleet size: garage (2+), vehicle (1), or add-vehicle (0)

### 9.3 Garage (Multi-Vehicle)

**Screen:** `garage-screen.tsx` (692 lines)

- Grid/list of all user vehicles with search
- Transfer request cards at top (Accept/Decline)
- Pro: `FleetAnalyticsCard` with this-month spending
- Vehicle cards show danger count badges (overdue + warning items)
- Pro users see compact cards; free/base see full cards
- "Add New Car" button with entitlement check
- Guest users see sign-in gate modal for certain actions
- Sets `activeVehicleId` in store before navigating to vehicle

**Dynamic root behavior:**
- 1 vehicle → Vehicle Screen is the app root
- 2+ vehicles → Garage Screen is the app root

### 9.4 Maintenance Tracking

**Vehicle Screen:** `vehicle-screen.tsx` (381 lines)

- Vehicle hero card with photo, name, year/fuel/transmission
- Spending card (tappable → spending analytics)
- Mileage card with current odometer and unit
- Maintenance categories with items, each showing:
  - Due status badge (normal / warning / overdue / neutral)
  - "Change in X km/mi" or "Change in X days" label
  - "Add Log" quick action
- Items filtered by vehicle fuel type and transmission
- Items sorted by priority: overdue → warning → normal → neutral
- Neutral/no-data items hidden from display (only items with status shown)

### 9.5 Maintenance Calculations & Due Status

**Core logic in `src/utils/calculations/`:**

**Effective Due Interval:**
```
effective_due = base_due × fuel_multiplier
  - Petrol: 1.0×
  - Diesel: diesel_increment (from log_type)
  - Hybrid: hybrid_increment (from log_type)
  - Electric: 1.0× (base)
  - Invalid/missing multiplier: fallback to 1.0×
  - Result rounded to integer
```

**Mileage-Based Due Status:**
```
next_due = latest_log.odo_log + effective_due
remaining = next_due - current_odometer

  remaining < 0           → OVERDUE ("Overdue by X km")
  remaining ≤ WARNING_DIST → WARNING ("Change in X km")
  remaining > WARNING_DIST → NORMAL  ("Change in X km")
  no logs                  → NEUTRAL ("No data yet")
```

**Time-Based Due Status:**
```
next_due_date = latest_log.change_date + effective_due (days)
remaining_days = next_due_date - today

  remaining_days < 0           → OVERDUE ("Overdue by X days")
  remaining_days ≤ WARNING_DAYS → WARNING ("Change in X days")
  remaining_days > WARNING_DAYS → NORMAL  ("Change in X days")
  no logs                       → NEUTRAL ("No data yet")
```

**Thresholds:**
- `WARNING_DISTANCE`: 1000 (in vehicle's unit — km or mi)
- `WARNING_DAYS`: 30 days

**Distance conversion:** km → mi uses `KM_TO_MI = 0.621371` when vehicle unit is miles.

**Sorting (priority order):**
1. Overdue (smallest remaining first)
2. Warning (smallest remaining first)
3. Normal (smallest remaining first)
4. Neutral (alphabetical by name)

### 9.6 Logging

**Screens:** `select-log-type-screen.tsx` (106 lines), `add-log-screen.tsx` (267 lines)

**Select Log Type:**
- Shows items in selected category
- Filters by vehicle fuel type and transmission (`isLogTypeApplicableToVehicle`)

**Add Log:**
- Dynamic form based on log type:
  - Mileage field (required for mileage-based items)
  - Date picker (required)
  - Specification field with dynamic label/placeholder from `spec_name`/`spec_placeholder`
  - Cost field (optional, with currency)
  - Notes (optional, multiline)
- Validation: mileage required for non-time items, date required, no negative mileage
- After saving: optionally schedules time-based service reminders

### 9.7 Maintenance History

**Screen:** `maintenance-history-screen.tsx` (132 lines)

- Shows all logs for a specific log type on the active vehicle
- Header: icon, log type name, current due status badge
- Logs sorted newest first (by date)
- Each log row shows: mileage, date, spec, cost (with currency symbol), notes
- Delete button only for own logs (`created_by_auth_id` matches session)
- Transferred vehicle logs from previous owner are read-only

### 9.8 Mileage Updates

**Screen:** `update-mileage-screen.tsx` (158 lines)

- Shows current odometer as read-only card
- New mileage input field
- Validation: must not be below highest logged mileage across all log types
- On success: triggers mileage reminder reschedule

### 9.9 Spending Analytics

**Screen:** `spending-screen.tsx` (639 lines)

- **Free users:** Marketing CTA with image → paywall
- **Subscribers (Base+):** Full analytics dashboard:
  - Natural-language insight sentence ("You spent X this year, Y% more than last year")
  - Monthly bar chart for selected year with year picker
  - Stat cards: this month, this year, average monthly
  - Top spending category card
  - Category breakdown with animated percentage bars
  - Recent expenses list (last 5)
  - Empty state for no cost data

### 9.10 Fleet Analytics (Garage-Level)

**Screen:** `garage-analytics-screen.tsx` (585 lines)

- **Pro only** — accessed from Garage screen
- Fleet-wide spending across all vehicles:
  - Yearly bar chart with year picker
  - Stat cards: this month, this year, total fleet
  - Tab switcher: By Category / By Vehicle
  - Category: percentage breakdown bars
  - Vehicle: expandable rows with per-vehicle spending
  - "Export" button → CSV export screen
- Uses fleet data cache (5-minute TTL) to avoid redundant fetches

### 9.11 CSV Export

**Screen:** `export-screen.tsx` (272 lines)

- Date range picker (From / To)
- Generates CSV with columns: Vehicle, Date, Category, Type, Mileage, Cost, Spec, Notes
- Uses `expo-file-system` to write temp CSV file
- Shares via `expo-sharing` native share sheet

### 9.12 Share Link

**Screen:** `share-link-screen.tsx` (192 lines)

- **Create sharing:** Generates 10-char alphanumeric slug, stores on vehicle record
- **Active sharing:** Shows:
  - QR code (`react-native-qrcode-svg`)
  - Full URL: `https://carcarediary.com/{slug}`
  - Copy to clipboard button
  - Native share button
  - "Download QR" button (Base+ only, captures QR as PNG)
  - Stop sharing button (clears slug)
- Public page at URL shows read-only vehicle history (via `get_shared_vehicle` / `get_shared_vehicle_logs` RPCs)

### 9.13 Vehicle Transfer

**Screen:** `transfer-screen.tsx` (212 lines)

- Send vehicle to another user by **CarCare ID** (CC-######)
- Flow: Enter ID → Look up user → Confirm → Send request
- Self-transfer blocked
- Recipient sees transfer card on Garage screen
- Accept: vehicle moves to recipient, cache refreshed
- Decline: request resolved, no changes
- Sender can cancel pending transfer from Vehicle screen
- Transfer lock: vehicle editing disabled while transfer pending

### 9.14 Notifications & Reminders

**Screens:** `reminder-settings-screen.tsx` (180 lines)

**Reminder Settings:**
- Mileage update interval picker: Weekly / Every 2 Weeks / Monthly / Every 3 Months
- Due-soon service notifications toggle
- OS permission status display with "Open Settings" link

**Notification System (local only, no push server):**

Three notification types:

1. **Mileage Reminder** — Periodic nudge to update odometer
   - Scheduled based on interval from settings + last mileage update timestamp
   - Unique ID per vehicle: `mileage-reminder-{vehicleId}`

2. **Mileage-Based Service Reminders** — When odometer approaches next service
   - Two tiers: Tier 1 (approaching) and Tier 2 (imminent/overdue)
   - Triggered reactively during `evaluateReminders` on vehicle screen focus
   - Unique IDs: `mileage-svc-t1-{vehicleId}-{logTypeId}`, `mileage-svc-t2-{vehicleId}-{logTypeId}`

3. **Time-Based Service Reminders** — When calendar date approaches next service
   - Warning notification at 30 days before due
   - Due notification at due date
   - Scheduled with `expo-notifications` `trigger: { date }` or `trigger: { seconds }`
   - Unique IDs: `time-svc-warning-{vehicleId}-{logTypeId}`, `time-svc-due-{vehicleId}-{logTypeId}`

**Evaluation Flow (`evaluateReminders`):**
- Runs on Vehicle screen focus with cooldown debounce
- Checks reminder settings (respects user toggle)
- Schedules/updates mileage safety-net reminder
- For each maintenance item: computes due status, schedules appropriate tier notifications
- Cleans up legacy notification IDs from previous versions

**Expo Go Fallback:**
- `notification-service.ts` detects Expo Go → imports no-op stubs
- Dev builds dynamically import real `expo-notifications` implementation

**Test Mode:**
- `NOTIFICATION_TEST_MODE` flag uses minute-based delays instead of day-based for development

**Notification Tap Navigation:**
- `useNotificationNavigation` hook in RootNavigator
- Reads payload → sets active vehicle → navigates to relevant screen
  - `mileage-reminder` → Update Mileage screen
  - `service-due-soon` → Maintenance History screen

### 9.15 Account Management

**Screen:** `account-screen.tsx` (631 lines)

**Guest view:**
- "Create Account" and "Sign In" buttons → Auth screen

**Authenticated view:**
- Username display
- CarCare ID with copy-to-clipboard (CC-######)
- Current plan display with car limit
- "Upgrade" button → Paywall

**Settings rows:**
- Reminder Settings → Reminder Settings screen
- Company Settings → Company Settings screen (Pro)
- Currency → Modal picker with 150+ currencies + search
- Support → Opens email link
- Privacy Policy → Opens URL

**Destructive actions:**
- Sign Out: clears session + vehicle cache → routes to setup flow
- Delete Account: cascade deletes (logs → vehicles → company → transfer requests → profile) → calls `delete-user` edge function → sign out

### 9.16 Paywall & Plans

**Screen:** `paywall-screen.tsx` (385 lines)

- Shows Base and Pro plan cards with feature lists
- Current plan highlighted and disabled
- "Upgrade" CTA changes label based on context
- **Simulated purchase:** Updates `user_devices.subscription_status` via API (no real IAP)
- Pro upgrade for authenticated users: navigates to Business Details after purchase
- Pro upgrade for guests: shows `GuestProModal` encouraging account creation
- "Restore Purchase" link (reloads entitlement from device record)

### 9.17 Company Profile (Pro)

**Screens:** `business-details-screen.tsx` (173 lines), `company-settings-screen.tsx` (198 lines)

- Fields: Company Name (required), Billing Email (required, validated), Business Address (optional)
- Business Details screen: shown post-Pro-signup flow, "Skip for now" option
- Company Settings screen: editable from Account, loads existing profile
- Data stored in `company_profiles` table

### 9.18 Currency Support

- 150+ currencies defined in `currency-service.ts`
- Default seeded from device locale on first launch
- Stored both in AsyncStorage (cache) and `user_devices.currency_code` (remote)
- Currency picker modal in Account screen with search
- `useCurrency()` hook provides `currencyCode`, `currencySymbol`, `updateCurrency()`
- Cost values stored as numbers; symbol applied at display time

---

## 10. State Management

### Module-Level Stores

| Store | Location | Purpose | Subscription Model |
|-------|----------|---------|-------------------|
| `app-store` | `store/app-store.ts` | `deviceId`, `onboardingCompleted` | Get/set (no reactivity) |
| `vehicle-store` | `store/vehicle-store.ts` | `activeVehicleId`, `vehicleCount` | Get/set (no reactivity) |
| `entitlement-store` | `store/entitlement-store.ts` | Current subscription `plan` | `useSyncExternalStore` |
| `fleet-data-cache` | `store/fleet-data-cache.ts` | Fleet vehicles + logs snapshot | Get/set with 5-min TTL |

### React Context

| Context | Provider | Hook | Purpose |
|---------|----------|------|---------|
| `AuthContext` | `AuthProvider` (wraps entire app) | `useAuth()` | Session, profile, guest/auth state |

### Custom Hooks (12)

| Hook | Purpose |
|------|---------|
| `useAppBootstrap` | Device identity, onboarding, vehicle existence check on launch |
| `useAuth` | Auth context consumer |
| `useVehicleData` | Full vehicle screen data loader (vehicle, device, categories, types, logs) |
| `useVehicle` | Simple active vehicle loader |
| `useMaintenanceHistory` | Maintenance history view model builder |
| `useShareLink` | Share link CRUD + clipboard/share actions |
| `useEntitlement` | Subscription plan + `canAddCar` |
| `useCurrency` | Currency code/symbol + update |
| `useNotifications` | Evaluates reminders on vehicle data ready |
| `useNotificationNavigation` | Cold/warm start notification tap routing |
| `useTransferRequests` | Incoming transfer list loader |
| `useSpendingRowSummary` / `useSpendingAnalytics` | Spending card summaries and analytics |

---

## 11. Business Logic — Core Calculations

All pure calculation logic lives in `src/utils/calculations/`:

### Due Status Pipeline

```
Vehicle + LogType + Logs + Device
    │
    ├── getEffectiveDueInterval(logType, fuelType)
    │       → base_due × multiplier
    │
    ├── getLatestLog(logs, vehicleId, logTypeId)
    │       → most recent log by date/mileage
    │
    ├── getMileageDueStatus(odometer, latestLog, interval, unit)
    │   OR getTimeDueStatus(latestLog, interval)
    │       → { variant, label, remaining }
    │
    └── computeDueStatus(vehicle, logType, logs, unit)
            → MaintenanceItemStatus (orchestrator)
```

### Spending Pipeline

```
Vehicle Logs + LogTypes + Categories
    │
    ├── computeYearMonthlyTotals(logs, year)     → 12-month bar data
    ├── computeThisMonthSpending(logs)            → number
    ├── computeYearSpending(logs, year)           → number
    ├── computeCategoryBreakdown(logs, types, cats) → sorted categories
    ├── computeRecentExpenses(logs, types, limit) → latest cost entries
    └── computeSpendingSummary(logs, types, cats) → full summary object
```

### Fleet Spending Pipeline

```
All Vehicles + All Logs + LogTypes + Categories
    │
    ├── computeFleetYearMonthlyTotals(...)  → fleet monthly bars
    ├── computeFleetThisMonthSpending(...)  → fleet month total
    ├── computeFleetYearSpending(...)       → fleet year total
    ├── computeFleetCategoryBreakdown(...)  → fleet category %
    ├── computeFleetVehicleBreakdown(...)   → per-vehicle summaries
    └── computeFleetExportRows(...)         → CSV row data
```

### Maintenance Summary Builder

```
getMaintenanceSummary(vehicleData)
    │
    ├── Filter log types by vehicle fuel/transmission
    ├── For each category:
    │   ├── For each applicable log type:
    │   │   └── computeDueStatus() → status variant + label
    │   └── sortMaintenanceItemsByPriority()
    └── Return CategoryDisplay[] with sorted ItemDisplay[]
```

---

## 12. Notification System — Detailed Logic

### Evaluation Trigger

```
Vehicle Screen Focus
    → useNotifications(vehicleData)
        → evaluateReminders(vehicleData) [with cooldown]
```

### Mileage Reminder Logic

```
if settings.mileageReminderEnabled:
    lastUpdate = getLastMileageUpdate(vehicleId)
    intervalDays = getMileageReminderDays(settings.mileageInterval)
    nextDue = lastUpdate + intervalDays
    
    if nextDue <= now:
        schedule notification for tomorrow morning 9:00 AM
    else:
        schedule notification for nextDue at 9:00 AM
```

### Service Reminder Logic (Mileage-Based)

```
for each maintenance item with due_type = 'mileage':
    status = computeDueStatus(...)
    
    if status = OVERDUE or remaining ≤ TIER2_THRESHOLD:
        schedule tier-2 notification (imminent)
        cancel tier-1 if exists
    elif remaining ≤ TIER1_THRESHOLD:
        schedule tier-1 notification (approaching)
```

### Service Reminder Logic (Time-Based)

```
for each maintenance item with due_type = 'time':
    if has latest log:
        dueDate = latestLog.changeDate + effectiveInterval
        daysUntilDue = dueDate - today
        
        if daysUntilDue ≤ 0:
            schedule "overdue" notification for tomorrow 9:00 AM
        elif daysUntilDue ≤ WARNING_DAYS:
            schedule "due soon" notification for tomorrow 9:00 AM
        elif daysUntilDue ≤ WARNING_DAYS + 7:
            schedule warning notification for (dueDate - WARNING_DAYS)
            schedule due notification for dueDate
```

### Notification ID Scheme

| Type | ID Pattern |
|------|-----------|
| Mileage reminder | `mileage-reminder-{vehicleId}` |
| Mileage service T1 | `mileage-svc-t1-{vehicleId}-{logTypeId}` |
| Mileage service T2 | `mileage-svc-t2-{vehicleId}-{logTypeId}` |
| Time service warning | `time-svc-warning-{vehicleId}-{logTypeId}` |
| Time service due | `time-svc-due-{vehicleId}-{logTypeId}` |

---

## 13. Services Layer

### API Layer (`src/services/api/`)

| File | Tables/RPCs | Key Operations |
|------|------------|----------------|
| `supabase-client.ts` | — | Client init with AsyncStorage, PKCE, auto-refresh |
| `device-api.ts` | `user_devices` | get/create device, update unit/currency/subscription |
| `vehicle-api.ts` | `vehicles` | CRUD, share link, odometer, claim guest vehicles |
| `user-log-api.ts` | `user_logs` | CRUD logs, guest vs auth branching |
| `log-type-api.ts` | `log_types` | Read log types by ID or category |
| `category-api.ts` | `log_categories` | Read all categories |
| `user-profile-api.ts` | `user_profiles` | Get/create/update profile, public_id generation |
| `company-profile-api.ts` | `company_profiles` | Get/upsert/delete company profile |
| `transfer-api.ts` | `transfer_requests` | All transfer RPCs |
| `storage-api.ts` | Supabase Storage | Upload vehicle images to `vehicle-images` bucket |

### Domain Services (`src/services/`)

| Service | Responsibility |
|---------|---------------|
| `auth-service` | Google/Apple/Email auth flows, session, sign-out with cache clear |
| `vehicle-service` | Vehicle lifecycle, cache management, image optimization, mileage validation |
| `log-service` | Log validation and submission |
| `share-service` | Enable/disable public sharing |
| `transfer-service` | Transfer domain logic + cache refresh on accept |
| `notification-service` | Facade pattern: real `expo-notifications` vs no-op stubs |
| `device-identity-service` | First-launch device bootstrap |
| `entitlement-service` | Plan limits, normalization, display names |
| `currency-service` | 150+ currency definitions, symbol lookup |
| `storage-service` | AsyncStorage helpers for app state |
| `launch-routing-service` | Splash screen route resolution |
| `image-optimization-service` | Resize/compress photos before upload |
| `reminder-settings-service` | Local reminder preference persistence |

---

## 14. Component Library

### Buttons (3)
- `PrimaryButton` — Blue CTA with glow effect, optional icon, loading state
- `OutlineButton` — Secondary bordered button with optional icon
- `ActionChipButton` — Small link-colored chip for inline actions

### Cards (7)
- `ContentCard` — Base rounded card wrapper
- `VehicleHeroCard` — Large hero with overlapping info card
- `MaintenanceCategoryCard` — Category with icon, title, item rows
- `MileageCard` — Odometer display with icon
- `SpendingCard` — Tappable spending summary row
- `OnboardingSlideCard` — Full-width onboarding slide
- `TransferRequestCard` — Incoming transfer with Accept/Decline

### Feedback (11)
- `BottomSheet` — Modal sheet with drag handle
- `StatusBadge` — Due status pill (neutral/normal/warning/overdue)
- `LoadingState` — Full-screen activity indicator
- `ErrorState` — Error message with retry
- `EmptyState` — Empty content placeholder
- `ErrorBoundary` — Class-based crash boundary with restart
- `PaginationDots` — Onboarding dot indicator
- `PremiumGate` — Upgrade upsell block
- `SignInGateModal` — Auth gate modal
- `GuestProModal` — Guest Pro explanation modal
- `ReminderOptInSheet` — First-car notification opt-in

### Icons (2 files, 22+ components)
- `app-icons.tsx` — BackArrow, ThreeDots, Account, Danger, SubscriptionStar, Support, PrivacyPolicy, ChevronRight, ChevronDown, GoogleLogo, AppleLogo, Crown, Trash, Dollar, Bell, Check, BarChart, Search, Building
- `row-icons.tsx` — Calendar, Cost, Tag

### Inputs (4)
- `LabeledTextInput` — Single-line field with label, error, right element
- `LabeledMultilineInput` — Multiline notes field
- `DateInputField` — Date picker with iOS spinner/Android dialog
- `OptionPillGroup` — Generic pill selector (fuel type, transmission)

### Layout (2)
- `ScreenTitleBlock` — Large page title + subtitle
- `SectionHeader` — Section title + subtitle

### Lists (3)
- `MaintenanceItemRow` — Item with status badge and "Add Log"
- `HistoryLogRow` — Log entry card with delete option
- `LogTypeRow` — Pressable row for log type selection

---

## 15. Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0051E8` | CTAs, active states |
| Background | `#0C111F` | App background |
| Card | `#141A2B` | Card surfaces |
| Border | `#1F2740` | Dividers, borders |
| Text Primary | `#FFFFFF` | Headings, body |
| Text Secondary | `#A3ACBF` | Subtitles, hints |
| Link | `#367DFF` | Interactive text |
| Warning | `#FFB020` | Due-soon states |
| Danger/Overdue | (red tones) | Overdue states |

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Page Title | Poppins | 28px | ExtraBold |
| Section Title | Poppins | 20px | Bold |
| Body | Poppins | 16px | Regular |
| Caption | Poppins | 14px | Regular |
| Small | Poppins | 12px | Regular |

### Spacing & Radius

- Base spacing unit: 8px (xs=4, sm=8, md=16, lg=24, xl=32)
- Button/input radius: 10px
- Card/image radius: 14px
- Dark-first UI throughout
- Primary button has blue glow shadow effect

---

## 16. Assets

### Root `assets/`

| File | Purpose |
|------|---------|
| `icon.png` | App icon |
| `splash-icon.png` | Splash screen logo |
| `android-icon-foreground.png` | Android adaptive icon |
| `android-icon-monochrome.png` | Android monochrome icon |
| `onboarding-4.png` | Onboarding slide image |
| `spending_sub.png` | Spending marketing image (paywall) |

### `src/icons/` (15 files)

SVG icons: back-arrow, 3-dots, account, danger, dollar, bell, crown, trash, support, privacy-policy, subscription-star, google-logo, apple-logo
PNG icons: subscription-logo, icon-spendings

---

## 17. Build & Configuration

### Expo Configuration (`app.json`)

- **Scheme:** `carcarediary` (deep linking)
- **Orientation:** Portrait only
- **User Interface Style:** Dark
- **Bundle ID / Package:** `com.carcarediary.app`
- **EAS Project ID:** `dc58c2ae-acf8-42c0-ad17-3f9fe6f08a08`

### Plugins

- `expo-font`, `expo-asset`
- `expo-apple-authentication`
- `@react-native-community/datetimepicker`
- `expo-notifications` (Android icon + primary color)
- `@react-native-google-signin/google-signin` (iOS URL scheme placeholder)
- `expo-web-browser`, `expo-sharing`

### TypeScript

- Extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` → `src/*`

### NativeWind

- Babel preset with JSX import source
- `global.css` for Tailwind directives

### Build Scripts

```
npm start           → expo start
npm run android     → expo start --android
npm run ios         → expo start --ios
npm run build:apk   → eas build --platform android --profile preview
```

---

## 18. Known Deviations & Open Items

### Not Yet Implemented (from docs)
- Real In-App Purchase (currently simulated via device subscription update)
- Apple Sign-In (UI present but disabled)
- Public web page at `carcarediary.com/{slug}` (RPCs exist, web frontend TBD)
- Push notifications (currently local-only via `expo-notifications`)

### Dev Artifacts
- `NOTIFICATION_TEST_MODE = true` in `notification-test-mode.ts` — should be `false` for production
- `ui-playground-screen.tsx` — dev-only visual sandbox (no product flow)
- Google iOS client ID is a placeholder in `app.json`

### Architecture Notes
- No SQL migration files in repository — schema managed directly in Supabase dashboard
- No automated tests — testing criteria documented but not implemented as code
- Fleet data cache uses simple 5-minute TTL in memory (cleared on app restart)
- Vehicle cache uses AsyncStorage for single-vehicle persistence
- Auth state change handler has a race condition guard for OAuth code exchange

### Documentation vs Implementation
- Documentation describes phases 1–16 (MVP) + Post-MVP A, B, C
- Current implementation has completed beyond MVP: Auth (Phase A), guest claim (Phase B), Garage (Phase C), plus spending analytics, fleet analytics, CSV export, vehicle transfer, company profiles, and currency support — features not explicitly in the original roadmap phases
