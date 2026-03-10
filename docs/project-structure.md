Project Structure

This document defines the recommended folder structure for the CarCare Diary React Native application.

The goal of this structure is to:

keep the project easy to navigate

separate concerns clearly

support future expansion

prevent business logic from leaking into UI components

This structure is optimized for a React Native + TypeScript application.

1. Root Structure

The project should follow this high-level structure:

carcare-diary/

docs/
src/

app.tsx
package.json
tsconfig.json

Explanation:

docs/ → product and technical documentation

src/ → application source code

app.tsx → app entry point

2. Source Folder Structure

Inside src/ the project should follow this layout:

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

Each folder has a specific responsibility.

3. Navigation

Location:

src/navigation/

Purpose:

Define all navigation configuration and routing logic.

Example structure:

src/navigation/

root-navigator.tsx
app-navigator.tsx
auth-navigator.tsx
routes.ts
Responsibilities

Navigation layer controls:

splash routing

onboarding flow

main app flow

nested stacks

Example navigation structure:

RootNavigator
 ├ Splash
 ├ Onboarding
 ├ AddVehicle
 └ AppNavigator

AppNavigator
 ├ Home
 ├ SelectLogType
 ├ AddLog
 ├ MaintenanceHistory
 ├ UpdateMileage
 └ ShareLink
4. Screens

Location:

src/screens/

Purpose:

Each screen corresponds to a full page in the app.

Screens should contain:

layout

UI composition

event handlers

hooks usage

Screens must NOT contain:

complex business logic

direct API implementations

Screen Structure

Each screen should have its own folder.

Example:

src/screens/

splash/
onboarding/
add-vehicle/
home/
select-log-type/
add-log/
maintenance-history/
update-mileage/
share-link/

Example screen folder:

src/screens/add-log/

add-log-screen.tsx
add-log.styles.ts
5. Components

Location:

src/components/

Purpose:

Reusable UI building blocks.

Components should be:

reusable

presentation-focused

stateless where possible

Component Categories

Example structure:

src/components/

buttons/
inputs/
cards/
lists/
layout/
icons/
feedback/

Examples:

Buttons
components/buttons/

primary-button.tsx
secondary-button.tsx
icon-button.tsx
Inputs
components/inputs/

text-input-field.tsx
number-input-field.tsx
date-input-field.tsx
select-field.tsx
Cards
components/cards/

vehicle-hero-card.tsx
category-card.tsx
history-log-card.tsx
share-link-card.tsx
List Items
components/lists/

maintenance-item-row.tsx
log-type-item.tsx
6. Features

Location:

src/features/

Purpose:

Group feature-specific logic and operations.

Each feature represents a domain area of the app.

Example structure:

src/features/

vehicles/
maintenance/
sharing/
notifications/
Example: Vehicles Feature
src/features/vehicles/

create-vehicle.ts
update-mileage.ts
get-vehicle.ts
Example: Maintenance Feature
src/features/maintenance/

add-maintenance-log.ts
get-maintenance-summary.ts
get-maintenance-history.ts
7. Services

Location:

src/services/

Purpose:

Handle communication with backend or platform services.

Services should contain:

API calls

database operations

external integrations

Example Structure
src/services/

vehicle-service.ts
log-service.ts
category-service.ts
share-service.ts
storage-service.ts
notification-service.ts

Example responsibilities:

Vehicle service

createVehicle()
updateVehicleMileage()
getVehicles()

Log service

createUserLog()
getVehicleLogs()
8. Store (State Management)

Location:

src/store/

Purpose:

Global application state.

Examples:

src/store/

app-store.ts
vehicle-store.ts

Example state:

App Store
deviceId
onboardingCompleted
Vehicle Store
currentVehicle
vehicles
currentMileage
9. Hooks

Location:

src/hooks/

Purpose:

Reusable hooks that connect UI to data and features.

Examples:

src/hooks/

use-device.ts
use-vehicle.ts
use-maintenance-summary.ts
use-maintenance-history.ts
use-share-link.ts

Hooks may combine:

services

state management

business logic

Screens should use hooks rather than raw services.

10. Utilities

Location:

src/utils/

Purpose:

Pure helper functions and business logic.

These functions must not depend on React.

Example Structure
src/utils/

calculations/
formatting/
validation/
Calculations
utils/calculations/

calculate-due-mileage.ts
calculate-due-date.ts
get-effective-due-interval.ts
sort-maintenance-items.ts
Formatting
utils/formatting/

format-distance.ts
format-date.ts
format-due-status.ts
Validation
utils/validation/

validate-vehicle-form.ts
validate-log-form.ts
validate-mileage.ts
11. Types

Location:

src/types/

Purpose:

Central place for TypeScript models.

Example structure:

src/types/

vehicle.ts
log-category.ts
log-type.ts
user-log.ts
device.ts

Example type:

export type Vehicle = {
  id: string
  name: string
  year: number
  fuelType: FuelType
  transmission: Transmission
  currentOdometer: number
}
12. Constants

Location:

src/constants/

Purpose:

Centralized configuration values.

Example files:

src/constants/

routes.ts
config.ts
maintenance-thresholds.ts
subscription-plans.ts

Examples:

WARNING_DISTANCE_THRESHOLD = 1000
WARNING_DAYS_THRESHOLD = 30
13. Assets

Location:

src/assets/

Purpose:

Static project assets.

Example structure:

src/assets/

icons/
images/
illustrations/
fonts/

Example:

assets/icons/
engine-icon.png
brakes-icon.png
oil-icon.png
14. Documentation Folder

Location:

docs/

This folder contains all project documentation.

Example:

docs/

product-overview.md
app-flows.md
screen-specifications.md
business-logic.md
database-schema.md
react-native-rebuild-brief.md
ai-coding-rules.md
project-structure.md

This documentation should remain version-controlled and updated as the product evolves.

15. File Naming Rules

Use kebab-case for file names.

Examples:

add-log-screen.tsx
vehicle-hero-card.tsx
maintenance-item-row.tsx
calculate-due-mileage.ts
16. Component Naming Rules

Use PascalCase for component names.

Example:

VehicleHeroCard
MaintenanceItemRow
PrimaryButton
AddLogScreen
17. Hook Naming Rules

Hooks must start with use.

Examples:

useVehicle()
useMaintenanceSummary()
useShareLink()
18. Import Rules

Use clear import paths.

Example:

import { Vehicle } from "@/types/vehicle"
import { calculateDueMileage } from "@/utils/calculations"
import { useVehicle } from "@/hooks/use-vehicle"

Relative imports should be avoided for deeply nested paths.

19. Separation of Responsibilities
Screens

Handle:

layout

user interaction

hook usage

Components

Handle:

reusable UI

Features

Handle:

domain actions

Services

Handle:

backend communication

Utilities

Handle:

calculations and formatting

20. Expected Repository Outcome

After initial setup, the repository should roughly look like this:

carcare-diary/

docs/

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

app.tsx
package.json
tsconfig.json

This structure should support the full MVP and future expansion.