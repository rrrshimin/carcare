AI Coding Rules

This document defines the coding rules that AI coding tools (Cursor, Codex, etc.) must follow when implementing the CarCare Diary React Native application.

The goal is to ensure that AI-generated code remains:

consistent

maintainable

predictable

aligned with the product documentation

These rules should be treated as mandatory guidelines when generating or modifying code.

1. General Principles
Read Documentation First

Before implementing any feature, the AI must read and follow these documents:

product-overview.md

app-flows.md

screen-specifications.md

business-logic.md

database-schema.md

react-native-rebuild-brief.md

These documents are the source of truth for product behavior.

If documentation and existing code conflict, documentation should take priority unless explicitly instructed otherwise.

Do Not Invent Features

AI must not add product features that are not described in the documentation.

Examples of prohibited behavior:

adding new settings

creating additional user flows

modifying maintenance logic

inventing additional vehicle attributes

Only implement what is described.

Prefer Simplicity

Code should be simple and readable.

Avoid:

unnecessary abstractions

deep inheritance trees

complicated patterns

overuse of generics

The app should remain easy to understand for a human developer.

2. Language and Framework Rules
Use TypeScript

All code must use TypeScript.

Rules:

no .js files

prefer explicit types

avoid any unless unavoidable

use interfaces or types for domain models

Example:

type Vehicle = {
  id: string
  name: string
  year: number
  fuelType: FuelType
  transmission: Transmission
  currentOdometer: number
}
Use Functional Components

React Native components must use functional components.

Do not use class components.

Example:

export function HomeScreen() {
  return <View />
}
Use Hooks

State and side effects must be implemented using React hooks.

Examples:

useState

useEffect

useQuery

custom hooks

3. Architecture Rules

The codebase must follow a clear layered architecture.

UI Layer

Location:

src/screens
src/components

Responsibilities:

rendering UI

handling user interaction

calling hooks or services

UI components must NOT:

perform complex calculations

directly implement business rules

contain backend-specific logic

Feature / Domain Layer

Location:

src/features
src/hooks

Responsibilities:

orchestrate feature logic

manage feature-specific operations

coordinate API calls and calculations

Examples:

create vehicle

add maintenance log

update mileage

generate share link

Data Layer

Location:

src/services

Responsibilities:

backend communication

database queries

API requests

storage interactions

Examples:

fetch vehicles

insert user logs

update vehicle data

Domain Logic Layer

Location:

src/utils
src/domain

Responsibilities:

pure business logic

maintenance calculations

sorting rules

formatting logic

These functions must not depend on React or UI libraries.

4. Folder Structure Rules

The repository should follow this structure.

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

AI must place new files in the correct folder.

5. Naming Conventions
Components

Use PascalCase.

Example:

VehicleHeroCard
MaintenanceItemRow
AddLogScreen
Hooks

Hooks must start with use.

Example:

useVehicle()
useMaintenanceLogs()
useShareLink()
Files

Use kebab-case for file names.

Example:

add-log-screen.tsx
vehicle-hero-card.tsx
maintenance-item-row.tsx
Types

Use PascalCase.

Example:

Vehicle
LogType
UserLog
LogCategory
6. Business Logic Rules

All maintenance calculations must follow business-logic.md.

AI must NOT:

change calculation formulas

hardcode service intervals

invent new thresholds

bypass fuel multiplier rules

All maintenance calculations should be implemented in utility functions.

Example:

getEffectiveDueInterval()
getMileageDueStatus()
getTimeDueStatus()

These functions should be reused throughout the app.

7. Data Fetching Rules

Backend data fetching must not be scattered randomly across screens.

Use a consistent data fetching strategy.

Recommended pattern:

services for API calls

hooks for fetching data

queries for caching

Example structure:

services/vehicle-service.ts
hooks/use-vehicles.ts

Screens should call hooks, not raw service methods.

8. Mutation Rules

When modifying backend data (create, update, delete):

mutations should live in feature hooks

UI components should not directly call backend services

Example:

Correct:

const { addLog } = useAddMaintenanceLog()

Incorrect:

await insertUserLog(...)

inside a screen component.

9. Derived Data Rules

Derived state should not be permanently stored in backend unless explicitly required.

Examples of derived data:

due status

warning status

remaining distance

remaining days

These values must be calculated dynamically using utility functions.

10. Constants and Configuration

Constants must be stored centrally.

Location:

src/constants

Examples:

warning-distance-threshold
warning-days-threshold
app-config
route-names

Do not hardcode values inside screens.

11. Validation Rules

Input validation must be implemented for user forms.

Important forms:

add vehicle

add log

update mileage

Validation rules should be defined in:

src/utils/validation

Example checks:

required fields

numeric inputs

valid date inputs

non-negative mileage

12. UI Component Rules

Reusable components must be created when UI patterns repeat.

Examples:

PrimaryButton
TextInputField
CategoryCard
MaintenanceItemRow
HistoryLogCard

Screens should not duplicate UI structures.

13. Error Handling Rules

All asynchronous operations must handle errors.

Required states:

loading

success

error

Screens must display meaningful fallback UI when errors occur.

14. Loading and Empty States

All screens must implement appropriate UI states.

Examples:

Loading:

loading spinner
skeleton list

Empty states:

No logs yet
Create your first maintenance log
15. Share Feature Rules

The share feature must follow the documented behavior.

Rules:

slug is generated once

slug is stored on the vehicle

share URL is built using base domain + slug

Example:

https://carcarediary.com/{slug}

Stopping sharing should invalidate the slug.

16. Performance Rules

Avoid unnecessary re-renders.

Guidelines:

use memoization when beneficial

avoid inline heavy calculations in render functions

derive data once per screen rather than inside many components

However, avoid premature optimization.

17. Dependency Rules

Do not introduce large new dependencies without clear justification.

Prefer lightweight libraries.

Avoid:

heavy state libraries unless necessary

complex UI frameworks

unnecessary utility libraries

18. Documentation Rules

When AI generates new modules or complex functions, include concise comments explaining the purpose.

Example:

// Calculates the remaining mileage before a maintenance item is due

Avoid excessive commenting of obvious code.

19. Code Modification Rules

When modifying existing code:

preserve existing behavior

avoid large refactors unless requested

do not rename entities unnecessarily

do not move files without reason

If a change affects architecture, explain it in comments.

20. Implementation Approach

AI should implement features incrementally.

Recommended workflow:

Create navigation structure

Implement splash and onboarding

Implement vehicle creation

Implement home screen

Implement maintenance logs

Implement history screen

Implement share feature

Implement notifications

Each step should produce a working build before moving forward.

21. When Uncertain

If a feature is unclear:

refer to the documentation files

prefer the simplest implementation

avoid inventing new behavior

When necessary, leave a TODO comment rather than guessing.

Example:

// TODO: confirm exact warning threshold logic
Final Rule

The goal of the AI-generated code is to create a clean, maintainable React Native codebase that faithfully implements the documented MVP.

The AI should prioritize:

correctness

clarity

consistency

over cleverness or unnecessary complexity.