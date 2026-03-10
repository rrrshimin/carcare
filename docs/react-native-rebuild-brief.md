React Native Rebuild Brief
Purpose of This Document

This document explains how CarCare Diary should be rebuilt from scratch as a React Native application.

It is intended for AI coding tools such as Cursor or Codex, as well as human developers.

The purpose is to ensure that the rebuild:

preserves the existing MVP product logic

improves maintainability

uses a clean scalable architecture

avoids FlutterFlow-specific limitations

creates a solid foundation for future features

This document should be read together with:

product-overview.md

app-flows.md

screen-specifications.md

business-logic.md

database-schema.md

1. Rebuild Goal

Rebuild the current CarCare Diary MVP as a React Native mobile app.

The current app already exists in FlutterFlow as an MVP and serves as the product reference.

The rebuild should not copy FlutterFlow structure or limitations.
Instead, it should preserve the product behavior while creating a cleaner codebase and better long-term architecture.

The React Native version should be treated as the new main codebase.

2. Product Context

CarCare Diary is a vehicle maintenance tracking app.

Core user value:

add a vehicle

track maintenance history

understand what is due next

update mileage

receive reminders

share a public maintenance history link

The current MVP is focused on a single core use case:

personal vehicle maintenance tracking

Future expansion may include:

multiple vehicles

paid subscriptions

reseller workflows

public sale-ready maintenance history pages

analytics

AI-assisted insights

The rebuild should support MVP first, but should not block these future directions.

3. Rebuild Principles
Preserve Existing Product Logic

The rebuild must preserve the existing app logic described in the docs.

Do not invent alternative product behavior unless clearly necessary.

Prefer Simplicity

The codebase should be easy to understand and maintain.

Avoid overengineering.

Do not introduce unnecessary abstraction layers.

Separate UI From Logic

Business logic must not live inside screen components.

Calculations, data shaping, and backend interaction should be separated from presentational UI.

Make Future Expansion Easy

Even though MVP is simple, the architecture should make it easy to add:

multiple vehicles

auth

subscriptions

analytics

more advanced sharing

richer notification logic

Use TypeScript Everywhere

All application code should use TypeScript.

Avoid any unless absolutely necessary.

4. Current MVP Scope to Implement

The React Native rebuild should support the following screens and flows:

App Launch

splash screen

local state checks

route to onboarding, add vehicle, or home

Onboarding

1 to 3 onboarding slides

continue / get started flow

local persistence of completion state

Vehicle Setup

add first vehicle

upload vehicle photo

save vehicle details

store unit preference

Home Dashboard

show current vehicle

show maintenance categories

show maintenance items inside categories

show due status

show warning state

provide new log button

provide share button

provide update mileage button

Maintenance Logging

choose maintenance item within category

add log with mileage, date, spec, notes

save to backend

refresh calculations

Maintenance Detail Screen

show current due state

show warning state

show log history

Mileage Update

update current vehicle odometer

recalculate due statuses

Sharing

generate public share link

show link

show QR code

stop sharing

Notifications

mileage reminder

due service reminder

5. Non-Goals for Initial Rebuild

The initial React Native rebuild does not need to include advanced future features unless explicitly requested.

Do not implement these now unless separately scoped:

full authentication system

multi-user collaboration

advanced analytics dashboards

billing/payment flows

reseller fleet dashboards

admin panel

complex offline sync

AI assistant features

mechanic integrations

full web application for management

The only web-related feature that matters now is the public shared vehicle history page, which may be handled separately from the mobile app if needed.

6. Recommended Tech Direction

This section is a recommendation, not an absolute requirement.

Core Stack

React Native

TypeScript

Recommended App Setup

Use a modern React Native setup with clear support for:

iOS

Android

image upload

push/local notifications

clean navigation

future scalability

Recommended Libraries
Navigation

Use a standard navigation library for:

stack navigation

nested flows

modals if needed

State Management

Use lightweight predictable state management.

Recommended options:

Zustand for app/global state

or Redux Toolkit only if there is a strong reason

For this MVP, lighter state management is preferred.

Server State / Data Fetching

Use a dedicated async data fetching layer.

Recommended:

TanStack Query / React Query

This helps with:

caching

refresh after mutations

loading/error states

future scalability

Forms

Use a structured form approach for:

add vehicle

add log

update mileage

Validation

Use a schema-based validation approach where practical.

Date Handling

Use a stable date library or standard utilities consistently.

Image Upload

Provide a clean abstraction for:

selecting vehicle image

uploading image

storing image URL

QR Code

