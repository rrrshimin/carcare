Database Schema

This document defines the core data structure for CarCare Diary MVP.

It is based on the current FlutterFlow/Supabase implementation, but it is written in a backend-agnostic way so it can be implemented using:

Supabase

PostgreSQL

Firebase

custom backend

another database solution

The goal of this document is to define:

core entities

fields

relationships

purpose of each table

important implementation notes

1. Overview

The MVP data model is centered around five main entities:

devices

vehicles

log_categories

log_types

user_logs

These entities support the core application behavior:

identify the device/user

store vehicle profile data

define maintenance category structure

define maintenance item rules

store maintenance history per vehicle

2. Entity Relationship Summary

High-level relationship structure:

Device
  └─< Vehicle
        └─< UserLog >─ LogType ─> LogCategory

Meaning:

one device can own one or more vehicles

one vehicle can have many maintenance logs

each maintenance log belongs to one log type

each log type belongs to one category

3. Entity: Devices
Purpose

Represents the current MVP identity model.

The MVP does not currently rely on full user authentication.
Instead, the app identifies the user/device using a generated device UUID stored locally and matched in the backend.

This entity may later evolve into a full users table.

Table Name

devices

Fields
id

type: string or UUID

required: yes

unique: yes

purpose: primary identifier

created_at

type: datetime

required: yes

purpose: timestamp of record creation

device_id

type: string or UUID

required: yes

unique: yes

purpose: generated device identifier stored locally in app

unit_preference

type: enum or string

required: yes

values:

km

mi

purpose: determines whether vehicle mileage is tracked in kilometers or miles

subscription_status

type: string

required: yes

default: free

possible future values:

free

personal_paid

reseller

purpose: supports subscription logic

Notes

device_id should be persisted on the device after first launch

if full authentication is added later, this entity can be merged into or mapped to users

4. Entity: Vehicles
Purpose

Stores the user’s vehicle profile and current vehicle state.

Each vehicle belongs to a device/user and acts as the main object around which maintenance history is tracked.

Table Name

vehicles

Fields
id

type: string or UUID

required: yes

unique: yes

purpose: primary identifier

created_at

type: datetime

required: yes

purpose: timestamp of record creation

device_id

type: string or UUID

required: yes

purpose: foreign key to devices.id or device identity record

name

type: string

required: yes

example:

Toyota Supra

BMW 320d

purpose: user-defined vehicle name / make and model label

year

type: integer

required: yes

purpose: vehicle production year

fuel_type

type: enum or string

required: yes

recommended values:

petrol

diesel

hybrid

electric

purpose: affects maintenance interval calculation

transmission

type: enum or string

required: yes

recommended values:

automatic

manual

purpose: descriptive vehicle attribute

current_odometer

type: integer or decimal

required: yes

purpose: current vehicle mileage used in maintenance calculations

image_url

type: string

required: no

purpose: uploaded vehicle photo

shared_link_slug

type: string

required: no

unique: yes when present

purpose: enables public vehicle history sharing

Notes

one device may own multiple vehicles in future paid tiers

free tier may restrict this to one vehicle

shared_link_slug should be nullable until sharing is enabled

5. Entity: Log Categories
Purpose

Defines top-level maintenance groups shown in the app.

These are static or admin-managed records.

Examples:

engine

transmission

fluids

brakes

wheels

electrical

HVAC

other

Table Name

log_categories

Fields
id

type: integer, string, or UUID

required: yes

unique: yes

purpose: primary identifier

category_name

type: string

required: yes

unique: yes

purpose: category label displayed in UI

image_url

type: string

required: no

purpose: icon/image used in UI

Notes

this data will likely be seeded and not created by end users

categories are used for grouping and navigation

6. Entity: Log Types
Purpose

Defines the specific maintenance items that users can log.

Each log type belongs to a maintenance category and contains the rules needed to calculate when the item is due.

Examples:

engine oil

oil filter

spark plugs

air filter

timing belt

Table Name

log_types

Fields
id

type: integer, string, or UUID

required: yes

unique: yes

purpose: primary identifier

category_id

type: integer, string, or UUID

required: yes

purpose: foreign key to log_categories.id

log_type_name

type: string

required: yes

purpose: maintenance item name shown in UI

due_type

type: enum or string

required: yes

values:

mileage

time

purpose: determines whether this item is due by distance or elapsed time

base_due

type: integer or decimal

required: yes

purpose:

if due_type = mileage, value represents km/mi interval

if due_type = time, value represents days

diesel_increment

type: decimal

required: yes

default: 1

purpose: multiplier applied to base_due for diesel vehicles

hybrid_increment

type: decimal

required: yes

default: 1

purpose: multiplier applied to base_due for hybrid vehicles

spec_name

type: string

required: no

purpose: label for the dynamic specification field in Add Log screen

Examples:

Engine oil

Plug type

Filter size

spec_placeholder

type: string

required: no

