App Flow Overview

This document describes how users navigate through the CarCare Diary application and how the system determines which screens should appear.

The flows described here reflect the current MVP design.

1. Application Launch Flow

When the user opens the application, the system must determine whether this is a first-time user or a returning user.

Step 1 — Splash Screen

The splash screen appears immediately when the application starts.

Purpose:

display app logo

initialize the application

load required configuration

check local device state

Checks performed during splash:

does the device already exist in the system

has onboarding already been completed

does the user already have a vehicle

After these checks, the app routes the user accordingly.

2. First Time User Flow

If the user opens the app for the first time, they are guided through onboarding and vehicle setup.

Flow:

Splash
→ Onboarding
→ Vehicle Setup
→ Home
Onboarding Screens

The onboarding sequence introduces the app.

Structure:

up to three slides

each slide contains:

illustration or screenshot

short title

short description

Example structure:

Slide 1
Title: Service Made Simple

Slide 2
Title: Track Maintenance

Slide 3
Title: Protect Your Resale Value

Navigation:

Continue button moves to next slide

Final screen button says Get Started

When onboarding completes:

localStorage.onboarding_completed = true
3. Vehicle Setup Flow

After onboarding, the user must add their first vehicle.

Screen:

Add Vehicle

Fields:

vehicle photo

make and model

year

fuel type

transmission

current odometer

unit selector (km or miles)

Action:

User presses Add

Result:

vehicle record created

device linked to vehicle

user is redirected to home screen

Flow:

Onboarding Complete
→ Add Vehicle Screen
→ Save Vehicle
→ Home Screen
4. Returning User Flow

When the app opens and the user already has a vehicle, onboarding and setup are skipped.

Flow:

Splash
→ Home Screen
5. Home Screen Flow

The home screen is the central dashboard of the application.

It displays:

Vehicle information:

vehicle image

vehicle name

year

fuel type

transmission

Controls:

share button

mileage update button

Maintenance overview:

maintenance categories

items inside each category

service status for each item

Example category:

Engine

Items:

engine oil

oil filter

spark plugs

Each item shows:

Change in X km

If service is approaching, a warning icon appears.

Items nearing service are displayed higher in the list.

6. Add Maintenance Log Flow

Users can log maintenance work from the home screen.

Flow:

Home Screen
→ Tap "New Log" in category
→ Select Maintenance Item
→ Add Log Screen
→ Save Log
→ Return to Home
Step 1 — Select Maintenance Item

Screen:

New Log

This screen lists maintenance items related to the chosen category.

Example:

Engine category shows:

engine oil

oil filter

spark plugs

User selects one.

Step 2 — Add Log

Screen:

Add Log

Fields:

changed at mileage

date

specification field (example: oil type)

notes

User presses Add

Result:

log saved to database

service interval recalculated

home screen updated

7. View Maintenance History Flow

Users can open detailed history for any maintenance item.

Flow:

Home Screen
→ Tap Maintenance Item
→ Maintenance Detail Screen

The detail screen shows:

maintenance item icon

current service status

warning icon if due soon

full history of logs

Each log shows:

specification value

mileage

date

notes

Logs are displayed newest first.

8. Update Mileage Flow

Users can update vehicle mileage manually.

Flow:

Home Screen
→ Tap "Update Mileage"
→ Enter New Value
→ Save
→ Home Screen Updates

Result:

vehicle current mileage updated

service calculations updated

9. Vehicle Sharing Flow

Users can share their vehicle maintenance history publicly.

Flow:

Home Screen
→ Tap Share
→ Share Screen
→ Create Link
→ Public Link Generated

The system creates a unique slug.

Example:

carcarediary.com/{slug}

The user can:

copy link

share link

generate QR code

Stop Sharing

User can disable sharing.

Flow:

Share Screen
→ Stop Sharing
→ Link Disabled

The public page becomes inaccessible.

10. Public Vehicle Page Flow

Anyone opening the share link sees a read-only vehicle page.

The page shows:

Vehicle information

Maintenance categories

Maintenance logs grouped by category

Users cannot edit any data.

This page exists outside the mobile app.

11. Notification Flow

The app generates notifications in two situations.

Mileage Reminder

Triggered when the user has not updated mileage for a long time.

Notification example:

Don't forget to log your mileage.
Service Reminder

Triggered when a maintenance item becomes due.

Example:

Time to change engine oil.
Navigation Summary

Complete navigation structure:

Splash
→ Onboarding
→ Add Vehicle
→ Home

Home
→ Update Mileage
→ Share Vehicle
→ Category New Log
→ Item History

New Log
→ Add Log

Share
→ Create Link
→ Stop Sharing