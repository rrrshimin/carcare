Business Logic

This document defines the core calculation and decision logic for the CarCare Diary MVP.

Its purpose is to ensure that the React Native rebuild preserves the intended behavior of the current app and does not invent inconsistent maintenance logic.

This document covers:

service interval logic

fuel-based interval adjustments

mileage and time due logic

warning state logic

sorting behavior

mileage update behavior

reminder trigger logic

share link logic

1. Core Concepts

The app tracks vehicle maintenance by combining:

vehicle data

maintenance type definitions

user maintenance logs

current odometer value

Each maintenance item belongs to a category and is defined in the log_types table.

Each maintenance item has a due strategy:

mileage-based

time-based

Each user log records when that maintenance item was last performed for a vehicle.

The app compares the latest log against the vehicle’s current state to determine whether the item is:

not due

due soon

overdue

2. Core Entities Used in Logic
Vehicle

Used fields:

id

fuel_type

current_odometer

shared_link_slug

Log Category

Used for grouping only.

Used fields:

id

category_name

image_url

Log Type

Defines the maintenance rules.

Used fields:

id

category_id

log_type_name

due_type

base_due

diesel_increment

hybrid_increment

spec_name

spec_placeholder

User Log

Represents an actual maintenance event.

Used fields:

id

car_id

log_type_id

auto_log

specs

notes

change_date

3. Maintenance Interval Definition

Each maintenance item has a base interval stored in log_types.base_due.

The interpretation of base_due depends on due_type.

Mileage-based items

If due_type = mileage, then:

base_due represents distance

unit depends on the vehicle/user unit setting

example: 5000 means 5000 km or 5000 miles depending on the selected unit

Time-based items

If due_type = time, then:

base_due represents a number of days

example: 365 means item is due every 365 days

4. Fuel-Type Adjustment Logic

Some maintenance intervals change depending on vehicle fuel type.

The interval multiplier is determined from log_types.

Supported fuel types

Current supported types include:

petrol

diesel

hybrid

electric

Multiplier rules
Petrol

Use base interval with no multiplier.

effective_due = base_due
Diesel

Use diesel increment.

effective_due = base_due * diesel_increment
Hybrid

Use hybrid increment.

effective_due = base_due * hybrid_increment
Electric

For now, use base interval unless a future rule is explicitly added.

effective_due = base_due
Notes

If a multiplier is missing, invalid, or empty, default to 1

Final effective interval should be rounded consistently

Recommended rule: round to nearest whole number for display and internal comparison

5. Determining the Latest Relevant Log

For each vehicle and each maintenance item, the app must identify the most recent log.

A log is considered relevant if:

user_logs.car_id matches the current vehicle

user_logs.log_type_id matches the maintenance item

Latest log selection rule

The latest log should be determined primarily by the highest change_date.

If two logs have the same date, use the most recently created record as tie-breaker.

Recommended fallback if date is unavailable:

use highest created_at

6. Mileage-Based Due Calculation

This logic applies when:

log_types.due_type = "mileage"
Inputs

vehicle.current_odometer

latest matching user_log.auto_log

effective due interval

Formula
next_due_odometer = latest_log.auto_log + effective_due
remaining_distance = next_due_odometer - vehicle.current_odometer
Output states
Not due

If remaining_distance > warning_threshold

Display:

Change in X km

or

Change in X mi
Due soon

If remaining_distance <= warning_threshold and remaining_distance >= 0

Display warning state.

Example:

⚠ Change in 800 km
Overdue

If remaining_distance < 0

Display overdue state.

Recommended display:

Overdue by X km

If you want to preserve the current MVP feel, this can also remain a warning-style state.

7. Time-Based Due Calculation

This logic applies when:

log_types.due_type = "time"
Inputs

latest matching user_log.change_date

effective due interval in days

current date

Formula
next_due_date = latest_log.change_date + effective_due_days
remaining_days = next_due_date - today
Output states
Not due

If remaining_days > warning_threshold_days

Display:

Change in X days
Due soon

If remaining_days <= warning_threshold_days and remaining_days >= 0

Display warning state.

Overdue

If remaining_days < 0

Display overdue state.

8. Items With No Logs Yet

If a maintenance item has no logs for the current vehicle, it should still appear in the category list.

Initial state behavior

Recommended MVP behavior:

show item name

show neutral or empty status

do not calculate due value

encourage user to create first log

Recommended display options:

No logs yet

Add first log

For consistency with the current UI, the item can simply appear without due text until the first log exists.

9. Home Screen Item Display Logic

Each category shows its related maintenance items.

Each item row may show:

item name

calculated due status

warning icon if relevant

chevron for navigation

Display priority

Items that are due soon or overdue should appear higher than items that are not due.

Recommended sort order inside a category:

overdue items

due soon items

normal items

items with no logs

Within the same state, recommended sorting is:

smallest remaining distance or days first

then alphabetical by item name

10. Warning Threshold Logic

The warning state appears before the service is actually due.

The threshold should be configurable.

Mileage-based warning threshold

Recommended MVP rule:

warning_threshold_distance = 1000

Meaning:

if remaining distance is 1000 or less, show warning state

This matches the direction you described in the UI.

Time-based warning threshold

Recommended MVP rule:

warning_threshold_days = 30

Meaning:

if remaining time is 30 days or less, show warning state

Important note

These thresholds should ideally be stored as app constants so they can be changed easily later.

11. Unit Logic

Vehicles have a selected unit:

kilometers

miles

Rules

The vehicle’s unit setting determines how odometer values are entered and displayed

base_due for mileage-based items is interpreted in that same unit

the app should not auto-convert values between km and miles in MVP