Use a reliable QR rendering library for the share screen.

Notifications

Use a notification solution that supports:

local reminders

future push support if needed

7. Backend Strategy

The rebuild should be backend-agnostic at the architecture level.

Even if the first implementation uses Supabase or another backend, the frontend should avoid being tightly coupled to one backend everywhere in the UI.

Recommended Approach

Create a clean service/data layer between UI and backend.

Example responsibility split:

screens: user interaction and rendering

hooks/use cases: orchestration

services/repositories: backend calls

utils/domain logic: calculations and transformations

This allows switching backend later with lower rewrite cost.

8. Suggested Frontend Architecture

A simple scalable structure is recommended.

Example:

src/
  app/
  navigation/
  screens/
  components/
  features/
  services/
  store/
  hooks/
  utils/
  types/
  constants/
  assets/

More detailed example:

src/
  navigation/
    root-navigator.tsx
    app-navigator.tsx

  screens/
    splash/
    onboarding/
    add-vehicle/
    home/
    select-log-type/
    add-log/
    maintenance-history/
    update-mileage/
    share-link/

  components/
    buttons/
    inputs/
    cards/
    list-items/
    layout/
    icons/

  features/
    vehicles/
    maintenance/
    sharing/
    notifications/

  services/
    api/
    storage/
    notifications/
    sharing/

  store/
    app-store.ts
    vehicle-store.ts

  utils/
    calculations/
    formatting/
    validation/

  types/
    vehicle.ts
    log-type.ts
    log.ts
    category.ts

  constants/
    routes.ts
    config.ts
    thresholds.ts
9. Recommended Architectural Pattern

The app does not need heavy enterprise architecture, but it should follow a clean separation.

Recommended Layers
UI Layer

Screens and reusable components.

Responsibilities:

render UI

collect user input

call hooks or actions

display loading/error/success states

Must not contain:

raw business calculations

direct query logic scattered everywhere

backend-specific implementation details

Feature / Use Case Layer

Coordinates app behavior.

Examples:

create vehicle

add maintenance log

update mileage

generate share link

fetch home maintenance summary

Data Layer

Handles backend communication.

Examples:

fetch vehicles

insert user logs

update vehicle

create share slug

Domain Logic Layer

Pure logic and calculations.

Examples:

get effective due interval

calculate due status

determine warning state

sort items by priority

10. Source of Truth Rules

To avoid inconsistent behavior, the rebuild should follow clear source-of-truth rules.

Backend as source of truth

Primary persistent entities should live in backend storage:

vehicles

user logs

categories

log types

share slug

Local persistence

Only lightweight app/session state should be stored locally:

onboarding completed flag

device UUID

maybe selected/current vehicle id

maybe cached unit preference

Derived state

Calculated maintenance statuses should be derived from:

vehicle current odometer

latest user logs

log type definitions

business logic rules

Do not duplicate derived status as permanent stored backend fields unless explicitly needed later.

11. Important Product Behaviors That Must Be Preserved

These behaviors are essential and must survive the rebuild.

Launch routing

if onboarding incomplete → onboarding

if onboarding complete but no vehicle → add vehicle

if vehicle exists → home

Dynamic maintenance structure

categories contain log types

home screen displays items by category

user can create logs from category flow

Due calculations

due state must depend on log type, fuel type, last log, and current odometer/date

warning states must be shown correctly

due-soon items must be prioritized visually

Dynamic spec input

add log screen must use spec_name and spec_placeholder from the maintenance item definition

Share feature

vehicle can generate share slug

share page uses public URL

stop sharing disables the public page

12. Key Screens to Implement First

To reduce complexity, the rebuild should be done in implementation phases.

Phase 1 - App Shell

project setup

navigation

theming foundation

reusable buttons/inputs/cards

local storage helpers

device identity setup

Phase 2 - Entry Flow

splash screen

onboarding

add vehicle screen

launch routing logic

Phase 3 - Vehicle Dashboard

home screen

category rendering

maintenance item rendering

update mileage entry point

share entry point

Phase 4 - Maintenance Logging

select log type screen

add log screen

save log mutation

refresh home state

Phase 5 - Detail / History

maintenance history screen

due status on detail screen

log list rendering

Phase 6 - Sharing

create slug flow

share link screen

copy/share actions

QR code

Phase 7 - Notifications / Polish

mileage reminder

service reminder

edge cases

validation polishing

loading/error/empty states

13. Recommended Reusable Components

The rebuild should prioritize reusable UI blocks.

Examples:

PrimaryButton

SecondaryButton

