Implementation Roadmap

This document defines the recommended step-by-step implementation plan for rebuilding the CarCare Diary mobile application using React Native.

It is designed for both:

AI coding tools (Cursor, Codex)

human developers

The goal is to build the application in small working milestones, ensuring that each stage produces a stable application before moving forward.

The roadmap assumes the following documentation is already available:

product-overview.md

app-flows.md

screen-specifications.md

business-logic.md

database-schema.md

react-native-rebuild-brief.md

ai-coding-rules.md

project-structure.md

Development Philosophy

The rebuild should follow these principles:

build incrementally

keep each phase testable

implement real functionality early

avoid overengineering

preserve the documented MVP behavior

Each milestone should produce a running application.

Phase 1 — Project Setup
Goal

Create the base React Native project with the correct structure.

Tasks

Initialize project.

Configure TypeScript.

Create project folders according to project-structure.md.

src/
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

Create base theme (colors, spacing).

Add navigation library.

Configure root navigator.

Create placeholder screens.

Expected Result

The app launches successfully with a blank screen and navigation working.

Phase 2 — Core Infrastructure
Goal

Implement core utilities and base infrastructure used throughout the app.

Tasks

Create TypeScript models.

Example:

Vehicle
LogCategory
LogType
UserLog
Device

Create constants.

Examples:

WARNING_DISTANCE_THRESHOLD
WARNING_DAYS_THRESHOLD

Create utility functions:

distance formatting

date formatting

validation helpers

Create calculation utilities:

getEffectiveDueInterval()
calculateDueMileage()
calculateDueDate()
sortMaintenanceItems()

These must follow business-logic.md.

Expected Result

Core logic functions exist and are testable.

Phase 3 — Device Identity & Local State
Goal

Implement the device identity system used instead of authentication.

Tasks

Generate device UUID on first launch.

Store device ID locally.

Create devices record in backend.

Store onboarding completion flag locally.

Create global app store.

Example values:

deviceId
onboardingCompleted
Expected Result

App can identify the device consistently across sessions.

Phase 4 — Splash & App Routing
Goal

Implement app launch logic.

Tasks

Create Splash Screen.

During splash:

Check:

onboardingCompleted
vehicleExists

Routing logic:

If onboarding incomplete → Onboarding
If onboarding complete but no vehicle → AddVehicle
If vehicle exists → Home
Expected Result

App correctly routes users at launch.

Phase 5 — Onboarding Flow
Goal

Implement onboarding screens.

Tasks

Create onboarding screen.

Add support for multiple slides.

Each slide includes:

illustration

title

description

Buttons:

Continue
Get Started

On final slide:

set onboardingCompleted = true

Navigate to Add Vehicle screen.

Expected Result

New users can complete onboarding.

Phase 6 — Vehicle Creation
Goal

Allow user to add their first vehicle.

Tasks

Implement Add Vehicle screen.

Fields:

vehicle photo upload

vehicle name

year

fuel type

transmission

odometer

unit selector

Add form validation.

Create createVehicle() service.

Save vehicle in backend.

Store vehicle locally in app state.

Expected Result

User can create a vehicle and enter the main app.

Phase 7 — Home Screen Layout
Goal

Create the main dashboard UI.

Tasks

Implement Home Screen layout.

Sections:

Vehicle hero card:

image

name

year

fuel type

transmission

Mileage section.

Buttons:

Update Mileage
Share

Maintenance category cards.

Load:

log_categories

log_types

Group items by category.

Render categories with placeholder items.

Expected Result

Home screen renders vehicle and categories.

Phase 8 — Maintenance Calculations
Goal

Display correct service due statuses.

Tasks

Fetch user logs.

For each maintenance item:

Determine latest log.

Calculate:

effective interval
next due mileage
remaining distance
warning state

Use functions defined in utils/calculations.

Sort items according to priority:

1 overdue
2 due soon
3 normal
4 no logs

Expected Result

Home screen correctly shows:

Change in 5000 km
⚠ Change in 800 km
Phase 9 — Maintenance Logging
Goal

Allow users to create maintenance records.

Tasks

Implement:

Select Log Type screen.

Add Log screen.

Fields:

Mileage
Date
Specification
Notes

Dynamic spec field using:

log_types.spec_name
log_types.spec_placeholder

Create createUserLog() service.

After saving:

Refresh home calculations.

Expected Result

Users can log maintenance events.

Phase 10 — Maintenance History
Goal

Display history for each maintenance item.

Tasks

Create Maintenance History screen.

Display:

item icon

item name

due status

Fetch logs for:

vehicle_id
log_type_id

Sort logs newest first.

Display:

specification
mileage
date
notes
Expected Result

Users can view full maintenance history.

Phase 11 — Update Mileage
Goal

Allow user to update vehicle mileage.

Tasks

Create Update Mileage screen.

Validate input.

Update:

vehicles.current_odometer

Refresh maintenance calculations.

Expected Result

Home screen updates due statuses when mileage changes.

Phase 12 — Share Link Feature
Goal

Allow users to generate a public maintenance history link.

Tasks

Create Share Link screen.

Implement:

createShareSlug()

Save slug to vehicle.

Generate URL:

https://carcarediary.com/{slug}

Display:

link

QR code

Buttons:

Copy
Share
Stop Sharing

Stopping sharing clears slug.

Expected Result

Users can generate and manage share links.

Phase 13 — Notifications
Goal

Implement reminder system.

Tasks

Mileage reminder.

Trigger if mileage hasn't been updated for configured period.

Service reminder.

Trigger when item enters warning state.

Notifications should include:

Time to change engine oil
Don't forget to log your mileage
Expected Result

Users receive maintenance reminders.

Phase 14 — UI Polish
Goal

Improve user experience and app stability.

Tasks

Add loading states.

Add empty states.

Add error handling.

Improve animations and transitions.

Ensure accessibility.

Improve layout responsiveness.

Expected Result

App feels stable and production-ready.

Phase 15 — Testing & Validation
Goal

Ensure logic correctness.

Tasks

Test core calculations:

mileage due logic

fuel multiplier

warning threshold

sorting logic

Test major flows:

onboarding

add vehicle

add log

update mileage

share link

Expected Result

Core logic is verified and stable.

Phase 16 — MVP Release Preparation
Goal

Prepare the application for initial release.

Tasks

Clean code.

Remove debug logs.

Verify navigation flows.

Ensure crash-free launch.

Prepare app icons and splash assets.

Prepare store metadata.

Expected Result

Application ready for MVP launch.

Final Outcome

After completing all phases, the application will support:

onboarding

vehicle creation

maintenance tracking

due calculations

maintenance history

mileage updates

reminder notifications

shareable vehicle history

The resulting codebase should be:

clean

modular

scalable

ready for future subscription features