Testing & Acceptance Criteria
Purpose

This document defines the testing criteria and acceptance conditions for the CarCare Diary MVP.

It serves three purposes:

Manual testing by the product owner

Automated verification by AI tools such as Cursor or Codex

A regression checklist for future updates

The application should only be considered MVP-ready when all critical test cases pass.

This document should be used together with:

screen-specifications.md

business-logic.md

database-schema.md

Testing Scope

The following parts of the application must be tested:

application launch flow

onboarding

vehicle creation

home dashboard

maintenance calculation logic

maintenance logging

maintenance history

mileage updates

share link feature

notifications

input validation

loading, empty, and error states

Global Acceptance Criteria

These conditions must be true across the entire app.

ID	Criteria
GA-01	App launches without crash
GA-02	Navigation between screens works correctly
GA-03	Data persists after restarting the app
GA-04	Required form fields cannot be submitted empty
GA-05	Maintenance calculations match documented business logic
GA-06	No screen becomes permanently stuck in loading state
GA-07	Errors display meaningful messages
GA-08	No duplicate vehicles or logs appear unexpectedly
GA-09	Unit preference (km/mi) is respected throughout the app
GA-10	All core flows work without requiring login
Launch & Routing Tests
TC-001 — First Launch Routes to Onboarding

Precondition

Fresh install

No local storage data

Steps

Launch application

Expected Result

Splash screen appears

User is routed to onboarding screen

TC-002 — Completed Onboarding Routes to Add Vehicle

Precondition

onboardingCompleted = true

No vehicle exists

Steps

Launch app

Expected Result

Splash appears

App opens Add Vehicle screen

TC-003 — Existing Vehicle Routes to Home

Precondition

onboardingCompleted = true

At least one vehicle exists

Steps

Launch app

Expected Result

App routes directly to Home screen

Onboarding Tests
TC-010 — Onboarding Slide Navigation

Steps

Open onboarding

Tap Continue

Expected Result

Next onboarding slide appears

TC-011 — Final Slide Completes Onboarding

Steps

Reach last onboarding slide

Tap Get Started

Expected Result

onboardingCompleted flag stored locally

App navigates to Add Vehicle screen

Vehicle Creation Tests
TC-020 — Create Vehicle Successfully

Steps

Open Add Vehicle screen

Enter vehicle name

Enter year

Select fuel type

Select transmission

Enter odometer

Tap Add

Expected Result

Vehicle record created

User navigates to Home screen

Vehicle data appears on dashboard

TC-021 — Vehicle Photo Upload

Steps

Select vehicle image

Save vehicle

Expected Result

Image uploads successfully

Vehicle hero image displays on Home screen

TC-022 — Required Fields Validation

Steps

Leave vehicle name empty

Tap Add

Expected Result

Validation error appears

Vehicle is not created

Home Screen Tests
TC-030 — Home Displays Vehicle Info

Expected

Home screen displays:

vehicle image

vehicle name

year

fuel type

transmission

TC-031 — Maintenance Categories Appear

Expected

Categories appear:

Engine

Transmission

Fluids

Brakes

Wheels

Electrical

HVAC

Other

TC-032 — Category Items Load Correctly

Expected

Each category shows relevant maintenance items defined in log_types.

Maintenance Calculation Tests
TC-040 — Mileage-Based Calculation

Precondition

Vehicle mileage: 100000

Oil change logged at: 95000

Interval: 10000

Expected

Home shows:

Change in 5000 km
TC-041 — Diesel Multiplier Applied

Precondition

Fuel type: diesel

Base interval: 10000

Diesel multiplier: 1.5

Expected

Effective interval:

15000
TC-042 — Warning Threshold

Precondition

Remaining distance ≤ 1000 km

Expected

Item displays warning icon.

Example:

⚠ Change in 800 km
TC-043 — Overdue State

Precondition

Remaining distance < 0

Expected

Item shows overdue state.

Example:

Overdue by 500 km
TC-044 — Sorting Priority

Items should be ordered:

Overdue

Due soon

Normal

No logs

Maintenance Log Tests
TC-050 — Add Log Successfully

Steps

Open category

Tap New Log

Select log type

Enter mileage

Enter date

Tap Add

Expected Result

Log stored in database

Home screen recalculates maintenance status

TC-051 — Dynamic Spec Field

Expected

Add Log screen label matches log_types.spec_name.

Example:

Engine Oil

Placeholder:

5W-30
TC-052 — Add Log Validation

Steps

Leave mileage empty

Tap Add

Expected

Validation error shown.

Maintenance History Tests
TC-060 — Open Item History

Steps

Tap maintenance item

Expected

Maintenance history screen opens.

TC-061 — History Sorted Correctly

Logs should display newest first.

TC-062 — History Shows Correct Fields

Each log shows:

spec value

mileage

date

notes

Mileage Update Tests
TC-070 — Update Mileage

Steps

Tap Update Mileage

Enter new value

Tap Save

Expected

Vehicle mileage updated

Home calculations refresh

TC-071 — Reject Lower Mileage

Steps

Enter mileage lower than stored value

Expected

Validation error appears.

Share Link Tests
TC-080 — Generate Share Link

Steps

Tap Share

Tap Create Link

Expected

Slug generated and stored.

Link format:

https://carcarediary.com/{slug}
TC-081 — QR Code Display

Expected:

QR code appears for share link.

TC-082 — Copy Share Link

Steps

Tap Copy

Expected

Link copied to clipboard.

TC-083 — Stop Sharing

Steps

Tap Stop Sharing

Expected

slug removed

public page becomes inaccessible

Notification Tests
TC-090 — Mileage Reminder

Precondition

Mileage not updated for configured period.

Expected

Notification appears:

Don't forget to log your mileage
TC-091 — Service Reminder

Precondition

Maintenance item enters warning threshold.

Expected

Notification appears:

Time to change engine oil
Validation Tests
TC-100 — Negative Mileage

Expected

Rejected.

TC-101 — Invalid Date

Expected

Rejected.

TC-102 — Missing Required Fields

Expected

Form submission blocked.

Loading & Empty States
TC-110 — Loading State

During data fetch:

loading indicator visible

TC-111 — Empty State

If no logs exist:

Display message:

No logs yet
TC-112 — Error State

If API request fails:

error message shown

retry option available

Regression Checklist

Before release, confirm:

app launches correctly

onboarding works

vehicle creation works

maintenance logs save correctly

maintenance calculations correct

history displays correctly

mileage update recalculates items

share link works

notifications work

MVP Acceptance Criteria

The MVP is considered ready for release when:

All critical flows work end-to-end

No blocking crashes occur

Maintenance calculations match business logic

Vehicle data persists across app restarts

Share link functionality works

Core reminders function correctly

Critical Test Coverage Summary
Area	Status Required
Launch flow	Pass
Vehicle creation	Pass
Maintenance logging	Pass
Maintenance calculations	Pass
History display	Pass
Mileage updates	Pass
Share link	Pass
Notifications	Pass