TextInputField

NumberInputField

SelectField

DateField

VehicleHeroCard

VehicleMetaRow

CategoryCard

MaintenanceItemRow

WarningBadge

SectionHeader

HistoryLogCard

ShareLinkCard

EmptyState

LoadingState

These should be designed for reuse, not screen-specific duplication.

14. Recommended Domain / Utility Functions

Business logic should be centralized into pure functions.

Examples:

getEffectiveDueInterval(logType, fuelType)
getLatestLogForType(logs, vehicleId, logTypeId)
getMileageDueStatus(currentOdometer, latestLogMileage, effectiveDue, warningThreshold)
getTimeDueStatus(lastChangeDate, effectiveDueDays, currentDate, warningThresholdDays)
sortMaintenanceItemsByPriority(items)
formatDistance(value, unitPreference)
formatDueLabel(status)
buildShareUrl(slug, baseUrl)

These functions should be covered by tests where practical.

15. Data Fetching Recommendations

The rebuild should avoid deeply nested ad hoc fetch logic inside screens.

Recommended pattern:

fetch categories and log types once and cache them

fetch current vehicle data separately

fetch logs per vehicle

derive home maintenance summary from those datasets

invalidate/refetch relevant queries after mutations

Examples:

after adding log → refresh vehicle logs and home summary

after updating mileage → refresh vehicle and derived maintenance statuses

after creating share link → refresh vehicle share state

16. Validation Requirements

The rebuild should include basic strong validation.

Add Vehicle

name required

year required and numeric

fuel type required

transmission required

odometer required and numeric

unit required

Add Log

mileage required for mileage-based items

mileage numeric and non-negative

date required

specification optional unless later changed

notes optional

Update Mileage

numeric

non-negative

should not be lower than current stored odometer in MVP

17. Empty, Loading, and Error State Requirements

Cursor/Codex should not generate only happy-path screens.

Every major screen should support:

Loading State

Examples:

splash initializing

home data loading

log history loading

share link loading

Empty State

Examples:

no logs yet for maintenance item

no share link created yet

category has no logs yet

Error State

Examples:

failed to save vehicle

failed to save log

failed to load home data

failed to create share link

These states should be deliberately implemented.

18. Public Share Page Consideration

The public share page is part of the product, but not necessarily part of the React Native mobile app.

Recommended approach:

keep mobile app responsible for creating and managing the share state

implement the public page separately as a lightweight web page or web route

The important requirement for the rebuild is that the mobile app supports:

create link

display link

copy/share link

disable sharing

The web rendering of the public page can be implemented later if needed.

19. Performance Guidance

This is a small app, so performance should be handled practically.

Recommendations:

avoid premature optimization

keep item rendering efficient

memoize only where there is clear benefit

centralize calculations rather than recalculating inside many nested components

avoid repeated unnecessary fetches

The app should feel fast and simple, not overbuilt.

20. Testing Guidance

Full heavy test coverage is not required for initial MVP, but key logic should be testable.

Priority areas for tests:

due interval calculation

fuel multiplier handling

warning threshold logic

sorting of due items

share URL generation

validation logic

UI snapshot tests are lower priority than logic correctness.

21. Migration Mindset

This rebuild is a product migration, not a direct visual export from FlutterFlow.

Important rule:

preserve product behavior

improve implementation quality

Do not attempt to mimic FlutterFlow-generated internal structure.

Do not copy technical shortcuts that make future iteration difficult.

The goal is a professional, maintainable React Native codebase.

22. AI Implementation Expectations

When using Cursor/Codex, the AI should:

read all documentation first

preserve the documented flows and logic

create maintainable TypeScript code

use reusable components

keep business logic outside screens

avoid hardcoding maintenance rules that already exist in data definitions

avoid inventing undocumented features

implement one phase at a time

23. Suggested First Build Milestone

The first practical milestone for the rebuild should be:

Milestone 1

A working app with:

splash screen

onboarding flow

add vehicle screen

local routing logic

basic home screen shell

static category rendering from backend/data source

This milestone proves the app structure is correct before more advanced logic is added.

After that:

Milestone 2

log creation flow

maintenance calculations

mileage updates

history screen

Milestone 3

share flow

notifications

polish

24. Final Instruction for Rebuild

Treat the current FlutterFlow app as a behavioral reference only.

Treat these documentation files as the source of truth for rebuilding the app.

The React Native implementation should be:

clean

modular

typed

easy to extend

faithful to the documented MVP behavior

Do not overcomplicate the first version, but do not build it in a way that prevents future scaling.