purpose: placeholder text for specification input

Examples:

5W-30

NGK Laser Iridium

Notes

these records are system-defined, not user-defined

base_due meaning depends on due_type

electric vehicles currently use base interval unless future rules are added

7. Entity: User Logs
Purpose

Stores every maintenance event recorded by a user for a specific vehicle and log type.

This is the core maintenance history table.

Table Name

user_logs

Fields
id

type: string or UUID

required: yes

unique: yes

purpose: primary identifier

created_at

type: datetime

required: yes

purpose: timestamp of record creation

vehicle_id

type: string or UUID

required: yes

purpose: foreign key to vehicles.id

log_type_id

type: integer, string, or UUID

required: yes

purpose: foreign key to log_types.id

auto_log

type: integer or decimal

required: yes

purpose: odometer value at the time the maintenance was performed

specs

type: string

required: no

purpose: user-entered specification value

Examples:

5W-30

Bosch filter

NGK plugs

notes

type: text

required: no

purpose: optional user notes for this maintenance event

change_date

type: date

required: yes

purpose: date when the maintenance action took place

Notes

one vehicle can have many logs

one log type can appear in many logs across many vehicles

latest log is used to calculate due status

8. Relationships
Devices → Vehicles

one-to-many

one device can own multiple vehicles

Vehicles → User Logs

one-to-many

one vehicle can have many maintenance logs

Log Categories → Log Types

one-to-many

one category contains many maintenance item definitions

Log Types → User Logs

one-to-many

one maintenance item definition can be referenced by many actual user logs

9. Recommended Constraints

These are recommended regardless of backend choice.

Devices

device_id must be unique

Vehicles

id must be unique

device_id must reference a valid device

shared_link_slug must be unique when present

year should be within a reasonable range

current_odometer should not be negative

Log Categories

category_name should be unique

Log Types

category_id must reference a valid category

due_type must be either mileage or time

base_due must be greater than zero

increments should default to 1

User Logs

vehicle_id must reference a valid vehicle

log_type_id must reference a valid log type

auto_log should not be negative

change_date must be valid

10. Suggested Enums

These are recommended standard values for consistency across app and backend.

fuel_type
petrol
diesel
hybrid
electric
transmission
automatic
manual
due_type
mileage
time
unit_preference
km
mi
subscription_status
free
personal_paid
reseller
11. Seed / Static Data vs User Data
Static / system-defined data

These should usually be seeded by the system:

log_categories

log_types

User-generated data

These are created during app usage:

devices

vehicles

user_logs

12. Public Share Link Data Model

The current MVP stores public sharing state directly on the vehicles table through shared_link_slug.

Current MVP approach

simple

easy to implement

enough for one public link per vehicle

Possible future expansion

If public sharing becomes more advanced, a separate table can be introduced:

vehicle_share_links

Possible fields:

id

vehicle_id

slug

is_active

created_at

expires_at

For the MVP, keeping shared_link_slug on vehicles is acceptable.

13. Recommended Future Entities

These are not required for MVP, but may be added later.

Users

If authentication is introduced:

email

auth provider

passwordless login

social login

Notifications

To track sent reminders:

notification type

vehicle_id

log_type_id

sent_at

status

Subscription Plans

To support billing tiers:

plan name

price

feature access

Spending Records / Analytics

If costs become first-class:

log cost

category spend

monthly spend summaries

14. Backend-Agnostic Implementation Notes

This schema should be treated as the product data model, not as a database-technology decision.

If using Supabase / PostgreSQL

tables can map almost directly

use foreign keys and indexes

store images in storage bucket

store public share slug in vehicles

If using Firebase

collections may mirror these entities

relationships become document references or IDs

calculation queries may need more careful shaping

If using custom backend

keep the same entity names and meanings

expose service methods aligned to this schema

15. Suggested Indexing

If using a relational database, these indexes are recommended.

Vehicles

index on device_id

unique index on shared_link_slug when present

Log Types

index on category_id

User Logs

index on vehicle_id

index on log_type_id

composite index on (vehicle_id, log_type_id)

optional index on change_date

These will help with:

loading vehicle logs fast

calculating latest maintenance item status

rendering history pages

loading public vehicle history

16. Naming Recommendation for Rebuild

For the React Native rebuild, use consistent naming across frontend and backend.

Recommended normalized names:

devices

vehicles

logCategories

logTypes

userLogs

Or if staying SQL-first:

devices

vehicles

log_categories

log_types

user_logs

Pick one convention and keep it consistent.

17. Summary

The MVP schema is built around a simple but scalable maintenance model:

a device/user owns vehicles

vehicles have maintenance logs

maintenance logs reference maintenance item definitions

maintenance items belong to categories

optional share slug exposes a public maintenance record

This model is sufficient for the MVP and can later expand into:

subscriptions

multi-vehicle plans

reseller tools

public vehicle sale pages

analytics

AI-based maintenance insights