Screen Specifications

This document defines every screen in the CarCare Diary MVP.

Each screen description includes:

purpose

UI structure

user actions

backend interactions

navigation behavior

1. Splash Screen
Purpose

The splash screen is displayed when the application launches.

It initializes the app and determines where the user should be redirected.

UI Elements

application logo centered on screen

dark background

no user interaction

Logic

During splash, the app checks:

whether onboarding has been completed

whether a vehicle already exists for the user

Possible outcomes:

If onboarding not completed
→ go to Onboarding

If onboarding completed but no vehicle
→ go to Add Vehicle

If vehicle exists
→ go to Home
2. Onboarding Screen
Purpose

Introduce the user to the app and explain its value.

Structure

The onboarding may contain 1–3 slides.

Each slide contains:

illustration or screenshot

short title

short description text

UI Elements

Per slide:

image

title

description

button

Buttons:

Continue (first slides)

Get Started (final slide)

User Actions

User presses:

Continue
→ next slide

Final slide:

Get Started
→ onboarding completed
State Change

Set local flag:

onboarding_completed = true
Navigation

After onboarding:

→ Add Vehicle Screen
3. Add Vehicle Screen
Purpose

Create a vehicle profile for the user.

A vehicle must exist before the user can use the application.

UI Elements

Form fields:

Vehicle Photo

image upload button

Vehicle Name

text input

example: "Toyota Supra"

Year

number input

Fuel Type

dropdown selector

Options:

Petrol
Diesel
Hybrid
Electric

Transmission

dropdown selector

Options:

Automatic
Manual

Current Odometer

numeric input

Unit Selector

toggle

Kilometers
Miles

Primary button:

Add
User Actions

User fills form fields.

User presses:

Add
Backend Interaction

Create new record in vehicles table.

Fields:

name

image_url

year

fuel_type

transmission

current_odometer

user_id

unit preference

Navigation

After successful creation:

→ Home Screen
4. Home Screen
Purpose

Main dashboard displaying vehicle information and maintenance status.

UI Structure
Vehicle Section

Large image header (top half of screen)

Vehicle information:

vehicle name

year

fuel type

transmission

Buttons:

Share
Update Mileage
Mileage Section

Displays:

Mileage icon
Current mileage value
Update button
Maintenance Categories

List of maintenance categories.

Example:

Engine
Transmission
Fluids
Brakes
Wheels
Electrical
HVAC
Other

Each category card contains:

category icon

category name

New Log button

Maintenance Items

Inside each category:

Maintenance items display:

item name

service status

Example:

Engine oil
Change in 1,400 km
Warning State

If service interval is approaching:

Display warning icon.

Example:

⚠ Change in 800 km

Items with warnings should appear higher in the list.

User Actions

User can:

Tap New Log
Tap Maintenance Item
Tap Share
Tap Update Mileage
Navigation
New Log → Select Log Type Screen
Maintenance Item → Log History Screen
Share → Share Link Screen
Update Mileage → Update Mileage Screen
5. Select Log Type Screen
Purpose

Allow user to choose a maintenance item to log.

This screen appears when the user taps New Log in a category.

UI Elements

List of maintenance items belonging to selected category.

Example (Engine category):

Engine oil
Oil filter
Spark plugs
Air filter
Timing belt
User Actions

User selects maintenance item.

Navigation
Selected Item
→ Add Log Screen
6. Add Log Screen
Purpose

Record a maintenance event.

UI Elements

Fields:

Changed At (km)

numeric input

Date

date picker

Specification Field

Dynamic label based on log type.

Example:

Engine oil
Spark plug type
Filter size

Notes

multiline text input

Primary button:

Add
User Actions

User fills fields and presses:

Add
Backend Interaction

Insert record into user_logs.

Fields:

car_id

log_type_id

auto_log

specs

notes

change_date

Navigation

After successful creation:

→ Home Screen

Service calculations update.

7. Maintenance History Screen
Purpose

Display the history of maintenance logs for a specific item.

UI Elements

Top section:

item icon

item name

Service status:

Change in X km

Warning icon if needed.

History List

List of past logs.

Each log card contains:

specification value

mileage

date

notes

Example:

Oil Type: 5W-30
141,200 km
18 Dec 2024
Notes: Changed at dealership

Logs appear in descending chronological order.

8. Update Mileage Screen
Purpose

Update the current mileage of the vehicle.

UI Elements

Field:

New Mileage Value

Primary button:

Update
User Actions

User enters new mileage.

User presses:

Update
Backend Interaction

Update vehicles.current_odometer.

Navigation

After update:

→ Home Screen

Maintenance calculations update.

9. Share Link Screen
Purpose

Allow the user to generate a public link showing vehicle maintenance history.

UI Elements

QR code display

Public link field

Example:

https://carcarediary.com/{slug}

Buttons:

Copy Link
Share Link
Stop Sharing
User Actions

User presses:

Create Link

System generates slug.

Example:

abc123xyz

Full link:

carcarediary.com/abc123xyz
Backend Interaction

Update vehicles.shared_link_slug.

Stop Sharing

User presses:

Stop Sharing

Slug removed or invalidated.

Public page becomes inaccessible.

Summary of Screens
Splash
Onboarding
Add Vehicle
Home
Select Log Type
Add Log
Maintenance History
Update Mileage
Share Link