all entered values remain in the user’s selected unit system

This means:

if a vehicle is set to miles, all mileage logs and due calculations are in miles

if a vehicle is set to kilometers, all mileage logs and due calculations are in kilometers

12. Add Log Behavior

When the user creates a new maintenance log:

insert new record into user_logs

associate it with:

current vehicle

selected log type

save entered:

odometer value

date

specification text

notes

recalculate the maintenance status for that item

refresh the home screen and item history screen

Validation rules
Changed at mileage

required for mileage-based items

must be numeric

should not be negative

Recommended validation:

should not exceed current vehicle mileage unless explicitly allowed

Date

required

must be a valid date

Specification field

optional unless future business rules make it required

Notes

optional

13. Update Mileage Behavior

When the user updates mileage:

update vehicles.current_odometer

recalculate all mileage-based maintenance items for that vehicle

refresh home screen statuses

re-evaluate warning and overdue states

Validation rules

new mileage must be numeric

new mileage should not be lower than current stored mileage unless explicitly allowed by a future admin override

recommended MVP behavior: reject lower value and show validation error

14. Maintenance History Screen Logic

When opening a maintenance item detail screen, the app must:

load the selected log type

load all matching user_logs for:

current vehicle

selected log type

sort logs newest first

calculate current status using the latest log

display:

icon

item name

due status

warning indicator if applicable

list of previous logs

Each history card should show:

specification text

mileage

date

notes

15. Category to Log Type Relationship Logic

log_categories defines top-level maintenance groups.

log_types links to categories via category_id.

Rule

When a user taps New Log inside a category:

load only log_types belonging to that category

When displaying a category on home:

show only log types linked to that category

16. Dynamic Specification Field Logic

Each log type can define a custom spec label and placeholder.

From log_types:

spec_name

spec_placeholder

Rule

When opening Add Log:

the specification input label should use spec_name

the input placeholder should use spec_placeholder

Examples:

Engine oil -> label: Engine oil, placeholder: 5W-30

Spark plugs -> label: Plug type

Air filter -> label: Filter type

If either value is missing:

fallback label: Specification

fallback placeholder: empty

17. Notification Logic

The MVP includes two notification types.

A. Mileage Reminder

Purpose:
Remind the user to update mileage if they have not done so for a long time.

Required logic

The system should track the last time mileage was updated.

Recommended MVP trigger:

if no mileage update has occurred for a configurable period, send reminder

Recommended default:

mileage_reminder_after_days = 30

Notification example:

Don't forget to log your mileage.
B. Service Reminder

Purpose:
Notify the user when a service item is due soon or due now.

Trigger conditions

For mileage-based items:

remaining distance <= warning threshold

For time-based items:

remaining days <= warning threshold_days

Notification example:

Time to change engine oil.
Notification frequency

Recommended MVP behavior:

do not send repeated reminders too frequently

send once when entering warning state, then optionally again when overdue

This can be refined later.

18. Share Link Logic

Each vehicle may have a public share slug stored in:

vehicles.shared_link_slug
Create Share Link

When user taps create/share:

check whether vehicle already has a slug

if not, generate unique slug

store slug on vehicle

build public URL

Example:

https://carcarediary.com/{slug}
Existing Share Link

If slug already exists:

reuse current slug

show QR code and full link

Stop Sharing

When user taps Stop Sharing:

Recommended behavior:

clear slug from vehicle record
or

invalidate slug in backend

Result:

public page becomes inaccessible

19. Public Vehicle Page Logic

The public page is read-only.

It should display:

vehicle name

year

fuel type

transmission

image

maintenance categories

logs grouped by category or item

No edit actions are available.

Only vehicles with valid active slugs can be viewed publicly.

20. Device Identity Logic

The current MVP does not depend on full user accounts.

Instead, the app uses a device-based identity model.

user_devices stores:

generated device UUID

unit preference

subscription status

Rule

On first launch:

create device identity if it does not exist

persist device UUID locally

use this identity to associate vehicle data

This can later evolve into full authentication without changing the maintenance model.

21. Subscription Logic - Current and Future
Current MVP

Subscription is not the main focus yet.
All core maintenance functionality should work for MVP.

Planned future logic
Free tier

1 vehicle maximum

Personal paid tier

multiple vehicles

share link feature may become paid-only

Reseller / professional tier

large number of vehicles

professional workflows

For the rebuild, subscription checks should be implemented in a way that is easy to expand later, but not block MVP delivery.

22. Error and Edge Case Rules
No vehicle exists

route to Add Vehicle

No logs for item

show neutral state such as No logs yet

Invalid mileage input

block save

show validation error

Invalid date

block save

show validation error

Missing slug on share screen

show create state instead of public link state

Deleted or invalid public slug

public page should return not found or unavailable state

23. Recommended Centralized Calculation Functions

For the React Native rebuild, the calculation logic should be centralized in utility or domain service functions.

Recommended functions:

getEffectiveDueInterval(logType, fuelType)
getLatestLog(logs, logTypeId, carId)
getMileageDueStatus(currentOdometer, latestLog, effectiveDue, warningThreshold)
getTimeDueStatus(latestLogDate, effectiveDueDays, warningThresholdDays)
sortMaintenanceItemsByPriority(items)
buildPublicShareUrl(slug)

These functions should not live inside UI components.

24. Open Decisions to Confirm Later

These points should be finalized during implementation or a later doc version:

exact overdue text format

exact warning thresholds

whether changed-at mileage may exceed current odometer

whether share feature is free or paid in MVP

whether notifications are local, backend-driven, or both

whether time-based items are already fully used in current dataset

whether logs should be sorted by change date only or date plus created time